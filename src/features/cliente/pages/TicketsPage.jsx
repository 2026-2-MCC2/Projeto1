import { useStore } from '../../../app/providers/StoreContext.jsx';
import { route } from '../../../app/routes/paths.js';
import Header from '../../../shared/layout/Header.jsx';
import Footer from '../../../shared/layout/Footer.jsx';
import EventPolaroid from '../../../shared/ui/EventPolaroid.jsx';

export default function TicketsPage() {
  const { orders, account } = useStore();
  const ordersForUser = orders.filter((order) => !account || order.customer.email.toLowerCase() === account.email.toLowerCase());
  const tickets = ordersForUser.flatMap((order) => order.items.map((item) => ({ ...item, orderId: order.id, issuedAt: order.createdAt })));
  return <><Header/><main className="account-page container"><header className="account-header"><div><span className="eyebrow">Sua coleção</span><h1>Meus ingressos.</h1><p>Seus ingressos comprados neste navegador ficam reunidos aqui.</p></div><a className="botao-detalhes" href={route('marketplace')}>Encontrar eventos →</a></header>{tickets.length ? <section className="tt-polaroid-grid ticket-polaroid-grid">{tickets.map((ticket, index) => <EventPolaroid key={`${ticket.orderId}-${ticket.id}`} event={{...ticket, organizador: ticket.organizador || `Pedido ${ticket.orderId}`, precoMedio: `${ticket.quantity} ${ticket.quantity === 1 ? 'ingresso' : 'ingressos'}`, periodo: ticket.data}} eyebrow={`Ingresso ${String(index + 1).padStart(2, '0')}`} compact action={<button className="botao-detalhes" onClick={() => window.print()}>Imprimir comprovante</button>}/>)}</section> : <section className="account-panel no-results"><span className="empty-cart-icon">▧</span><strong>Seus ingressos aparecerão aqui.</strong><p>Escolha um evento no marketplace e finalize um pedido para começar.</p><a href={route('marketplace')}>Ver eventos disponíveis →</a></section>}</main><Footer/></>;
}
