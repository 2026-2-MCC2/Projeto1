import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import eventsData from '../../data/eventos.json';
import { useStore, currency } from '../../context/StoreContext.jsx';
import PageHeader from '../../components/dashboard/PageHeader.jsx';
import StatCard from '../../components/dashboard/StatCard.jsx';

export default function Analise() {
  const { orders } = useStore();
  const total = orders.reduce((s, o) => s + o.total, 0);
  const dados = Object.entries(eventsData.reduce((acc, e) => ({ ...acc, [e.categoria]: (acc[e.categoria] || 0) + 1 }), {}))
    .map(([categoria, eventos]) => ({ categoria, eventos }));
  return (
    <>
      <PageHeader eyebrow="Desempenho" title="Análise" subtitle="Números calculados com os dados salvos neste navegador." />
      <section className="cards-resumo">
        <StatCard tone="rosa" label="Pedidos" value={orders.length} />
        <StatCard tone="verde" label="Receita" value={currency(total)} />
        <StatCard tone="azul" label="Ticket médio" value={currency(orders.length ? total / orders.length : 0)} />
      </section>
      <section className="grafico-card grafico-recharts">
        <h2>Eventos por categoria</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={dados} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="categoria" tickLine={false} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
            <Tooltip cursor={{ fillOpacity: 0.08 }} />
            <Bar dataKey="eventos" name="Eventos" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </>
  );
}
