import eventsData from '../../data/eventos.json';
import { useStore, currency } from '../../context/StoreContext.jsx';
import { resumoAdmin } from '../../data/painelMock.js';
import useSolicitacoes from '../../hooks/useSolicitacoes.js';
import PageHeader from '../../components/dashboard/PageHeader.jsx';
import StatCard from '../../components/dashboard/StatCard.jsx';
import SolicitacoesTable from '../../components/dashboard/SolicitacoesTable.jsx';

export default function AdminDashboard() {
  const { account, orders } = useStore();
  const { lista, alterarStatus } = useSolicitacoes();
  const faturamento = orders.reduce((soma, o) => soma + o.total, 0);
  return (
    <>
      <PageHeader eyebrow="Painel do administrador" title={`Olá, ${account.name}!`} subtitle="Aqui você tem uma visão geral de toda a plataforma." />
      <section className="cards-resumo">
        <StatCard tone="rosa" label="Total de usuários" value={resumoAdmin.usuarios} />
        <StatCard tone="roxo" label="Eventos ativos" value={eventsData.length} />
        <StatCard tone="laranja" label="Total de fornecedores" value={resumoAdmin.fornecedores} />
        <StatCard tone="verde" label="Faturamento (mês)" value={currency(faturamento)} />
      </section>
      <SolicitacoesTable title="Lista de solicitações recentes" rows={lista.slice(0, 8)} canReview onReview={alterarStatus} />
    </>
  );
}
