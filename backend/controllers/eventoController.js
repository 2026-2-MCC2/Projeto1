// Organizador: eventos, itens de custo, custos próprios, seleção de propostas e ticket (RF05, RF06, RF07, RF11, RF12, RF13)
import conexao from '../src/config/database.js';
import { comTransacao } from '../utils/transacao.js';
import { erro, idValido } from '../utils/http.js';
import { buscarAgregado, buscarAgregados } from '../services/eventosRepo.js';
import {
    STATUS_EVENTO, TRANSICOES, RASCUNHO, ABERTO, FECHADO, agora, hojeISO,
    validarEvento, validarItem, validarCusto, consolidar, cenarios, serieTicket, orcamentoParaJson
} from '../services/regras.js';

// Carrega o evento e garante que pertence ao organizador logado (senão 404, para não revelar que existe)
async function eventoDoOrganizador(req, res) {
    if (!idValido(req.params.id)) { erro(res, 400, 'Identificador de evento inválido.'); return null; }
    const ag = await buscarAgregado(Number(req.params.id));
    if (!ag || ag.evento.organizadorId !== req.usuario.idOrganizador) { erro(res, 404, 'Evento não encontrado.'); return null; }
    return ag;
}
const travado = (ag, res) => ag.evento.statusCodigo === FECHADO && (erro(res, 409, 'Orçamento fechado: reabra a cotação para alterar.'), true);

const detalhe = (ag) => {
    const orc = consolidar(ag);
    return { evento: ag.evento, itens: ag.itens, custos: ag.custos, propostas: ag.propostas, resumo: ag.resumo, orcamento: orcamentoParaJson(orc), cenarios: cenarios(ag.evento, orc) };
};

export async function listarEventos(req, res) {
    const lista = await buscarAgregados({ organizadorId: req.usuario.idOrganizador });
    // ?completo=1 inclui itens, custos e propostas de cada evento (evita várias chamadas)
    const completo = req.query.completo === '1';
    res.json({ eventos: lista.map((a) => ({ ...a.evento, resumo: a.resumo, ...(completo ? { itens: a.itens, custos: a.custos, propostas: a.propostas } : {}) })) });
}

