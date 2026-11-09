
import React, {
  createContext,
  useContext,
  useMemo,
  useState
} from 'react';

import {
  login,
  cadastrarCliente,
  consultarPerfil,
  atualizarPerfil
} from '../../features/auth/services/authService.js';

const StoreContext = createContext(null);

const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export function StoreProvider({ children }) {
  const [cart, setCart] = useState(() => read('tt-cart', []));

  const [orders, setOrders] = useState(() => read('tt-orders', []));

  const [account, setAccount] = useState(() => {
    const saved = read('tt-account', null);
  
    if (!saved || !saved.email || !saved.role) {
      localStorage.removeItem('tt-account');
      return null;
    }
  
    return saved;
  });

  const [message, setMessage] = useState('');

  const notify = (text) => {
    setMessage(text);
    window.setTimeout(() => setMessage(''), 3500);
  };

  // Adicionar evento ao carrinho
  const addToCart = (event) => {
    const current = [...cart];

    const found = current.find(
      (item) => item.id === event.id
    );

    if (found) {
      found.quantity += 1;
    } else {
      current.push({ ...event, quantity: 1 });
    }

    setCart(current);
    write('tt-cart', current);

    notify(`${event.nome} adicionado ao carrinho.`);
  };

  // Alterar quantidade de ingressos
  const changeQuantity = (id, delta) => {
    const current = cart
      .map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity + delta }
          : item
      )
      .filter((item) => item.quantity > 0);

    setCart(current);
    write('tt-cart', current);
  };

  // Remover evento do carrinho
  const removeFromCart = (id) => {
    const current = cart.filter(
      (item) => item.id !== id
    );

    setCart(current);
    write('tt-cart', current);
  };

  // Finalizar pedido
  const finishOrder = (customer) => {
    const order = {
      id: `TT-${Date.now().toString().slice(-7)}`,
      createdAt: new Date().toISOString(),
      customer,
      items: cart,
      total: cart.reduce(
        (sum, item) =>
          sum + priceOf(item) * item.quantity,
        0
      ),
      status: 'Confirmado'
    };

    const current = [order, ...orders];

    setOrders(current);
    write('tt-orders', current);

    setCart([]);
    write('tt-cart', []);

    return order;
  };

  // Login demonstrativo
  const signIn = async (email, senha, escopo) => {
    const user = await login(email, senha, escopo);

    setAccount(user);
    write('tt-account', user);

    return user;
  };

  // Consultar perfil do usuario autenticado, usando o token armazenado
  const getProfile = async () => {
    if (!account || !account.token) {
        throw new Error('Usuário não autenticado.');
    }

    return await consultarPerfil(account.token);
  };

  // Cadastro real no backend
  const signUp = async (user) => {
    const novoUsuario = await cadastrarCliente(user);

    setAccount(novoUsuario);
    write('tt-account', novoUsuario);

    return novoUsuario;
  };

  // Atualizar conta
  const updateAccount = async (dados) => {
    if (!account || !account.token) {
      throw new Error('Usuário não autenticado.');
    }
  
    const usuarioAtualizado = await atualizarPerfil(
      account.token,
      dados
    );
  
    const novaConta = {
      ...account,
      name: usuarioAtualizado.nome,
      email: usuarioAtualizado.email,
      role: usuarioAtualizado.perfil
    };
  
    setAccount(novaConta);
    write('tt-account', novaConta);
  
    notify('Seus dados foram atualizados.');
  
    return novaConta;
  };

  // Sair da conta
  const signOut = () => {
    setAccount(null);
    localStorage.removeItem('tt-account');
  };

  const value = useMemo(() => ({
    cart,
    orders,
    account,
    message,
    notify,
    addToCart,
    changeQuantity,
    removeFromCart,
    finishOrder,
    signIn,
    signUp,
    getProfile,
    updateAccount,
    signOut
  }), [cart, orders, account, message]);

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);

  if (!context) {
    throw new Error(
      'useStore precisa estar dentro de StoreProvider'
    );
  }

  return context;
}

// Converter preço para número
export function priceOf(event) {
  const match = String(event.preco || '').match(
    /R\$\s*([\d.]+(?:,\d{2})?)/
  );

  if (!match) return 0;

  return Number(
    match[1].replaceAll('.', '').replace(',', '.')
  );
}

// Formatar valores em reais
export function currency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}
