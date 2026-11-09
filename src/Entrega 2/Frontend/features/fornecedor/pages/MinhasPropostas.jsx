import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../../app/providers/StoreContext.jsx';
import useApi from '../../../shared/hooks/useApi.js';
import { acoes, leituras } from '../../planejamento/services/planejamentoApi.js';
import { fmtData, moeda } from '../../planejamento/services/planejamento.js';
import DataTable from '../../../shared/dashboard/DataTable.jsx';
import PageHeader from '../../../shared/dashboard/PageHeader.jsx';
import { AvisoErro, EstadoApi } from '../../planejamento/components/ui.jsx';

// Histórico e status das propostas enviadas.
export default function MinhasPropostas() {
  const { notify } = useStore();
  const navigate = useNavigate();
  const { dados, carregando, erro, recarregar } = useApi(() => leituras.minhasPropostas(), []);

  const rows = useMemo(() => (dados?.propostas ?? []).map((p) => ({
    id: p.id, codigo: `PR-${String(p.id).padStart(3, '0')}`, eventoId: p.eventoId, evento: p.eventoNome, item: `${p.categoria ?? ''}: ${p.item}`,
    valor: p.valor, validade: p.validade, status: p.status,
  })), [dados]);

  const cancelar = async (row) => {
    if (!window.confirm('Cancelar esta proposta?')) return;
    const r = await acoes.cancelarProposta(row.id);
    notify(r.ok ? 'Proposta cancelada.' : r.erro);
    if (r.ok) recarregar();
  };
  const columns = [
    { key: 'codigo', label: 'ID' }, { key: 'evento', label: 'Evento' }, { key: 'item', label: 'Item' },
    { key: 'valor', label: 'Valor', render: (r) => moeda(r.valor) },
    { key: 'validade', label: 'Validade', render: (r) => fmtData(r.validade) },
    { key: 'status', label: 'Status' },
    { key: 'acao', label: 'Cancelar proposta', render: (r) => (r.status === 'Enviada' ? <button className="botao-detalhes" onClick={() => cancelar(r)}>Cancelar</button> : '—') },
  ];
  return (
    <>
      <PageHeader eyebrow="Propostas" title="Minhas propostas" subtitle="Acompanhe o status das propostas enviadas. Só é possível cancelar propostas ainda não decididas." />
      <EstadoApi carregando={carregando} erro={erro} dados={dados} recarregar={recarregar} />
      <AvisoErro erro={erro} dados={dados} />
      {dados && (
        <DataTable title="Propostas enviadas" columns={columns} rows={rows} statusKey="status" actionLabel="Abrir evento"
          onAction={(r) => navigate(`/fornecedor/eventos/${r.eventoId}`)} empty="Você ainda não enviou propostas. Veja os eventos disponíveis." />
      )}
    </>
  );
}
