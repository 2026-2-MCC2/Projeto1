// Administrador: aprovação de cadastros, eventos e relatórios (RF03, RF14)
import conexao from '../src/config/database.js';
import { erro, idValido } from '../utils/http.js';
import { buscarAgregados } from '../services/eventosRepo.js';
import { agora } from '../services/regras.js';

const STATUS = ['Pendente', 'Aprovado', 'Rejeitado']; // StatusSolicitacao 0, 1, 2

export async function listarCadastros(req, res) {
    const [linhas] = await conexao.query(
        `SELECT c.PK_IDConta AS id, c.Email AS email, c.Telefone AS telefone, tc.Nome AS perfil,
                COALESCE(o.Nome, f.Nome) AS nome, COALESCE(o.CNPJ, f.CNPJ) AS cnpj, f.PK_IDFornecedor AS idFornecedor,
                s.StatusSolicitacao AS status, s.Justificativa AS justificativa,
                (SELECT MIN(s0.DataHora) FROM tb_SolicitacaoConta s0 WHERE s0.idtb_Conta = c.PK_IDConta) AS criadoEm
         FROM tb_Conta c
         INNER JOIN tb_TipoConta tc ON tc.PK_IDTipoConta = c.idtb_TipoConta
         LEFT JOIN tb_Organizador o ON o.PK_IDConta = c.PK_IDConta
         LEFT JOIN tb_Fornecedor f ON f.PK_IDConta = c.PK_IDConta
         INNER JOIN tb_SolicitacaoConta s ON s.idtb_Conta = c.PK_IDConta
              AND s.PK_IDSolicitacaoConta = (SELECT MAX(s2.PK_IDSolicitacaoConta) FROM tb_SolicitacaoConta s2 WHERE s2.idtb_Conta = c.PK_IDConta)
         WHERE c.idtb_TipoConta IN (2, 3) ORDER BY c.PK_IDConta DESC`);
    const [atuacoes] = await conexao.query(
        `SELECT ft.idtb_Fornecedor AS idFornecedor, tf.Nome AS nome FROM tb_FornecedorTipo ft
         INNER JOIN tb_TipoFornecimento tf ON tf.PK_IDTipoFornecimento = ft.idtb_TipoFornecimento ORDER BY tf.Nome`);
    res.json({
        cadastros: linhas.map((l) => ({
            id: l.id, nome: l.nome, perfil: l.perfil.toLowerCase(), email: l.email, telefone: l.telefone ?? '', cnpj: l.cnpj,
            atuacao: l.idFornecedor ? atuacoes.filter((a) => a.idFornecedor === l.idFornecedor).map((a) => a.nome) : [],
            status: STATUS[l.status], justificativa: l.justificativa ?? '', criadoEm: String(l.criadoEm).slice(0, 10),
        })),
    });
}

// Aprova ou rejeita. Pendente -> atualiza a solicitação; já decidido -> registra NOVA decisão (histórico preservado)
export async function decidirCadastro(req, res) {
    if (!idValido(req.params.idConta)) return erro(res, 400, 'Identificador de conta inválido.');
    const idConta = Number(req.params.idConta);
    const novo = STATUS.indexOf(req.body?.status);
    if (novo < 1) return erro(res, 400, 'Status inválido. Use "Aprovado" ou "Rejeitado".');
    const justificativa = String(req.body?.justificativa ?? '').trim().slice(0, 255) || null;

    const [sol] = await conexao.query(
        `SELECT s.PK_IDSolicitacaoConta AS id, s.StatusSolicitacao AS status FROM tb_SolicitacaoConta s
         INNER JOIN tb_Conta c ON c.PK_IDConta = s.idtb_Conta
         WHERE s.idtb_Conta = ? AND c.idtb_TipoConta IN (2, 3) ORDER BY s.PK_IDSolicitacaoConta DESC LIMIT 1`, [idConta]);
    if (!sol.length) return erro(res, 404, 'Cadastro não encontrado.');
    if (sol[0].status === novo) return erro(res, 409, `O cadastro já está ${STATUS[novo].toLowerCase()}.`);

    if (sol[0].status === 0) {
        await conexao.query('UPDATE tb_SolicitacaoConta SET idtb_Administrador = ?, StatusSolicitacao = ?, Justificativa = ?, DataDecisao = ? WHERE PK_IDSolicitacaoConta = ?',
            [req.usuario.idAdmin, novo, justificativa, agora(), sol[0].id]);
    } else {
        await conexao.query('INSERT INTO tb_SolicitacaoConta (idtb_Conta, idtb_Administrador, DataHora, StatusSolicitacao, Justificativa, DataDecisao) VALUES (?, ?, ?, ?, ?, ?)',
            [idConta, req.usuario.idAdmin, agora(), novo, justificativa, agora()]);
    }
    res.json({ mensagem: `Cadastro ${novo === 1 ? 'aprovado' : 'rejeitado'}.` });
}

