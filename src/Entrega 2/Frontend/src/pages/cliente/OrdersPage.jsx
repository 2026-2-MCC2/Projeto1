import { useState } from 'react';
import { useStore, currency, priceOf } from '../../context/StoreContext.jsx';
import { route } from '../../routes/paths.js';
import Header from '../../components/layout/Header.jsx';
import Footer from '../../components/layout/Footer.jsx';

export default function OrdersPage() {
  const { orders, account } = useStore();
  const [query, setQuery] = useState('');
  const visible = orders.filter((order) => (!account || order.customer.email.toLowerCase() === account.email.toLowerCase()) && (order.id.toLowerCase().includes(query.toLowerCase()) || order.items.some((item) => item.nome.toLowerCase().includes(query.toLowerCase()))));
  return <><Header/><main className="account-page container"><header className="account-header"><div><span className="eyebrow">Área do cliente</span><h1>Seus pedidos.</h1><p>Acompanhe as confirmações das suas compras.</p></div><a className="botao-detalhes" href={route('tickets')}>Ver meus ingressos →</a></header><section className="account-panel"><div className="orders-toolbar"><div><span className="eyebrow">Histórico de compras</span><h2>{visible.length} {visible.length === 1 ? 'pedido' : 'pedidos'}</h2></div><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar pedidos..." aria-label="Buscar pedidos"/></div>{visible.length ? <div className="account-orders">{visible.map((order) => <article className="account-order" key={order.id}><header><div><strong>{order.id}</strong><small>{new Date(order.createdAt).toLocaleDateString('pt-BR')} · {order.customer.email}</small></div><span className="status-pill approved">{order.status}</span></header><div className="account-order-items">{order.items.map((item) => <span key={item.id}>{item.quantity} × {item.nome} · {currency(priceOf(item) * item.quantity)}</span>)}</div><footer><span>Total do pedido</span><strong>{currency(order.total)}</strong></footer></article>)}</div> : <div className="no-results"><span className="empty-cart-icon">⌑</span><strong>{query ? 'Não encontramos esse pedido.' : 'Ainda não há pedidos por aqui.'}</strong><p>Quando finalizar uma compra, o pedido aparecerá nesta aba.</p><a href={route('marketplace')}>Explorar marketplace →</a></div>}</section></main><Footer/></>;
}
