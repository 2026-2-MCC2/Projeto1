import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { moeda } from '../services/planejamento.js';

// Ticket-alvo em função do público. Carregado só quando necessário (lazy).
export default function TicketChart({ dados }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={dados} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="publico" tickLine={false} minTickGap={40} label={{ value: 'Público', position: 'insideBottom', offset: -2 }} />
        <YAxis tickLine={false} axisLine={false} width={64} tickFormatter={(v) => `R$ ${Math.round(v)}`} domain={['auto', 'auto']} />
        <Tooltip formatter={(v) => [moeda(v), 'Ticket-alvo']} labelFormatter={(l) => `Público: ${l}`} />
        <Line type="monotone" dataKey="ticket" stroke="var(--accent)" strokeWidth={2.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
