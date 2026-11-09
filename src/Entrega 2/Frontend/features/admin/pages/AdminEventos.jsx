import { useMemo, useState } from 'react';
import useApi from '../../../shared/hooks/useApi.js';
import { leituras } from '../../planejamento/services/planejamentoApi.js';
import { COBRANCAS, moeda, periodo } from '../../planejamento/services/planejamento.js';
import { codigoEvento } from '../../organizador/hooks/useMeusEventos.js';
import DataTable from '../../../shared/dashboard/DataTable.jsx';
import DetailsModal from '../../../shared/dashboard/DetailsModal.jsx';
import PageHeader from '../../../shared/dashboard/PageHeader.jsx';
import { AvisoErro, EstadoApi } from '../../planejamento/components/ui.jsx';

// Visão administrativa dos eventos, custos e andamento das cotações (RF14).
export default function AdminEventos() {
  const { dados, carregando, erro, recarregar } = useApi(() => leituras.eventosAdmin(), []);
  const [sel, setSel] = useState(null);

  const rows = useMemo(() => (dados?.eventos ?? []).map((e) => ({
    id: e.id, codigo: codigoEvento(e.id), nome: e.nome, organizador: e.organizadorNome, periodo: periodo(e.inicio, e.fim), status: e.status,
    cotacao: `${e.resumo.itensFechados}/${e.resumo.totalItens} itens fechados`, propostas: e.resumo.propostasAtivas,
    custo: moeda(e.resumo.custoReferencia), ticket: e.resumo.ticketAlvo == null ? '—' : moeda(e.resumo.ticketAlvo),
  })), [dados]);

  const columns = [
    { key: 'codigo', label: 'ID' }, { key: 'nome', label: 'Evento' }, { key: 'organizador', label: 'Organizador' }, { key: 'periodo', label: 'Período' },
    { key: 'cotacao', label: 'Cotação' }, { key: 'propostas', label: 'Propostas' }, { key: 'custo', label: 'Custo (público de referência)' },
    { key: 'ticket', label: 'Ticket-alvo' }, { key: 'status', label: 'Status' },
  ];
  const det = sel && dados?.eventos.find((e) => e.id === sel);

  return (
    <>
      <PageHeader eyebrow="Administração" title="Eventos da plataforma" subtitle="Acompanhe status, custos e o andamento das cotações de todos os organizadores." />
      <EstadoApi carregando={carregando} erro={erro} dados={dados} recarregar={recarregar} />
      <AvisoErro erro={erro} dados={dados} />
      {dados && <DataTable title="Todos os eventos" columns={columns} rows={rows} statusKey="status" onAction={(r) => setSel(r.id)} empty="Nenhum evento cadastrado ainda." />}
      {det && (
        <DetailsModal title={`${codigoEvento(det.id)} — ${det.nome}`} onClose={() => setSel(null)}
          fields={[['Organizador', det.organizadorNome], ['Local', det.local], ['Período', periodo(det.inicio, det.fim)],
            ['Público', `${det.publicoMin} a ${det.publicoMax}`], ['Margem', `${det.margem}%`], ['Status', det.status]]}>
          <h3 className="plan-modal-titulo">Itens e propostas</h3>
          <ul className="plan-lista">
            {det.itens.map((i) => {
              const ps = det.propostas.filter((p) => p.itemId === i.id && p.status !== 'Cancelada');
              const ok = ps.find((p) => p.status === 'Selecionada');
              return <li key={i.id}><strong>{i.categoria}</strong> — {i.descricao}: {ps.length} proposta(s){ok ? `, selecionada ${moeda(ok.valor)} (${ok.fornecedorNome})` : ''}</li>;
            })}
            {!det.itens.length && <li>Nenhum item cadastrado.</li>}
          </ul>
          <h3 className="plan-modal-titulo">Outros custos</h3>
          <ul className="plan-lista">
            {det.custos.map((c) => <li key={c.id}>{c.tipo} — {c.descricao}: {moeda(c.valor)} ({COBRANCAS[c.cobranca].toLowerCase()})</li>)}
            {!det.custos.length && <li>Nenhum custo cadastrado.</li>}
          </ul>
        </DetailsModal>
      )}
    </>
  );
}
