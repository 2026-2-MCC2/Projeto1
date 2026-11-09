
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import {
  useStore,
  currency
} from '../../../app/providers/StoreContext.jsx';

import { route } from '../../../app/routes/paths.js';

import Header from '../../../shared/layout/Header.jsx';
import Footer from '../../../shared/layout/Footer.jsx';
import EventPolaroid from '../../../shared/ui/EventPolaroid.jsx';

export default function AccountTabs() {
  const store = useStore();
  const navigate = useNavigate();

  // estados da página
  const [tab, setTab] = useState('perfil');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // verifica se existe uma conta autenticada
  if (!store.account) {
    return <Navigate to={route('login')} replace />;
  }

  // filtra os pedidos do usuário
  const orders = store.orders.filter((order) =>
    order.customer?.email?.toLowerCase() ===
    store.account.email.toLowerCase()
  );

  // organiza os ingressos dos pedidos
  const tickets = orders.flatMap((order) =>
    order.items.map((item) => ({
      ...item,
      orderId: order.id
    }))
  );

  // salva as alterações do perfil
  // Salva as alterações do perfil no banco de dados
  const saveProfile = async (event) => {
  event.preventDefault();

  setSaved(false);
  setError('');

  const form = new FormData(event.currentTarget);
  const name = String(form.get('name')).trim();

  if (!name) {
    setError('Informe seu nome completo.');
    return;
  }

  try {
    setLoading(true);

    await store.updateAccount({ nome: name });

    setSaved(true);

  } catch (erro) {
    setError(erro.message || 'Erro ao atualizar perfil.');

  } finally {
    setLoading(false);
  }
};

  // encerra a sessão
  const sairDaConta = () => {
    store.signOut();
    navigate(route('home'));
  };

  // imprime o comprovante
  const imprimirComprovante = () => {
    window.print();
  };

  return (
    <>
      <Header />

      <main className="account-page container">

        {/* Cabeçalho da conta */}
        <header className="account-header">
          <div>
            <span className="eyebrow">Espaço pessoal</span>

            <h1>Olá, {store.account.name}.</h1>

            <p>
              Gerencie seu perfil, pedidos e ingressos em um só lugar.
            </p>
          </div>

          <button
            type="button"
            className="botao-detalhes"
            onClick={sairDaConta}
          >
            Sair da conta
          </button>
        </header>

        {/* Navegação das abas */}
        <div
          className="account-tabs"
          role="tablist"
          aria-label="Seções da conta"
        >
          {[
            ['perfil', 'Meu perfil'],
            ['pedidos', 'Meus pedidos'],
            ['ingressos', 'Meus ingressos']
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={tab === id ? 'selected' : ''}
              onClick={() => setTab(id)}
            >
              {label}

              <span>
                {id === 'pedidos'
                  ? orders.length
                  : id === 'ingressos'
                    ? tickets.length
                    : ''}
              </span>
            </button>
          ))}
        </div>

        {/* Conteúdo das abas */}
        <section className="account-panel" role="tabpanel">

          {/* ABA: PERFIL */}
          {tab === 'perfil' && (
            <form
              className="profile-form"
              onSubmit={saveProfile}
            >
              <span className="eyebrow">Seus dados</span>

              <h2>Informações pessoais</h2>

              <label htmlFor="profile-name">
                Nome completo
              </label>

              <input
                id="profile-name"
                name="name"
                defaultValue={store.account.name}
                required
              />

              <label htmlFor="profile-email">
                E-mail
              </label>

              <input
                id="profile-email"
                type="email"
                value={store.account.email}
                readOnly
              />

              <small>
                Este protótipo não altera credenciais de acesso.
              </small>

              <button
                className="botao-principal"
                type="submit"
                disabled={loading}>
                
                {loading ? 'Salvando...' : 'Salvar alterações'}
              </button>

              {saved && (
                <p className="success-message" role="status">
                  Perfil atualizado com sucesso!
                </p>
              )}

              {error && (
                <p className="error-message" role="alert">
                  {error}
                </p>
              )}
            </form>
          )}

          {/* ABA: PEDIDOS */}
          {tab === 'pedidos' && (
            orders.length ? (
              <div className="account-orders">

                {orders.map((order) => (
                  <article
                    className="account-order"
                    key={order.id}
                  >
                    <header>
                      <div>
                        <strong>{order.id}</strong>

                        <small>
                          {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                        </small>
                      </div>

                      <span className="status-pill approved">
                        {order.status}
                      </span>
                    </header>

                    <div className="account-order-items">
                      {order.items.map((item) => (
                        <span key={item.id}>
                          {item.quantity} × {item.nome}
                        </span>
                      ))}
                    </div>

                    <footer>
                      <span>Total</span>

                      <strong>
                        {currency(order.total)}
                      </strong>
                    </footer>
                  </article>
                ))}

              </div>
            ) : (
              <div className="no-results">
                <strong>Você ainda não fez pedidos.</strong>

                <p>
                  Quando finalizar uma compra, ela aparecerá nesta aba.
                </p>

                <a href={route('marketplace')}>
                  Explorar eventos →
                </a>
              </div>
            )
          )}

          {/* ABA: INGRESSOS */}
          {tab === 'ingressos' && (
            tickets.length ? (
              <div className="tt-polaroid-grid ticket-polaroid-grid">

                {tickets.map((ticket, index) => (
                  <EventPolaroid
                    key={`${ticket.orderId}-${ticket.id}`}
                    event={{
                      ...ticket,
                      organizador: `Pedido ${ticket.orderId}`,
                      precoMedio: `${ticket.quantity} ${
                        ticket.quantity === 1
                          ? 'ingresso'
                          : 'ingressos'
                      }`,
                      periodo: ticket.data
                    }}
                    eyebrow={`Ingresso ${String(index + 1).padStart(2, '0')}`}
                    compact
                    action={
                      <button
                        type="button"
                        className="botao-detalhes"
                        onClick={imprimirComprovante}
                      >
                        Imprimir comprovante
                      </button>
                    }
                  />
                ))}

              </div>
            ) : (
              <div className="no-results">
                <strong>Seus ingressos aparecerão aqui.</strong>

                <p>
                  Escolha um evento e finalize uma compra para começar.
                </p>

                <a href={route('marketplace')}>
                  Ver eventos →
                </a>
              </div>
            )
          )}

        </section>
      </main>

      <Footer />
    </>
  );
}
