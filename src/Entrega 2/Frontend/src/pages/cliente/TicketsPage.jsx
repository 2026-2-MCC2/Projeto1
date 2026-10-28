import { useStore } from '../../context/StoreContext.jsx';
import { route } from '../../routes/paths.js';
import Header from '../../components/layout/Header.jsx';
import Footer from '../../components/layout/Footer.jsx';

export default function TicketsPage() {
  const { orders, account } = useStore();
  const ordersForUser = orders.filter((order) => !account || order.customer.email.toLowerCase() === account.email.toLowerCase());
  const tickets = ordersForUser.flatMap((order) => order.items.map((item) => ({ ...item, orderId: order.id, issuedAt: order.createdAt })));
  return <><Header/><main className="account-page container"><header className="account-header"><div><span className="eyebrow">Sua coleção</span><h1>Meus ingressos.</h1><p>Seus ingressos comprados neste navegador ficam reunidos aqui.</p></div><a className="botao-detalhes" href={route('marketplace')}>Encontrar eventos →</a></header>{tickets.length ? <section className="ticket-grid">{tickets.map((ticket, index) => <article className="ticket-pass" key={`${ticket.orderId}-${ticket.id}`}><img src={ticket.imagem} alt=""/><div className="ticket-pass-content"><span className="eyebrow">Ingresso {String(index + 1).padStart(2, '0')}</span><h2>{ticket.nome}</h2><p>{ticket.data} · {ticket.local}</p><div className="ticket-pass-meta"><span>Pedido {ticket.orderId}</span><span>{ticket.quantity} {ticket.quantity === 1 ? 'ingresso' : 'ingressos'}</span></div><button className="botao-detalhes" onClick={() => window.print()}>Imprimir comprovante</button></div></article>)}</section> : <section className="account-panel no-results"><span className="empty-cart-icon">▧</span><strong>Seus ingressos aparecerão aqui.</strong><p>Escolha um evento no marketplace e finalize um pedido para começar.</p><a href={route('marketplace')}>Ver eventos disponíveis →</a></section>}</main><Footer/></>;
}
