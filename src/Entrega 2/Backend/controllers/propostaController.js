// Fornecedor: histórico, edição e cancelamento das próprias propostas (RF10)
import conexao from '../src/config/database.js';
import { erro, idValido } from '../utils/http.js';
import { ABERTO, statusProposta, validarProposta } from '../services/regras.js';

const dia = (v) => (v ? String(v).slice(0, 10) : null);

// Carrega a proposta SOMENTE se for do fornecedor logado
async function propostaDoFornecedor(req, res) {
    if (!idValido(req.params.id)) { erro(res, 400, 'Identificador de proposta inválido.'); return null; }
    const [linhas] = await conexao.query(
        `SELECT li.PK_IDItem AS id, li.idtb_Lista AS itemId, li.Valor AS valor, li.Descricao AS descricao, li.Validade AS validade,
                li.Observacoes AS observacoes, li.DataEnvio AS enviadaEm, li.Cancelada AS cancelada,
                lc.NomeItem AS itemDescricao, lc.idtb_ItemSelecionado AS selecionadoId, e.PK_IDEvento AS eventoId, e.Titulo AS eventoNome, e.StatusEvento AS statusEvento
         FROM tb_ListaItensFornecimentos li
         INNER JOIN tb_SolicitacaoAtend_Fornecimento sa ON sa.PK_IDSolicitacaoAtend_Fornecedor = li.idtb_SolicitacaoAtend_Fornecimento
         INNER JOIN tb_ListaComponentes lc ON lc.PK_IDLista = li.idtb_Lista
         INNER JOIN tb_Evento e ON e.PK_IDEvento = lc.idtb_Evento
         WHERE li.PK_IDItem = ? AND sa.idtb_Fornecedor = ?`, [Number(req.params.id), req.usuario.idFornecedor]);
    if (!linhas.length) { erro(res, 404, 'Proposta não encontrada.'); return null; }
    return { ...linhas[0], status: statusProposta(linhas[0]) };
}

export async function minhasPropostas(req, res) {
    const [linhas] = await conexao.query(
        `SELECT li.PK_IDItem AS id, li.idtb_Lista AS itemId, li.Valor AS valor, li.Descricao AS descricao, li.Validade AS validade,
                li.Observacoes AS observacoes, li.DataEnvio AS enviadaEm, li.Cancelada AS cancelada,
                lc.NomeItem AS itemDescricao, lc.idtb_ItemSelecionado AS selecionadoId, tf.Nome AS categoria, e.PK_IDEvento AS eventoId, e.Titulo AS eventoNome
         FROM tb_ListaItensFornecimentos li
         INNER JOIN tb_SolicitacaoAtend_Fornecimento sa ON sa.PK_IDSolicitacaoAtend_Fornecedor = li.idtb_SolicitacaoAtend_Fornecimento
         INNER JOIN tb_ListaComponentes lc ON lc.PK_IDLista = li.idtb_Lista
         INNER JOIN tb_Evento e ON e.PK_IDEvento = lc.idtb_Evento
         LEFT JOIN tb_TipoFornecimento tf ON tf.PK_IDTipoFornecimento = lc.idtb_TipoFornecimento
         WHERE sa.idtb_Fornecedor = ? ORDER BY li.PK_IDItem DESC`, [req.usuario.idFornecedor]);
    res.json({
        propostas: linhas.map((p) => ({
            id: p.id, itemId: p.itemId, eventoId: p.eventoId, eventoNome: p.eventoNome, item: p.itemDescricao, categoria: p.categoria,
            valor: Number(p.valor), descricao: p.descricao, validade: dia(p.validade), observacoes: p.observacoes ?? '', enviadaEm: dia(p.enviadaEm), status: statusProposta(p),
        })),
    });
}

export async function editarProposta(req, res) {
    const p = await propostaDoFornecedor(req, res);
    if (!p) return;
    if (p.status !== 'Enviada') return erro(res, 409, 'Só é possível editar propostas com status "Enviada".');
    if (p.statusEvento !== ABERTO) return erro(res, 409, 'A cotação deste evento não está aberta.');
    const v = validarProposta(req.body ?? {});
    if (!v.ok) return erro(res, 400, v.erro);
    await conexao.query('UPDATE tb_ListaItensFornecimentos SET Valor = ?, Descricao = ?, Validade = ?, Observacoes = ? WHERE PK_IDItem = ?',
        [v.dados.valor, v.dados.descricao, v.dados.validade, v.dados.observacoes || null, p.id]);
    res.json({ mensagem: 'Proposta atualizada.' });
}

export async function cancelarProposta(req, res) {
    const p = await propostaDoFornecedor(req, res);
    if (!p) return;
    if (p.status !== 'Enviada') return erro(res, 409, 'Só é possível cancelar propostas com status "Enviada".');
    await conexao.query('UPDATE tb_ListaItensFornecimentos SET Cancelada = 1 WHERE PK_IDItem = ?', [p.id]);
    res.json({ mensagem: 'Proposta cancelada.' });
}
