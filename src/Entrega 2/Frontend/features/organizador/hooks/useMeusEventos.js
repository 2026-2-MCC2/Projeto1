import { useMemo } from 'react';
import useApi from '../../../shared/hooks/useApi.js';
import { leituras } from '../../planejamento/services/planejamentoApi.js';
import { moeda, periodo } from '../../planejamento/services/planejamento.js';

export const codigoEvento = (id) => `EV-${String(id).padStart(3, '0')}`;

// Eventos do organizador logado (vindos da API), já prontos para tabelas e calendário.
export default function useMeusEventos() {
  const { dados, carregando, erro, recarregar } = useApi(() => leituras.eventosDoOrganizador(), []);
  const eventos = useMemo(() => (dados?.eventos ?? []).map((e) => ({
    id: e.id, codigo: codigoEvento(e.id), nome: e.nome, data: e.inicio, periodo: periodo(e.inicio, e.fim), local: e.local,
    publico: `${e.publicoMin.toLocaleString('pt-BR')} a ${e.publicoMax.toLocaleString('pt-BR')}`,
    status: e.status, itens: e.resumo.totalItens, propostas: e.resumo.propostasAtivas, selecionadas: e.resumo.itensFechados,
    ticket: e.resumo.ticketAlvo == null ? '—' : moeda(e.resumo.ticketAlvo),
    aberto: e.statusCodigo === 1,
  })), [dados]);
  return { eventos, dados, carregando, erro, recarregar };
}
