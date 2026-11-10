// Fornecedor: eventos abertos para cotação e envio de propostas (RF08, RF09, RF10)
import conexao from '../src/config/database.js';
import { comTransacao } from '../utils/transacao.js';
import { erro, idValido } from '../utils/http.js';
import { buscarAgregado, buscarAgregados } from '../services/eventosRepo.js';
import { ABERTO, RASCUNHO, agora, validarProposta } from '../services/regras.js';

// O fornecedor NÃO vê margem, custos nem propostas de concorrentes.
const eventoPublico = (e) => ({ id: e.id, nome: e.nome, descricao: e.descricao, local: e.local, inicio: e.inicio, fim: e.fim, publicoMin: e.publicoMin, publicoMax: e.publicoMax, status: e.status });
const minhaProposta = (ag, itemId, idFornecedor) => ag.propostas.find((p) => p.itemId === itemId && p.fornecedorId === idFornecedor && p.status !== 'Cancelada');
const propostaPublica = (p) => ({ id: p.id, itemId: p.itemId, valor: p.valor, descricao: p.descricao, validade: p.validade, observacoes: p.observacoes, enviadaEm: p.enviadaEm, status: p.status });

export async function listarCotacoes(req, res) {
    const { categoria, busca } = req.query;
    const lista = await buscarAgregados({ statusCodigos: [ABERTO] });
    const termo = String(busca ?? '').trim().toLocaleLowerCase('pt-BR');
    const eventos = lista
        .filter((a) => !categoria || a.itens.some((i) => i.categoria === categoria))
        .filter((a) => !termo || `${a.evento.nome} ${a.evento.local}`.toLocaleLowerCase('pt-BR').includes(termo))
        .map((a) => ({
            ...eventoPublico(a.evento),
            totalItens: a.itens.length,
            categorias: [...new Set(a.itens.map((i) => i.categoria))],
            minhasPropostas: a.propostas.filter((p) => p.fornecedorId === req.usuario.idFornecedor && p.status !== 'Cancelada').length,
        }));
    res.json({ eventos });
}

export async function obterCotacao(req, res) {
    if (!idValido(req.params.eventoId)) return erro(res, 400, 'Identificador de evento inválido.');
    const ag = await buscarAgregado(Number(req.params.eventoId));
    if (!ag || ag.evento.statusCodigo === RASCUNHO) return erro(res, 404, 'Evento não disponível para cotação.');
    res.json({
        evento: eventoPublico(ag.evento),
        itens: ag.itens.map((i) => {
            const minha = minhaProposta(ag, i.id, req.usuario.idFornecedor);
            return { ...i, totalPropostas: ag.propostas.filter((p) => p.itemId === i.id && p.status !== 'Cancelada').length, minhaProposta: minha ? propostaPublica(minha) : null };
        }),
    });
}

export async function enviarProposta(req, res) {
    if (!idValido(req.params.eventoId) || !idValido(req.params.itemId)) return erro(res, 400, 'Identificador inválido.');
    const ag = await buscarAgregado(Number(req.params.eventoId));
    if (!ag || ag.evento.statusCodigo === RASCUNHO) return erro(res, 404, 'Evento não disponível para cotação.');
    if (ag.evento.statusCodigo !== ABERTO) return erro(res, 409, 'Este evento não está aberto para cotação.');
    const itemId = Number(req.params.itemId);
    const item = ag.itens.find((i) => i.id === itemId);
    if (!item) return erro(res, 404, 'Item não encontrado neste evento.');
    const v = validarProposta(req.body ?? {});
    if (!v.ok) return erro(res, 400, v.erro);
    const d = v.dados;
    const idFornecedor = req.usuario.idFornecedor;

    const id = await comTransacao(async (cx) => {
        // 1 solicitação de atendimento por fornecedor x evento (UNIQUE no banco)
        let [sa] = await cx.query('SELECT PK_IDSolicitacaoAtend_Fornecedor AS id FROM tb_SolicitacaoAtend_Fornecimento WHERE idtb_Fornecedor = ? AND idtb_Evento = ?', [idFornecedor, ag.evento.id]);
        if (!sa.length) {
            const [novo] = await cx.query('INSERT INTO tb_SolicitacaoAtend_Fornecimento (idtb_Fornecedor, idtb_Evento, DataHora, Status) VALUES (?, ?, ?, 0)', [idFornecedor, ag.evento.id, agora()]);
            sa = [{ id: novo.insertId }];
        }
        const [existente] = await cx.query('SELECT PK_IDItem AS id, Cancelada AS cancelada FROM tb_ListaItensFornecimentos WHERE idtb_SolicitacaoAtend_Fornecimento = ? AND idtb_Lista = ?', [sa[0].id, itemId]);
        if (existente.length && !existente[0].cancelada) return null; // já existe proposta ativa
        if (existente.length) { // proposta cancelada antes: reativa a mesma linha (UNIQUE solicitação x item)
            await cx.query('UPDATE tb_ListaItensFornecimentos SET Valor = ?, Descricao = ?, Validade = ?, Observacoes = ?, DataEnvio = ?, Cancelada = 0 WHERE PK_IDItem = ?',
                [d.valor, d.descricao, d.validade, d.observacoes || null, agora(), existente[0].id]);
            return existente[0].id;
        }
        const [tipos] = await cx.query('SELECT idtb_TipoFornecimento AS id FROM tb_ListaComponentes WHERE PK_IDLista = ?', [itemId]);
        const [ins] = await cx.query(
            `INSERT INTO tb_ListaItensFornecimentos (idtb_SolicitacaoAtend_Fornecimento, idtb_Lista, idtb_TipoFornecimento, Valor, Quantidade, Descricao, Validade, Observacoes, DataEnvio, Cancelada)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
            [sa[0].id, itemId, tipos[0]?.id ?? null, d.valor, item.quantidade, d.descricao, d.validade, d.observacoes || null, agora()]);
        return ins.insertId;
    });
    if (id === null) return erro(res, 409, 'Você já enviou uma proposta para este item. Edite ou cancele a existente.');
    res.status(201).json({ mensagem: 'Proposta enviada.', id });
}
