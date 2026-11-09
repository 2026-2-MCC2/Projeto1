// Chamadas à API do planejamento (back-end Node/Express + MySQL). Documentação das rotas: backend/README.md
//  - leituras: lançam Error quando falham (use com useApi)
//  - acoes: nunca lançam; devolvem { ok, erro, ...dados } (use em formulários e botões)
import { comoResultado, requisitar } from '../../../shared/api/http.js';

const q = (params = {}) => {
  const itens = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '' && v !== 'Todas');
  return itens.length ? `?${new URLSearchParams(itens)}` : '';
};
const m = (metodo, corpo) => ({ metodo, corpo });

export const leituras = {
  // organizador
  eventosDoOrganizador: ({ completo = false } = {}) => requisitar(`/api/eventos${completo ? '?completo=1' : ''}`),
  eventoDoOrganizador: (id) => requisitar(`/api/eventos/${id}`),
  // fornecedor
  cotacoes: (filtros) => requisitar(`/api/cotacoes${q(filtros)}`),
  cotacao: (eventoId) => requisitar(`/api/cotacoes/${eventoId}`),
  minhasPropostas: () => requisitar('/api/propostas/minhas'),
  // administrador
  cadastros: () => requisitar('/api/admin/cadastros'),
  auditoria: () => requisitar('/api/admin/auditoria'),
  resumo: () => requisitar('/api/admin/resumo'),
  eventosAdmin: () => requisitar('/api/admin/eventos?completo=1'),
};

export const acoes = {
  // autocadastro (público)
  cadastrarParceiro: (dados) => comoResultado(requisitar('/api/auth/cadastro-parceiro', { ...m('POST', dados), token: null })),

  // administrador
  decidirCadastro: (idConta, status, justificativa) => comoResultado(requisitar(`/api/admin/cadastros/${idConta}`, m('PATCH', { status, justificativa }))),

  // organizador: eventos
  criarEvento: (dados) => comoResultado(requisitar('/api/eventos', m('POST', dados))),
  atualizarEvento: (id, dados) => comoResultado(requisitar(`/api/eventos/${id}`, m('PUT', dados))),
  alterarStatus: (id, status) => comoResultado(requisitar(`/api/eventos/${id}/status`, m('PATCH', { status }))),
  excluirEvento: (id) => comoResultado(requisitar(`/api/eventos/${id}`, m('DELETE'))),
  // organizador: itens e custos
  adicionarItem: (eventoId, dados) => comoResultado(requisitar(`/api/eventos/${eventoId}/itens`, m('POST', dados))),
  removerItem: (eventoId, itemId) => comoResultado(requisitar(`/api/eventos/${eventoId}/itens/${itemId}`, m('DELETE'))),
  adicionarCusto: (eventoId, dados) => comoResultado(requisitar(`/api/eventos/${eventoId}/custos`, m('POST', dados))),
  removerCusto: (eventoId, custoId) => comoResultado(requisitar(`/api/eventos/${eventoId}/custos/${custoId}`, m('DELETE'))),
  // organizador: seleção de propostas
  selecionarProposta: (eventoId, propostaId) => comoResultado(requisitar(`/api/eventos/${eventoId}/propostas/${propostaId}/selecionar`, m('POST'))),
  desfazerSelecao: (eventoId, itemId) => comoResultado(requisitar(`/api/eventos/${eventoId}/itens/${itemId}/selecao`, m('DELETE'))),

  // fornecedor
  enviarProposta: (eventoId, itemId, dados) => comoResultado(requisitar(`/api/cotacoes/${eventoId}/itens/${itemId}/propostas`, m('POST', dados))),
  editarProposta: (id, dados) => comoResultado(requisitar(`/api/propostas/${id}`, m('PUT', dados))),
  cancelarProposta: (id) => comoResultado(requisitar(`/api/propostas/${id}/cancelar`, m('POST'))),
};
