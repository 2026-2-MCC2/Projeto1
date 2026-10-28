import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext.jsx';
import useMeusEventos from '../../hooks/useMeusEventos.js';
import useSolicitacoes from '../../hooks/useSolicitacoes.js';
import PageHeader from '../../components/dashboard/PageHeader.jsx';
import StatCard from '../../components/dashboard/StatCard.jsx';
import EventosTable from './EventosTable.jsx';

export default function OrganizadorDashboard() {
  const { account, orders } = useStore();
  const { eventos } = useMeusEventos();
  const { lista } = useSolicitacoes();
  return (
    <>
      <PageHeader eyebrow={`Olá, ${account.name}!`} title="Bem-vindo ao seu painel" subtitle="Aqui você pode ver seus eventos, pedidos e desempenho." />
      <div className="layout-duas-colunas">
        <div className="coluna">
          <section className="cards-resumo">
            <StatCard tone="rosa" label="Total de pedidos" value={orders.length} />
            <StatCard tone="laranja" label="Eventos ativos" value={eventos.filter((e) => e.status === 'Aprovado').length} />
            <StatCard tone="azul" label="Pedidos de suporte" value={lista.filter((s) => s.tipo === 'Suporte' && s.autor === 'organizador').length} />
          </section>
          <Link to="/organizador/suporte" className="ajuda-banner">
            <strong>Precisa de ajuda para organizar seu evento?</strong>
            <span>Acesse nossa página de dúvidas frequentes ou entre em contato com nosso suporte.</span>
          </Link>
          <EventosTable title="Seus eventos" eventos={eventos} />
        </div>
        <aside className="painel-lateral">
          <h2>Ações rápidas</h2>
          <Link className="acao-rapida acao-rapida--destaque" to="/organizador/eventos/novo"><strong>+ Criar evento</strong><small>Configure seu evento em poucos cliques</small></Link>
          <Link className="acao-rapida" to="/organizador/eventos"><strong>Ver calendário</strong><small>Confira todos os seus eventos</small></Link>
        </aside>
      </div>
    </>
  );
}
