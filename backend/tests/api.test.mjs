// Testes de ponta a ponta da API (rotas + regras + SQL) com banco em memória. Rodar: npm run test:api
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_SECRET = 'segredo-de-teste';
const { criarPoolSqlite } = await import('./bancoSqlite.mjs');
const { usarPool, default: conexao } = await import('../src/config/database.js');
const { default: bcrypt } = await import('bcrypt');
const { default: app } = await import('../src/app.js');
const { garantirAdmin, semear, cnpjValido, SENHA_DEMO } = await import('../scripts/semear.js');

const pool = criarPoolSqlite();
usarPool(pool);
let servidor, base;
const hoje = (n = 0) => { const d = new Date(); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const chamar = async (metodo, caminho, corpo, token) => {
    const r = await fetch(`${base}${caminho}`, { method: metodo, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: corpo ? JSON.stringify(corpo) : undefined });
    return { status: r.status, dados: await r.json().catch(() => ({})) };
};
const loginEquipe = async (email, senha = SENHA_DEMO) => chamar('POST', '/api/auth/login-equipe', { email, senha });

before(async () => { servidor = app.listen(0); base = `http://localhost:${servidor.address().port}`; await garantirAdmin(conexao, bcrypt); });
after(() => servidor.close());

let admin, org, forn, palco;
const eventoBase = { nome: 'Festa Teste', inicio: hoje(20), fim: hoje(20), local: 'Salão Azul', publicoMin: 100, publicoMax: 200, publicoEsperado: 150, margem: 25 };

test('semear: cria as contas de demonstração e é repetível', async () => {
    await semear(base);
    await semear(base); // segunda vez não pode quebrar nem duplicar
    admin = (await loginEquipe('admin@trocaticket.dev')).dados.token;
    org = (await loginEquipe('organizador@trocaticket.dev')).dados.token;
    forn = (await loginEquipe('fornecedor@trocaticket.dev')).dados.token;
    palco = (await loginEquipe('contato@palcoseguro.com')).dados.token;
    assert.ok(admin && org && forn && palco);
    const { dados } = await chamar('GET', '/api/eventos', null, org);
    assert.equal(dados.eventos.length, 2);
    const aberto = dados.eventos.find((e) => e.nome === 'Festival Indie Universitário');
    assert.equal(aberto.status, 'Aberto para cotação');
    assert.equal(aberto.resumo.propostasAtivas, 3);
});

test('rotas básicas e autenticação', async () => {
    assert.equal((await chamar('GET', '/')).status, 200);
    assert.equal((await chamar('GET', '/nao-existe')).status, 404);
    assert.equal((await chamar('GET', '/api/eventos')).status, 401);              // sem token
    assert.equal((await chamar('GET', '/api/eventos', null, 'token-invalido')).status, 401);
    assert.equal((await chamar('GET', '/api/eventos', null, forn)).status, 403);  // perfil errado
    assert.equal((await chamar('GET', '/api/admin/cadastros', null, org)).status, 403);
    assert.equal((await chamar('GET', '/api/cotacoes', null, org)).status, 403);
    const r = await fetch(`${base}/api/auth/login-equipe`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{quebrado' });
    assert.equal(r.status, 400);
});

test('cadastro de parceiro: validações, pendente, aprovação e rejeição', async () => {
    const ok = { role: 'organizador', nome: 'Maria Souza', email: 'Maria@Eventos.com', cnpj: cnpjValido('555666770001'), senha: 'senha1234' };
    assert.equal((await chamar('POST', '/api/auth/cadastro-parceiro', { ...ok, cnpj: '123' })).status, 400);
    assert.equal((await chamar('POST', '/api/auth/cadastro-parceiro', { ...ok, senha: '123' })).status, 400);
    assert.equal((await chamar('POST', '/api/auth/cadastro-parceiro', { ...ok, role: 'cliente' })).status, 400);
    assert.equal((await chamar('POST', '/api/auth/cadastro-parceiro', { ...ok, role: 'fornecedor', atuacao: [] })).status, 400);
    const criado = await chamar('POST', '/api/auth/cadastro-parceiro', ok);
    assert.equal(criado.status, 201);
    assert.equal(criado.dados.usuario.status, 'Pendente');
    assert.equal((await chamar('POST', '/api/auth/cadastro-parceiro', { ...ok, cnpj: cnpjValido('555666780001') })).status, 409); // e-mail repetido
    assert.equal((await chamar('POST', '/api/auth/cadastro-parceiro', { ...ok, email: 'novo@email.com' })).status, 409); // CNPJ repetido

    assert.equal((await loginEquipe('maria@eventos.com', 'senha1234')).status, 403);   // pendente
    assert.equal((await loginEquipe('maria@eventos.com', 'errada123')).status, 401);   // senha errada não revela status

    const id = criado.dados.usuario.idConta;
    assert.equal((await chamar('PATCH', `/api/admin/cadastros/${id}`, { status: 'Pendente' }, admin)).status, 400);
    assert.equal((await chamar('PATCH', `/api/admin/cadastros/${id}`, { status: 'Aprovado', justificativa: 'ok' }, admin)).status, 200);
    assert.equal((await chamar('PATCH', `/api/admin/cadastros/${id}`, { status: 'Aprovado' }, admin)).status, 409);
    const entrou = await loginEquipe('maria@eventos.com', 'senha1234');
    assert.equal(entrou.status, 200);
    assert.equal(entrou.dados.usuario.perfil, 'organizador');

    // reconsideração: rejeitar depois de aprovar cria NOVA decisão (histórico preservado)
    assert.equal((await chamar('PATCH', `/api/admin/cadastros/${id}`, { status: 'Rejeitado', justificativa: 'documentos' }, admin)).status, 200);
    assert.equal((await loginEquipe('maria@eventos.com', 'senha1234')).status, 403);
    const hist = (await chamar('GET', '/api/admin/auditoria', null, admin)).dados.decisoes.filter((d) => d.email === 'maria@eventos.com');
    assert.deepEqual(hist.map((d) => d.decisao), ['Rejeitado', 'Aprovado']);
    assert.equal(hist[0].administrador, 'Admin');
});

test('organizador: ciclo do evento, itens, custos e validações', async () => {
    assert.equal((await chamar('POST', '/api/eventos', { ...eventoBase, fim: hoje(10) }, org)).status, 400);
    assert.equal((await chamar('POST', '/api/eventos', { ...eventoBase, publicoMax: 50 }, org)).status, 400);
    assert.equal((await chamar('POST', '/api/eventos', { ...eventoBase, margem: 100 }, org)).status, 400);
    const criado = await chamar('POST', '/api/eventos', eventoBase, org);
    assert.equal(criado.status, 201);
    const id = criado.dados.id;

    assert.equal((await chamar('PATCH', `/api/eventos/${id}/status`, { status: 'Aberto para cotação' }, org)).status, 409); // sem itens
    assert.equal((await chamar('POST', `/api/eventos/${id}/itens`, { categoria: 'Xis', descricao: 'Som', quantidade: 1 }, org)).status, 400);
    assert.equal((await chamar('POST', `/api/eventos/${id}/itens`, { categoria: 'Som', descricao: 'Som', quantidade: 0 }, org)).status, 400);
    const item = await chamar('POST', `/api/eventos/${id}/itens`, { categoria: 'Som', descricao: 'Sistema de som', quantidade: 1 }, org);
    assert.equal(item.status, 201);
    assert.equal((await chamar('POST', `/api/eventos/${id}/custos`, { tipo: 'Fiscal', descricao: 'Impostos', valor: 1000, cobranca: 'total' }, org)).status, 201);
    assert.equal((await chamar('POST', `/api/eventos/${id}/custos`, { tipo: 'Variável', descricao: 'Pulseira', valor: 2, cobranca: 'pessoa' }, org)).status, 201);
    assert.equal((await chamar('POST', `/api/eventos/${id}/custos`, { tipo: 'Xis', descricao: 'Pulseira', valor: 2, cobranca: 'pessoa' }, org)).status, 400);

    assert.equal((await chamar('PATCH', `/api/eventos/${id}/status`, { status: 'Orçamento fechado' }, org)).status, 409); // transição inválida
    assert.equal((await chamar('PATCH', `/api/eventos/${id}/status`, { status: 'Aberto para cotação' }, org)).status, 200);
    assert.equal((await chamar('PUT', `/api/eventos/${id}`, { ...eventoBase, nome: 'Festa Teste 2' }, org)).status, 200);

    const det = (await chamar('GET', `/api/eventos/${id}`, null, org)).dados;
    assert.equal(det.evento.nome, 'Festa Teste 2');
    assert.equal(det.evento.status, 'Aberto para cotação');
    assert.equal(det.itens.length, 1);
    assert.equal(det.custos.length, 2);

    // outro organizador não enxerga nem altera
    const outro = await chamar('POST', '/api/auth/cadastro-parceiro', { role: 'organizador', nome: 'Outro Org', email: 'outro@org.com', cnpj: cnpjValido('777888990001'), senha: 'senha1234' });
    await chamar('PATCH', `/api/admin/cadastros/${outro.dados.usuario.idConta}`, { status: 'Aprovado' }, admin);
    const tokenOutro = (await loginEquipe('outro@org.com', 'senha1234')).dados.token;
    assert.equal((await chamar('GET', `/api/eventos/${id}`, null, tokenOutro)).status, 404);
    assert.equal((await chamar('DELETE', `/api/eventos/${id}`, null, tokenOutro)).status, 404);
    assert.equal((await chamar('GET', '/api/eventos/abc', null, org)).status, 400);
    assert.equal((await chamar('GET', '/api/eventos', null, tokenOutro)).dados.eventos.length, 0);

    globalThis.eventoTeste = { id, itemId: item.dados.id };
});

test('fornecedor: cotação, propostas, privacidade e regras de edição', async () => {
    const { id, itemId } = globalThis.eventoTeste;
    const lista = (await chamar('GET', '/api/cotacoes', null, forn)).dados.eventos;
    const meu = lista.find((e) => e.id === id);
    assert.ok(meu);
    assert.equal(meu.margem, undefined);             // fornecedor não vê a margem
    assert.equal(meu.custos, undefined);
    assert.equal((await chamar('GET', '/api/cotacoes?categoria=Som', null, forn)).dados.eventos.some((e) => e.id === id), true);
    assert.equal((await chamar('GET', '/api/cotacoes?busca=inexistente', null, forn)).dados.eventos.length, 0);

    const caminho = `/api/cotacoes/${id}/itens/${itemId}/propostas`;
    assert.equal((await chamar('POST', caminho, { valor: 0, descricao: 'Som completo', validade: hoje(5) }, forn)).status, 400);
    assert.equal((await chamar('POST', caminho, { valor: 100, descricao: 'Som completo', validade: hoje(-1) }, forn)).status, 400);
    assert.equal((await chamar('POST', caminho, { valor: 100, descricao: 'Som completo', validade: hoje(5) }, org)).status, 403);
    assert.equal((await chamar('POST', `/api/cotacoes/${id}/itens/99999/propostas`, { valor: 100, descricao: 'Som completo', validade: hoje(5) }, forn)).status, 404);
    const p1 = await chamar('POST', caminho, { valor: 3000, descricao: 'Som completo', validade: hoje(5) }, forn);
    assert.equal(p1.status, 201);
    assert.equal((await chamar('POST', caminho, { valor: 2900, descricao: 'Som completo', validade: hoje(5) }, forn)).status, 409); // duplicada
    const p2 = await chamar('POST', caminho, { valor: '2500,50', descricao: 'Som + técnico', validade: hoje(7) }, palco);
    assert.equal(p2.status, 201);

    // o concorrente não vê a proposta do outro
    const cot = (await chamar('GET', `/api/cotacoes/${id}`, null, forn)).dados;
    assert.equal(cot.itens[0].totalPropostas, 2);
    assert.equal(cot.itens[0].minhaProposta.valor, 3000);
    assert.equal(cot.evento.margem, undefined);
    assert.equal((await chamar('PUT', `/api/propostas/${p2.dados.id}`, { valor: 1, descricao: 'abc', validade: hoje(5) }, forn)).status, 404); // proposta alheia

    assert.equal((await chamar('PUT', `/api/propostas/${p1.dados.id}`, { valor: 2800, descricao: 'Som completo v2', validade: hoje(6) }, forn)).status, 200);
    const minhas = (await chamar('GET', '/api/propostas/minhas', null, forn)).dados.propostas;
    assert.equal(minhas.find((p) => p.id === p1.dados.id).valor, 2800);

    // cancelar e reenviar (reativa a mesma linha)
    assert.equal((await chamar('POST', `/api/propostas/${p1.dados.id}/cancelar`, null, forn)).status, 200);
    assert.equal((await chamar('POST', `/api/propostas/${p1.dados.id}/cancelar`, null, forn)).status, 409);
    const reenvio = await chamar('POST', caminho, { valor: 2950, descricao: 'Som completo v3', validade: hoje(8) }, forn);
    assert.equal(reenvio.status, 201);
    assert.equal(reenvio.dados.id, p1.dados.id);

    globalThis.eventoTeste.p1 = p1.dados.id;
    globalThis.eventoTeste.p2 = p2.dados.id;
});

test('seleção de proposta, consolidação e ticket', async () => {
    const { id, itemId, p1, p2 } = globalThis.eventoTeste;
    assert.equal((await chamar('POST', `/api/eventos/${id}/propostas/99999/selecionar`, null, org)).status, 404);
    assert.equal((await chamar('POST', `/api/eventos/${id}/propostas/${p2}/selecionar`, null, org)).status, 200);
    const det = (await chamar('GET', `/api/eventos/${id}`, null, org)).dados;
    assert.equal(det.propostas.find((p) => p.id === p2).status, 'Selecionada');
    assert.equal(det.propostas.find((p) => p.id === p1).status, 'Não selecionada');
    assert.equal((await chamar('POST', `/api/eventos/${id}/propostas/${p1}/selecionar`, null, org)).status, 409); // só uma por item

    // custo fixo = 2500,50 + 1000 ; por pessoa = 2 ; esperado 150 -> 3800,50 / (150 x 0,75) = 33,79
    const t = (await chamar('GET', `/api/eventos/${id}/ticket`, null, org)).dados;
    assert.equal(t.orcamento.custoFixo, 3500.5);
    assert.equal(t.orcamento.itensSemProposta.length, 0);
    assert.deepEqual(t.cenarios.map((c) => c.chave), ['min', 'esp', 'max']);
    assert.equal(t.cenarios.find((c) => c.chave === 'esp').ticketAlvo, 33.79);
    assert.ok(t.serie.length > 3);

    // fornecedor não pode mexer em proposta já decidida
    assert.equal((await chamar('PUT', `/api/propostas/${p2}`, { valor: 1, descricao: 'abc', validade: hoje(5) }, palco)).status, 409);
    assert.equal((await chamar('POST', `/api/propostas/${p2}/cancelar`, null, palco)).status, 409);

    assert.equal((await chamar('DELETE', `/api/eventos/${id}/itens/${itemId}/selecao`, null, org)).status, 200);
    assert.equal((await chamar('GET', `/api/eventos/${id}`, null, org)).dados.propostas.find((p) => p.id === p2).status, 'Enviada');
    assert.equal((await chamar('POST', `/api/eventos/${id}/propostas/${p2}/selecionar`, null, org)).status, 200);
});

test('fechamento trava edições e fornecedor deixa de propor', async () => {
    const { id, itemId } = globalThis.eventoTeste;
    assert.equal((await chamar('PATCH', `/api/eventos/${id}/status`, { status: 'Cotação encerrada' }, org)).status, 200);
    assert.equal((await chamar('POST', `/api/cotacoes/${id}/itens/${itemId}/propostas`, { valor: 10, descricao: 'abc', validade: hoje(5) }, forn)).status, 409);
    assert.equal((await chamar('PATCH', `/api/eventos/${id}/status`, { status: 'Orçamento fechado' }, org)).status, 200);
    assert.equal((await chamar('POST', `/api/eventos/${id}/custos`, { tipo: 'Fiscal', descricao: 'Extra', valor: 10, cobranca: 'total' }, org)).status, 409);
    assert.equal((await chamar('PUT', `/api/eventos/${id}`, eventoBase, org)).status, 409);
    assert.equal((await chamar('DELETE', `/api/eventos/${id}/itens/${itemId}`, null, org)).status, 409);
    assert.equal((await chamar('PATCH', `/api/eventos/${id}/status`, { status: 'Cotação encerrada' }, org)).status, 200); // reabrir
});

test('administrador: visão geral, relatórios e cadastros', async () => {
    const eventos = (await chamar('GET', '/api/admin/eventos', null, admin)).dados.eventos;
    assert.ok(eventos.length >= 3);
    assert.ok(eventos.every((e) => e.resumo && e.organizadorNome));
    const completos = (await chamar('GET', '/api/admin/eventos?completo=1', null, admin)).dados.eventos;
    assert.ok(completos.every((e) => Array.isArray(e.itens) && Array.isArray(e.custos) && Array.isArray(e.propostas)));
    assert.equal((await chamar('GET', '/api/eventos?completo=1', null, org)).dados.eventos.every((e) => Array.isArray(e.itens)), true);
    const resumo = (await chamar('GET', '/api/admin/resumo', null, admin)).dados;
    assert.equal(resumo.cadastros.pendentes, 2);   // contato@noiteviva.com e contato@luzesom.com
    assert.ok(resumo.propostas.total >= 5);
    const cad = (await chamar('GET', '/api/admin/cadastros', null, admin)).dados.cadastros;
    const luz = cad.find((c) => c.email === 'contato@luzesom.com');
    assert.equal(luz.status, 'Pendente');
    assert.deepEqual(luz.atuacao, ['Iluminação', 'Som']);
});

test('excluir evento remove tudo, sem registros órfãos', async () => {
    const { id } = globalThis.eventoTeste;
    assert.equal((await chamar('DELETE', `/api/eventos/${id}`, null, org)).status, 200);
    assert.equal((await chamar('GET', `/api/eventos/${id}`, null, org)).status, 404);
    const contar = (tabela, onde = '') => pool.db.prepare(`SELECT COUNT(*) AS n FROM ${tabela} ${onde}`).get().n;
    assert.equal(contar('tb_ListaComponentes', `WHERE idtb_Evento = ${id}`), 0);
    assert.equal(contar('tb_CustoEvento', `WHERE idtb_Evento = ${id}`), 0);
    assert.equal(contar('tb_ListaItensFornecimentos', 'WHERE idtb_Lista NOT IN (SELECT PK_IDLista FROM tb_ListaComponentes)'), 0);
    assert.equal(contar('tb_SolicitacaoAtend_Fornecimento', 'WHERE idtb_Evento NOT IN (SELECT PK_IDEvento FROM tb_Evento)'), 0);
    assert.equal(contar('tb_SolicitacaoEvento', 'WHERE PK_IDSolicitacaoEvento NOT IN (SELECT idtb_SolicitacaoEvento FROM tb_Evento)'), 0);
});

test('cliente: cadastro e login continuam funcionando (back-end original)', async () => {
    const r = await chamar('POST', '/api/auth/login', { email: 'cliente@trocaticket.dev', senha: SENHA_DEMO });
    assert.equal(r.status, 200);
    assert.equal(r.dados.usuario.perfil, 'cliente');
    assert.equal((await chamar('POST', '/api/auth/login-equipe', { email: 'cliente@trocaticket.dev', senha: SENHA_DEMO })).status, 401); // cliente não entra pela equipe
    const perfil = await chamar('GET', '/api/auth/perfil', null, r.dados.token);
    assert.equal(perfil.status, 200);
});
