import { useStore, currency } from '../../context/StoreContext.jsx';
import { notificacoes } from '../../data/painelMock.js';
import useSolicitacoes from '../../hooks/useSolicitacoes.js';
import StatCard from '../../components/dashboard/StatCard.jsx';
import OrdersTable from '../../components/dashboard/OrdersTable.jsx';
import PageHeader from '../../components/dashboard/PageHeader.jsx';

export default function FornecedorDashboard() {
  const { account, orders } = useStore();
  const { lista } = useSolicitacoes();
  const total = orders.reduce((soma, o) => soma + o.total, 0);
  const suporte = lista.filter((s) => s.tipo === 'Suporte' && s.autor === 'fornecedor').length;
  return (
    <>
      <PageHeader eyebrow={`Olá, ${account.name}!`} title="Bem-vindo ao seu painel" subtitle="Aqui você pode ver seus produtos fornecidos, pedidos e desempenho." />
      <div className="layout-duas-colunas">
        <div className="coluna">
          <section className="cards-resumo">
            <StatCard tone="rosa" label="Total de pedidos" value={orders.length} />
            <StatCard tone="laranja" label="Pedidos aprovados" value={orders.filter((o) => o.status === 'Confirmado').length} />
            <StatCard tone="azul" label="Pedidos de suporte" value={suporte} />
          </section>
          <div className="banner-faturamento"><strong>Faturamento:</strong> <span>{currency(total)}</span></div>
          <OrdersTable orders={orders} />
        </div>
        <aside className="painel-lateral">
          <h2>Notificações</h2>
          <ul className="lista-notificacoes">
            {notificacoes.map((n) => <li key={n.id}><span className={`dot dot--${n.cor}`} aria-hidden="true" />{n.texto}</li>)}
          </ul>
        </aside>
      </div>
    </>
  );
}