// Histórico de decisões (rastreabilidade)
export async function auditoria(req, res) {
    const [linhas] = await conexao.query(
        `SELECT s.PK_IDSolicitacaoConta AS id, s.DataDecisao AS quando, s.StatusSolicitacao AS status, s.Justificativa AS justificativa,
                a.Nome AS administrador, COALESCE(o.Nome, f.Nome) AS cadastro, c.Email AS email
         FROM tb_SolicitacaoConta s
         INNER JOIN tb_Conta c ON c.PK_IDConta = s.idtb_Conta
         LEFT JOIN tb_Administrador a ON a.PK_CodFunc = s.idtb_Administrador
         LEFT JOIN tb_Organizador o ON o.PK_IDConta = c.PK_IDConta
         LEFT JOIN tb_Fornecedor f ON f.PK_IDConta = c.PK_IDConta
         WHERE s.StatusSolicitacao <> 0 AND s.DataDecisao IS NOT NULL ORDER BY s.PK_IDSolicitacaoConta DESC LIMIT 100`);
    res.json({ decisoes: linhas.map((l) => ({ id: l.id, quando: l.quando, decisao: STATUS[l.status], justificativa: l.justificativa ?? '', administrador: l.administrador, cadastro: l.cadastro, email: l.email })) });
}

export async function listarEventosAdmin(req, res) {
    const lista = await buscarAgregados();
    const completo = req.query.completo === '1';
    res.json({ eventos: lista.map((a) => ({ ...a.evento, resumo: a.resumo, ...(completo ? { itens: a.itens, custos: a.custos, propostas: a.propostas } : {}) })) });
}

export async function resumoGeral(req, res) {
    const eventos = await buscarAgregados();
    const [cadastros] = await conexao.query(
        `SELECT c.idtb_TipoConta AS tipo, s.StatusSolicitacao AS status FROM tb_Conta c
         INNER JOIN tb_SolicitacaoConta s ON s.idtb_Conta = c.PK_IDConta
              AND s.PK_IDSolicitacaoConta = (SELECT MAX(s2.PK_IDSolicitacaoConta) FROM tb_SolicitacaoConta s2 WHERE s2.idtb_Conta = c.PK_IDConta)
         WHERE c.idtb_TipoConta IN (2, 3)`);
    const contar = (lista, chave) => Object.entries(lista.reduce((a, x) => ({ ...a, [x[chave]]: (a[x[chave]] || 0) + 1 }), {})).map(([nome, total]) => ({ nome, total }));
    const propostas = eventos.flatMap((a) => a.propostas).filter((p) => p.status !== 'Cancelada');
    res.json({
        cadastros: { total: cadastros.length, pendentes: cadastros.filter((c) => c.status === 0).length, organizadores: cadastros.filter((c) => c.tipo === 2 && c.status === 1).length, fornecedores: cadastros.filter((c) => c.tipo === 3 && c.status === 1).length },
        eventos: { total: eventos.length, porStatus: contar(eventos.map((a) => a.evento), 'status') },
        propostas: { total: propostas.length, porStatus: contar(propostas, 'status'), valorSelecionado: propostas.filter((p) => p.status === 'Selecionada').reduce((s, p) => s + p.valor, 0) },
    });
}
