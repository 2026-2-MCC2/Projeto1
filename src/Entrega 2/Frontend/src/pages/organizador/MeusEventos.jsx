import { Link } from 'react-router-dom';
import { useStore, currency } from '../../context/StoreContext.jsx';
import useMeusEventos from '../../hooks/useMeusEventos.js';
import useSolicitacoes from '../../hooks/useSolicitacoes.js';
import PageHeader from '../../components/dashboard/PageHeader.jsx';
import StatCard from '../../components/dashboard/StatCard.jsx';
import EventosTable from './EventosTable.jsx';

export default function MeusEventos() {
  const { orders } = useStore();
  const { eventos } = useMeusEventos();
  const { lista } = useSolicitacoes();
  return (
    <>
      <PageHeader eyebrow="Eventos" title="Meus eventos" subtitle="Gerencie seus eventos, pedidos e acompanhe todo o andamento em um lugar só.">
        <Link className="botao-principal" to="/organizador/eventos/novo">+ Criar evento</Link>
      </PageHeader>
      <section className="cards-resumo">
        <StatCard tone="rosa" label="Total de eventos" value={eventos.length} />
        <StatCard tone="roxo" label="Eventos ativos" value={eventos.filter((e) => e.status === 'Aprovado').length} />
        <StatCard tone="laranja" label="Solicitações" value={lista.filter((s) => s.autor === 'organizador').length} />
        <StatCard tone="verde" label="Faturamento (mês)" value={currency(orders.reduce((s, o) => s + o.total, 0))} />
      </section>
      <EventosTable title="Lista de eventos" eventos={eventos} />
    </>
  );
}