export async function criarEvento(req, res) {
    const v = validarEvento(req.body ?? {});
    if (!v.ok) return erro(res, 400, v.erro);
    const d = v.dados;
    const id = await comTransacao(async (cx) => {
        const [sol] = await cx.query('INSERT INTO tb_SolicitacaoEvento (idtb_Organizador, DataHora, Status) VALUES (?, ?, 1)', [req.usuario.idOrganizador, agora()]);
        const [ev] = await cx.query(
            `INSERT INTO tb_Evento (idtb_SolicitacaoEvento, Titulo, Descricao, Local, Capacidade, PublicoMinimo, PublicoEsperado, DataHora, DataFim, MargemLucro, StatusEvento)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [sol.insertId, d.nome, d.descricao || null, d.local, d.publicoMax, d.publicoMin, d.publicoEsperado, `${d.inicio} 00:00:00`, `${d.fim} 00:00:00`, d.margem, RASCUNHO]);
        return ev.insertId;
    });
    res.status(201).json({ mensagem: 'Evento criado como rascunho.', id });
}

export async function obterEvento(req, res) {
    const ag = await eventoDoOrganizador(req, res);
    if (ag) res.json(detalhe(ag));
}

export async function atualizarEvento(req, res) {
    const ag = await eventoDoOrganizador(req, res);
    if (!ag || travado(ag, res)) return;
    const v = validarEvento(req.body ?? {});
    if (!v.ok) return erro(res, 400, v.erro);
    const d = v.dados;
    await conexao.query(
        `UPDATE tb_Evento SET Titulo = ?, Descricao = ?, Local = ?, Capacidade = ?, PublicoMinimo = ?, PublicoEsperado = ?, DataHora = ?, DataFim = ?, MargemLucro = ?
         WHERE PK_IDEvento = ?`,
        [d.nome, d.descricao || null, d.local, d.publicoMax, d.publicoMin, d.publicoEsperado, `${d.inicio} 00:00:00`, `${d.fim} 00:00:00`, d.margem, ag.evento.id]);
    res.json({ mensagem: 'Evento atualizado.', id: ag.evento.id });
}

export async function alterarStatus(req, res) {
    const ag = await eventoDoOrganizador(req, res);
    if (!ag) return;
    const novo = STATUS_EVENTO.indexOf(req.body?.status);
    if (novo < 0) return erro(res, 400, `Status inválido. Use: ${STATUS_EVENTO.join(', ')}.`);
    if (!TRANSICOES[ag.evento.statusCodigo].includes(novo)) return erro(res, 409, `Não é possível ir de "${ag.evento.status}" para "${STATUS_EVENTO[novo]}".`);
    if (novo === ABERTO && !ag.itens.length) return erro(res, 409, 'Cadastre pelo menos um item de custo antes de abrir para cotação.');
    await comTransacao(async (cx) => {
        if (novo === RASCUNHO) { // voltar a rascunho cancela as propostas ainda em aberto
            const abertas = ag.propostas.filter((p) => p.status === 'Enviada').map((p) => p.id);
            if (abertas.length) await cx.query('UPDATE tb_ListaItensFornecimentos SET Cancelada = 1 WHERE PK_IDItem IN (?)', [abertas]);
        }
        await cx.query('UPDATE tb_Evento SET StatusEvento = ? WHERE PK_IDEvento = ?', [novo, ag.evento.id]);
    });
    res.json({ mensagem: `Status alterado para "${STATUS_EVENTO[novo]}".` });
}

export async function excluirEvento(req, res) {
    const ag = await eventoDoOrganizador(req, res);
    if (!ag) return;
    const id = ag.evento.id;
    // Ordem importa por causa das chaves estrangeiras (sem registros órfãos)
    await comTransacao(async (cx) => {
        const [sol] = await cx.query('SELECT idtb_SolicitacaoEvento AS id FROM tb_Evento WHERE PK_IDEvento = ?', [id]);
        await cx.query('UPDATE tb_ListaComponentes SET idtb_ItemSelecionado = NULL WHERE idtb_Evento = ?', [id]);
        await cx.query('DELETE FROM tb_ListaItensFornecimentos WHERE idtb_Lista IN (SELECT PK_IDLista FROM tb_ListaComponentes WHERE idtb_Evento = ?)', [id]);
        await cx.query('DELETE FROM tb_SolicitacaoAtend_Fornecimento WHERE idtb_Evento = ?', [id]);
        await cx.query('DELETE FROM tb_ListaComponentes WHERE idtb_Evento = ?', [id]);
        await cx.query('DELETE FROM tb_CustoEvento WHERE idtb_Evento = ?', [id]);
        await cx.query('DELETE FROM tb_Evento WHERE PK_IDEvento = ?', [id]);
        await cx.query('DELETE FROM tb_SolicitacaoEvento WHERE PK_IDSolicitacaoEvento = ?', [sol[0].id]);
    });
    res.json({ mensagem: 'Evento excluído.' });
}

// ----- itens de composição de custo -----
export async function adicionarItem(req, res) {
    const ag = await eventoDoOrganizador(req, res);
    if (!ag || travado(ag, res)) return;
    const v = validarItem(req.body ?? {});
    if (!v.ok) return erro(res, 400, v.erro);
    const [tipos] = await conexao.query('SELECT PK_IDTipoFornecimento AS id FROM tb_TipoFornecimento WHERE Nome = ?', [v.dados.categoria]);
    if (!tipos.length) return erro(res, 400, 'Categoria não cadastrada no banco. Rode o script BD/02_planejamento.sql.');
    const [r] = await conexao.query(
        'INSERT INTO tb_ListaComponentes (idtb_Evento, NomeItem, Quantidade, idtb_TipoFornecimento) VALUES (?, ?, ?, ?)',
        [ag.evento.id, v.dados.descricao, v.dados.quantidade, tipos[0].id]);
    res.status(201).json({ mensagem: 'Item adicionado.', id: r.insertId });
}

export async function removerItem(req, res) {
    const ag = await eventoDoOrganizador(req, res);
    if (!ag || travado(ag, res)) return;
    if (!idValido(req.params.itemId) || !ag.itens.some((i) => i.id === Number(req.params.itemId))) return erro(res, 404, 'Item não encontrado neste evento.');
    const itemId = Number(req.params.itemId);
    await comTransacao(async (cx) => {
        await cx.query('UPDATE tb_ListaComponentes SET idtb_ItemSelecionado = NULL WHERE PK_IDLista = ?', [itemId]);
        await cx.query('DELETE FROM tb_ListaItensFornecimentos WHERE idtb_Lista = ?', [itemId]);
        await cx.query('DELETE FROM tb_ListaComponentes WHERE PK_IDLista = ?', [itemId]);
    });
    res.json({ mensagem: 'Item removido.' });
}

// ----- custos próprios do evento -----
export async function adicionarCusto(req, res) {
    const ag = await eventoDoOrganizador(req, res);
    if (!ag || travado(ag, res)) return;
    const v = validarCusto(req.body ?? {});
    if (!v.ok) return erro(res, 400, v.erro);
    const [r] = await conexao.query('INSERT INTO tb_CustoEvento (idtb_Evento, Tipo, Descricao, Valor, Cobranca) VALUES (?, ?, ?, ?, ?)',
        [ag.evento.id, v.dados.tipo, v.dados.descricao, v.dados.valor, v.dados.cobranca]);
    res.status(201).json({ mensagem: 'Custo adicionado.', id: r.insertId });
}

export async function removerCusto(req, res) {
    const ag = await eventoDoOrganizador(req, res);
    if (!ag || travado(ag, res)) return;
    if (!idValido(req.params.custoId) || !ag.custos.some((c) => c.id === Number(req.params.custoId))) return erro(res, 404, 'Custo não encontrado neste evento.');
    await conexao.query('DELETE FROM tb_CustoEvento WHERE PK_IDCusto = ?', [Number(req.params.custoId)]);
    res.json({ mensagem: 'Custo removido.' });
}

// ----- seleção de propostas (um fornecedor por item) -----
export async function selecionarProposta(req, res) {
    const ag = await eventoDoOrganizador(req, res);
    if (!ag || travado(ag, res)) return;
    const prop = idValido(req.params.propostaId) && ag.propostas.find((p) => p.id === Number(req.params.propostaId));
    if (!prop) return erro(res, 404, 'Proposta não encontrada neste evento.');
    if (prop.status !== 'Enviada') return erro(res, 409, 'Só é possível selecionar propostas com status "Enviada".');
    if (prop.validade < hojeISO()) return erro(res, 409, 'Esta proposta está vencida.');
    await conexao.query('UPDATE tb_ListaComponentes SET idtb_ItemSelecionado = ? WHERE PK_IDLista = ?', [prop.id, prop.itemId]);
    res.json({ mensagem: 'Proposta selecionada.' });
}

export async function desfazerSelecao(req, res) {
    const ag = await eventoDoOrganizador(req, res);
    if (!ag || travado(ag, res)) return;
    if (!idValido(req.params.itemId) || !ag.itens.some((i) => i.id === Number(req.params.itemId))) return erro(res, 404, 'Item não encontrado neste evento.');
    await conexao.query('UPDATE tb_ListaComponentes SET idtb_ItemSelecionado = NULL WHERE PK_IDLista = ?', [Number(req.params.itemId)]);
    res.json({ mensagem: 'Seleção desfeita.' });
}

// ----- ticket (RF13) -----
export async function calcularTicketDoEvento(req, res) {
    const ag = await eventoDoOrganizador(req, res);
    if (!ag) return;
    const orc = consolidar(ag);
    res.json({ orcamento: orcamentoParaJson(orc), cenarios: cenarios(ag.evento, orc), serie: serieTicket(ag.evento, orc) });
}
