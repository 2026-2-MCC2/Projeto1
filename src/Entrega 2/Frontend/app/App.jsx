import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import NavigationBridge from './routes/NavigationBridge.jsx';
import DashboardLayout from '../shared/dashboard/DashboardLayout.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';

import Home from '../features/publico/pages/Home.jsx';
import EventsPage from '../features/publico/pages/EventsPage.jsx';
import MarketplacePage from '../features/publico/pages/MarketplacePage.jsx';
import Contact from '../features/publico/pages/Contact.jsx';

import NotFound from '../features/publico/pages/NotFound.jsx';

import Login from '../features/auth/pages/Login.jsx';
import Cadastro from '../features/auth/pages/Cadastro.jsx';
import LoginEquipe from '../features/auth/pages/LoginEquipe.jsx';
import CadastroParceiro from '../features/auth/pages/CadastroParceiro.jsx';
import TicketsPage from '../features/cliente/pages/TicketsPage.jsx';
import OrdersPage from '../features/cliente/pages/OrdersPage.jsx';
import AccountTabs from '../features/cliente/pages/AccountTabs.jsx';

import AdminDashboard from '../features/admin/pages/AdminDashboard.jsx';
import Solicitacoes from '../features/suporte/pages/Solicitacoes.jsx';
import FornecedorDashboard from '../features/fornecedor/pages/FornecedorDashboard.jsx';
import EventosFornecedor from '../features/fornecedor/pages/EventosFornecedor.jsx';
import EventoCotacao from '../features/fornecedor/pages/EventoCotacao.jsx';
import MinhasPropostas from '../features/fornecedor/pages/MinhasPropostas.jsx';
import Aprovacoes from '../features/admin/pages/Aprovacoes.jsx';
import AdminEventos from '../features/admin/pages/AdminEventos.jsx';
import OrganizadorDashboard from '../features/organizador/pages/OrganizadorDashboard.jsx';

import MeusEventos from '../features/organizador/pages/MeusEventos.jsx';
import CriarEvento from '../features/organizador/pages/CriarEvento.jsx';
import EventoDetalhe from '../features/organizador/pages/EventoDetalhe.jsx';
import MinhasSolicitacoes from '../features/suporte/pages/MinhasSolicitacoes.jsx';
const Analise = lazy(() => import('../features/painel/pages/Analise.jsx')); // carrega o gráfico só quando precisa
const Relatorios = lazy(() => import('../features/admin/pages/Relatorios.jsx'));
import Suporte from '../features/suporte/pages/Suporte.jsx';
import Configuracoes from '../features/painel/pages/Configuracoes.jsx';

const titulos = {
  '/': 'TrocaTicket — Eventos para viver', '/eventos': 'Eventos', '/marketplace': 'Marketplace', '/ingressos': 'Meus ingressos',
  '/pedidos': 'Meus pedidos', '/minha-conta': 'Minha conta', '/login': 'Entrar', '/cadastro': 'Criar conta', '/painel/login': 'Acesso ao painel', '/painel/cadastro': 'Cadastro de parceiro', '/contato': 'Contato',
};

// Rotas internas de cada perfil. `extras` são as páginas exclusivas do perfil.
const painel = (role, extras, analise = <Analise />) => (
  <Route path={`/${role}`} element={<ProtectedRoute role={role} />}>
    <Route element={<DashboardLayout role={role} />}>
      <Route index element={<Navigate to="dashboard" replace />} />
      {extras}
      <Route path="analise" element={analise} />
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
        <Route path="/painel/login" element={<LoginEquipe />} />
        <Route path="/painel/cadastro" element={<CadastroParceiro />} />
        <Route path="/ingressos" element={<TicketsPage />} />
        <Route path="/pedidos" element={<OrdersPage />} />
        <Route path="/minha-conta" element={<AccountTabs />} />

        {painel('admin', <>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="cadastros" element={<Aprovacoes />} />
          <Route path="eventos" element={<AdminEventos />} />
          <Route path="solicitacoes" element={<Solicitacoes />} />
        </>, <Relatorios />)}
        {painel('fornecedor', <>
          <Route path="dashboard" element={<FornecedorDashboard />} />
          <Route path="eventos" element={<EventosFornecedor />} />
          <Route path="eventos/:id" element={<EventoCotacao />} />
          <Route path="propostas" element={<MinhasPropostas />} />
          <Route path="solicitacoes" element={<MinhasSolicitacoes />} />
        </>)}
        {painel('organizador', <>
          <Route path="dashboard" element={<OrganizadorDashboard />} />
          <Route path="eventos" element={<MeusEventos />} />
          <Route path="eventos/novo" element={<CriarEvento />} />
          <Route path="eventos/:id" element={<EventoDetalhe />} />
          <Route path="eventos/:id/editar" element={<CriarEvento />} />
          <Route path="solicitacoes" element={<MinhasSolicitacoes />} />
        </>)}

        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
    </>
  );
}
