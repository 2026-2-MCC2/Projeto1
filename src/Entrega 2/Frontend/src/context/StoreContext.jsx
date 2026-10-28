import React, { createContext, useContext, useMemo, useState } from 'react';

const StoreContext = createContext(null);
const read = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
};
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

export function StoreProvider({ children }) {
  const [cart, setCart] = useState(() => read('tt-cart', []));
  const [orders, setOrders] = useState(() => read('tt-orders', []));
  const [account, setAccount] = useState(() => { const saved = read('tt-account', null); return saved ? { role: 'cliente', ...saved } : null; });
  const [message, setMessage] = useState('');
  const notify = (text) => { setMessage(text); window.setTimeout(() => setMessage(''), 3500); };
  const addToCart = (event) => {
    const current = [...cart];
    const found = current.find((item) => item.id === event.id);
    if (found) found.quantity += 1;
    else current.push({ ...event, quantity: 1 });
    setCart(current); write('tt-cart', current); notify(`${event.nome} adicionado ao carrinho.`);
  };
  const changeQuantity = (id, delta) => {
    const current = cart.map((item) => item.id === id ? { ...item, quantity: item.quantity + delta } : item).filter((item) => item.quantity > 0);
    setCart(current); write('tt-cart', current);
  };
  const removeFromCart = (id) => { const current = cart.filter((item) => item.id !== id); setCart(current); write('tt-cart', current); };
  const finishOrder = (customer) => {
    const order = { id: `TT-${Date.now().toString().slice(-7)}`, createdAt: new Date().toISOString(), customer, items: cart, total: cart.reduce((sum, item) => sum + priceOf(item) * item.quantity, 0), status: 'Confirmado' };
    const current = [order, ...orders]; setOrders(current); write('tt-orders', current); setCart([]); write('tt-cart', []); return order;
  };
  const signIn = (email, role = 'cliente') => { const saved = read('tt-account', null); const base = saved?.email === email ? saved : { name: email.split('@')[0], email }; const user = { ...base, role }; setAccount(user); write('tt-account', user); return user; };
  const signUp = (user) => { const full = { role: 'cliente', ...user }; setAccount(full); write('tt-account', full); return full; };
  const updateAccount = (user) => { setAccount(user); write('tt-account', user); notify('Seus dados foram atualizados.'); };
  const signOut = () => { setAccount(null); localStorage.removeItem('tt-account'); };
  const value = useMemo(() => ({ cart, orders, account, message, notify, addToCart, changeQuantity, removeFromCart, finishOrder, signIn, signUp, updateAccount, signOut }), [cart, orders, account, message]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore precisa estar dentro de StoreProvider');
  return context;
}

export function priceOf(event) {
  const match = String(event.preco || '').match(/R\$\s*([\d.]+(?:,\d{2})?)/);
  if (!match) return 0;
  return Number(match[1].replaceAll('.', '').replace(',', '.'));
}

export function currency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}
