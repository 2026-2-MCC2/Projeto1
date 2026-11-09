// Leitura dos eventos com itens, custos e propostas (usada por organizador, fornecedor e administrador).
import conexao from '../src/config/database.js';
import { STATUS_EVENTO, resumoDoEvento, statusProposta } from './regras.js';

const dia = (v) => (v ? String(v).slice(0, 10) : null);
const numero = (v) => (v === null || v === undefined ? null : Number(v));

const SQL_EVENTOS = `
    SELECT e.PK_IDEvento AS id, e.Titulo AS nome, e.Descricao AS descricao, e.Local AS local,
           e.Capacidade AS publicoMax, e.PublicoMinimo AS publicoMin, e.PublicoEsperado AS publicoEsperado,
           e.MargemLucro AS margem, e.DataHora AS inicio, e.DataFim AS fim, e.StatusEvento AS statusCodigo,
           se.idtb_Organizador AS organizadorId, o.Nome AS organizadorNome, c.Email AS organizadorEmail
    FROM tb_Evento e
    INNER JOIN tb_SolicitacaoEvento se ON se.PK_IDSolicitacaoEvento = e.idtb_SolicitacaoEvento
    INNER JOIN tb_Organizador o ON o.PK_IDOrganizador = se.idtb_Organizador
    INNER JOIN tb_Conta c ON c.PK_IDConta = o.PK_IDConta`;

// filtro: { id, organizadorId, statusCodigos: [..] }
export async function buscarAgregados(filtro = {}, cx = conexao) {
    const cond = [], params = [];
    if (filtro.id) { cond.push('e.PK_IDEvento = ?'); params.push(filtro.id); }
    if (filtro.organizadorId) { cond.push('se.idtb_Organizador = ?'); params.push(filtro.organizadorId); }
    if (filtro.statusCodigos) { cond.push('e.StatusEvento IN (?)'); params.push(filtro.statusCodigos); }
    const [linhas] = await cx.query(`${SQL_EVENTOS} ${cond.length ? `WHERE ${cond.join(' AND ')}` : ''} ORDER BY e.DataHora DESC, e.PK_IDEvento DESC`, params);
    if (!linhas.length) return [];
    const ids = linhas.map((l) => l.id);

    const [itens] = await cx.query(
        `SELECT lc.PK_IDLista AS id, lc.idtb_Evento AS eventoId, lc.NomeItem AS descricao, lc.Quantidade AS quantidade,
                lc.idtb_ItemSelecionado AS selecionadoId, tf.Nome AS categoria
         FROM tb_ListaComponentes lc
         LEFT JOIN tb_TipoFornecimento tf ON tf.PK_IDTipoFornecimento = lc.idtb_TipoFornecimento
         WHERE lc.idtb_Evento IN (?) ORDER BY lc.PK_IDLista`, [ids]);
    const [custos] = await cx.query(
        `SELECT PK_IDCusto AS id, idtb_Evento AS eventoId, Tipo AS tipo, Descricao AS descricao, Valor AS valor, Cobranca AS cobranca
         FROM tb_CustoEvento WHERE idtb_Evento IN (?) ORDER BY PK_IDCusto`, [ids]);
    const [props] = await cx.query(
        `SELECT li.PK_IDItem AS id, li.idtb_Lista AS itemId, lc.idtb_Evento AS eventoId, lc.idtb_ItemSelecionado AS selecionadoId,
                li.Valor AS valor, li.Descricao AS descricao, li.Validade AS validade, li.Observacoes AS observacoes,
                li.DataEnvio AS enviadaEm, li.Cancelada AS cancelada,
                f.PK_IDFornecedor AS fornecedorId, f.Nome AS fornecedorNome, cf.Email AS fornecedorEmail
         FROM tb_ListaItensFornecimentos li
         INNER JOIN tb_ListaComponentes lc ON lc.PK_IDLista = li.idtb_Lista
         INNER JOIN tb_SolicitacaoAtend_Fornecimento sa ON sa.PK_IDSolicitacaoAtend_Fornecedor = li.idtb_SolicitacaoAtend_Fornecimento
         INNER JOIN tb_Fornecedor f ON f.PK_IDFornecedor = sa.idtb_Fornecedor
         INNER JOIN tb_Conta cf ON cf.PK_IDConta = f.PK_IDConta
         WHERE lc.idtb_Evento IN (?) ORDER BY li.PK_IDItem`, [ids]);

    return linhas.map((l) => {
        const evento = {
            id: l.id, nome: l.nome, descricao: l.descricao ?? '', local: l.local,
            inicio: dia(l.inicio), fim: dia(l.fim) ?? dia(l.inicio),
            publicoMin: numero(l.publicoMin), publicoMax: numero(l.publicoMax), publicoEsperado: numero(l.publicoEsperado),
            margem: numero(l.margem), statusCodigo: l.statusCodigo, status: STATUS_EVENTO[l.statusCodigo],
            organizadorId: l.organizadorId, organizadorNome: l.organizadorNome, organizadorEmail: l.organizadorEmail,
        };
        const meusItens = itens.filter((i) => i.eventoId === l.id).map((i) => ({ id: i.id, eventoId: i.eventoId, categoria: i.categoria ?? 'Outros', descricao: i.descricao, quantidade: i.quantidade }));
        const meusCustos = custos.filter((c) => c.eventoId === l.id).map((c) => ({ ...c, valor: Number(c.valor) }));
        const minhasProps = props.filter((p) => p.eventoId === l.id).map((p) => ({
            id: p.id, itemId: p.itemId, eventoId: p.eventoId, fornecedorId: p.fornecedorId, fornecedorNome: p.fornecedorNome,
            fornecedorEmail: p.fornecedorEmail, valor: Number(p.valor), descricao: p.descricao ?? '', validade: dia(p.validade),
            observacoes: p.observacoes ?? '', enviadaEm: dia(p.enviadaEm), status: statusProposta(p),
        }));
        const agregado = { evento, itens: meusItens, custos: meusCustos, propostas: minhasProps };
        return { ...agregado, resumo: resumoDoEvento(agregado) };
    });
}

export const buscarAgregado = async (id, cx = conexao) => (await buscarAgregados({ id }, cx))[0] ?? null;
