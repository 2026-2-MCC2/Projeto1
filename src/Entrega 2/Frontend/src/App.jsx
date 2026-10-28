import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import NavigationBridge from './components/common/NavigationBridge.jsx';
import DashboardLayout from './components/dashboard/DashboardLayout.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';

import Home from './pages/public/Home.jsx';
import EventsPage from './pages/public/EventsPage.jsx';
import MarketplacePage from './pages/public/MarketplacePage.jsx';
import Contact from './pages/public/Contact.jsx';

import NotFound from './pages/public/NotFound.jsx';

import Login from './pages/auth/Login.jsx';
import Cadastro from './pages/auth/Cadastro.jsx';
import TicketsPage from './pages/cliente/TicketsPage.jsx';
import OrdersPage from './pages/cliente/OrdersPage.jsx';
import AccountTabs from './pages/cliente/AccountTabs.jsx';

import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import Solicitacoes from './pages/admin/Solicitacoes.jsx';
import FornecedorDashboard from './pages/fornecedor/FornecedorDashboard.jsx';
import EventosFornecedor from './pages/fornecedor/EventosFornecedor.jsx';
import OrganizadorDashboard from './pages/organizador/OrganizadorDashboard.jsx';

import MeusEventos from './pages/organizador/MeusEventos.jsx';
import CriarEvento from './pages/organizador/CriarEvento.jsx';
import MinhasSolicitacoes from './pages/shared/MinhasSolicitacoes.jsx';
const Analise = lazy(() => import('./pages/shared/Analise.jsx')); // carrega o gráfico só quando precisa
import Suporte from './pages/shared/Suporte.jsx';
import Configuracoes from './pages/shared/Configuracoes.jsx';

const titulos = {
  '/': 'TrocaTicket — Eventos para viver', '/eventos': 'Eventos', '/marketplace': 'Marketplace', '/ingressos': 'Meus ingressos',
  '/pedidos': 'Meus pedidos', '/minha-conta': 'Minha conta', '/login': 'Entrar', '/cadastro': 'Criar conta', '/contato': 'Contato',
};

// Rotas internas de cada perfil. `extras` são as páginas exclusivas do perfil.
const painel = (role, extras) => (
  <Route path={`/${role}`} element={<ProtectedRoute role={role} />}>
    <Route element={<DashboardLayout role={role} />}>
      <Route index element={<Navigate to="dashboard" replace />} />
      {extras}
      <Route path="analise" element={<Analise />} />
      <Route path="suporte" element={<Suporte />} />
      <Route path="configuracoes" element={<Configuracoes />} />
    </Route>
  </Route>
);

export default function App() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    const t = titulos[pathname];
    document.title = t ? (t.includes('—') ? t : `${t} — TrocaTicket`) : /^\/(admin|fornecedor|organizador)/.test(pathname) ? 'Painel — TrocaTicket' : 'Página não encontrada — TrocaTicket';
    if (hash) requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }));
    else window.scrollTo(0, 0);
  }, [pathname, hash]);

  return (
    <>
      <NavigationBridge />
      <Suspense fallback={<p className="painel-carregando" role="status">Carregando…</p>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/eventos" element={<EventsPage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/contato" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/ingressos" element={<TicketsPage />} />
        <Route path="/pedidos" element={<OrdersPage />} />
        <Route path="/minha-conta" element={<AccountTabs />} />

        {painel('admin', <>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="solicitacoes" element={<Solicitacoes />} />
        </>)}
        {painel('fornecedor', <>
          <Route path="dashboard" element={<FornecedorDashboard />} />
          <Route path="eventos" element={<EventosFornecedor />} />
          <Route path="solicitacoes" element={<MinhasSolicitacoes />} />
        </>)}
        {painel('organizador', <>
          <Route path="dashboard" element={<OrganizadorDashboard />} />
          <Route path="eventos" element={<MeusEventos />} />
          <Route path="eventos/novo" element={<CriarEvento />} />
          <Route path="solicitacoes" element={<MinhasSolicitacoes />} />
        </>)}

        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
    </>
  );
}
