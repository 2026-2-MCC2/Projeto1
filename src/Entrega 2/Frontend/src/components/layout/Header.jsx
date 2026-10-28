import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoFull from '../../assets/images/logo_navbar_web_full.png';
import { useStore, currency, priceOf } from '../../context/StoreContext.jsx';
import { route, homeFor } from '../../routes/paths.js';
import ThemeButton from '../common/ThemeButton.jsx';

export default function Header() {
  const [menu, setMenu] = useState(false);
  const [cart, setCart] = useState(false);
  const store = useStore();
  const [checkout, setCheckout] = useState(false);
  const [order, setOrder] = useState(null);
  const { pathname } = useLocation();
  const total = store.cart.reduce((sum, item) => sum + priceOf(item) * item.quantity, 0);
  const completeCheckout = (event) => {
    event.preventDefault();
    setOrder(store.finishOrder({ name: event.currentTarget.name.value.trim(), email: event.currentTarget.email.value.trim() }));
    setCheckout(false);
    event.currentTarget.reset();
  };
  return <>
    <header className="cabecalho"><Link to={route('home')} className="cabecalho_logo"><img src={logoFull} alt="TrocaTicket" /></Link>
      <button className="botao-icone botao-menu-mobile" aria-label="Abrir menu" onClick={() => setMenu(!menu)}>{menu ? '×' : '☰'}</button>
      <nav className={`cabecalho_nav ${menu ? 'aberto' : ''}`} aria-label="Navegação principal">{[['Início','home'],['Eventos','events'],['Marketplace','marketplace'],['Ingressos','tickets'],['Pedidos','orders'],['Minha conta','account']].map(([label, page]) => <Link key={page} to={route(page)} className={pathname === route(page) ? 'ativo' : ''} aria-current={pathname === route(page) ? 'page' : undefined} onClick={() => setMenu(false)}>{label}</Link>)}</nav>
      <div className="cabecalho_acoes"><ThemeButton/><button className="botao-icone cart-trigger" aria-label={`Carrinho, ${store.cart.reduce((n, item) => n + item.quantity, 0)} itens`} onClick={() => setCart(true)}>🛒{store.cart.length > 0 && <span>{store.cart.reduce((n, item) => n + item.quantity, 0)}</span>}</button><Link className="botao-icone" to={store.account ? homeFor(store.account.role) : route('login')} aria-label="Minha conta">♙</Link></div>
    </header>
    <aside className={`carrinho-drawer ${cart ? 'aberto' : ''}`} aria-label="Carrinho de compras"><div className="carrinho-drawer_topo"><h3>Seu carrinho <span className="muted">({store.cart.reduce((n, item) => n + item.quantity, 0)})</span></h3><button className="modal-fechar" onClick={() => setCart(false)} aria-label="Fechar carrinho">×</button></div>
      {order ? <div className="order-confirmation"><span className="success-icon">✓</span><span className="eyebrow">Pedido confirmado</span><h3>Obrigado pela compra!</h3><p>Pedido <strong>{order.id}</strong></p><p>Resumo enviado para {order.customer.email}</p><button className="botao-principal" onClick={() => {setOrder(null);setCart(false);}}>Continuar explorando</button></div> : store.cart.length === 0 ? <div className="empty-cart"><span className="empty-cart-icon">⌑</span><h3>Seu carrinho está vazio</h3><p>Explore os eventos e escolha sua próxima experiência.</p><button className="botao-principal" onClick={() => setCart(false)}>Ver eventos</button></div> : <>
        <div className="cart-items">{store.cart.map((item) => <article className="cart-item" key={item.id}><img src={item.imagem} alt=""/><div className="cart-item-info"><strong>{item.nome}</strong><small>{item.preco}</small><div className="quantity-controls"><button onClick={() => store.changeQuantity(item.id, -1)} aria-label={`Remover uma unidade de ${item.nome}`}>−</button><span>{item.quantity}</span><button onClick={() => store.changeQuantity(item.id, 1)} aria-label={`Adicionar uma unidade de ${item.nome}`}>+</button><button className="remove-item" onClick={() => store.removeFromCart(item.id)}>Remover</button></div></div></article>)}</div>
        <div className="cart-summary"><p><span>Subtotal</span><strong>{currency(total)}</strong></p><small>Pagamento demonstrativo. Nenhuma cobrança será realizada.</small><button className="botao-principal" onClick={() => setCheckout(!checkout)}>{checkout ? 'Voltar ao carrinho' : 'Finalizar pedido'} <span>→</span></button></div>
        {checkout && <form className="checkout-form" onSubmit={completeCheckout}><span className="eyebrow">Seus dados</span><label htmlFor="checkout-name">Nome completo</label><input id="checkout-name" name="name" defaultValue={store.account?.name || ''} required/><label htmlFor="checkout-email">E-mail para confirmação</label><input id="checkout-email" name="email" type="email" defaultValue={store.account?.email || ''} required/><button className="botao-principal">Confirmar pedido</button></form>}
      </>}
    </aside>
    {cart && <button className="drawer-backdrop" aria-label="Fechar carrinho" onClick={() => setCart(false)} />}
    {store.message && <div className="toast" role="status">✓ {store.message}</div>}
  </>;
}
