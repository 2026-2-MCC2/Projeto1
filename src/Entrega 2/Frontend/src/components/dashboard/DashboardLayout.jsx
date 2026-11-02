import { ChevronsLeft, ChevronsRight, LogOut, Menu, Settings, UserRound } from 'lucide-react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import logoMark from '../../assets/images/logo_navbar_web.png';
import { useStore } from '../../context/StoreContext.jsx';
import { roles } from '../../config/navigation.js';
import useLocalState from '../../hooks/useLocalState.js';
import { route } from '../../routes/paths.js';
import ThemeButton from '../common/ThemeButton.jsx';

export default function DashboardLayout({ role }) {
  const { label, base, menu } = roles[role];
  const { account, signOut } = useStore();
  const navigate = useNavigate();
  const [recolhido, setRecolhido] = useLocalState('tt-sidebar-recolhido', false);
  const sair = () => { signOut(); navigate(route('home')); };
  const itemClass = ({ isActive }) => (isActive ? 'ativo' : undefined);
  const ToggleIcon = recolhido ? ChevronsRight : ChevronsLeft;

  return (
    <div className={`painel ${recolhido ? 'painel--recolhido' : ''}`}>
      <aside className="sidebar">
        <Link className="sidebar_topo" to={route('home')} title="Ir para o site">
          <img src={logoMark} alt="" />
          <span className="sidebar_rotulo"><span className="sidebar_titulo">TrocaTicket</span><span className="sidebar_papel">{label}</span></span>
        </Link>
        <button className="sidebar_toggle" onClick={() => setRecolhido(!recolhido)} aria-expanded={!recolhido}
          aria-label={recolhido ? 'Expandir menu lateral' : 'Recolher menu lateral'} title={recolhido ? 'Expandir menu' : 'Recolher menu'}>
          <ToggleIcon size={18} aria-hidden="true" />
        </button>
        <nav className="sidebar_nav" aria-label="Menu do painel">
          {menu.map(([nome, to, Icone]) => (
            <NavLink key={to} to={to} className={itemClass} title={recolhido ? nome : undefined}>
              <Icone size={18} aria-hidden="true" /><span className="sidebar_rotulo">{nome}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar_rodape">
          <NavLink to={`${base}/configuracoes`} className={itemClass} title={recolhido ? 'Configurações' : undefined}>
            <Settings size={18} aria-hidden="true" /><span className="sidebar_rotulo">Configurações</span>
          </NavLink>
          <button className="sidebar_sair" onClick={sair} title={recolhido ? 'Sair' : undefined}>
            <LogOut size={18} aria-hidden="true" /><span className="sidebar_rotulo">Sair</span>
          </button>
        </div>
      </aside>
      <main className="painel_conteudo">
        <div className="painel_barra">
          <ThemeButton compact />
          <Link className="perfil-pill" to={`${base}/configuracoes`} aria-label={`Conta de ${account?.name}`}>
            <Menu size={18} aria-hidden="true" /><UserRound size={18} aria-hidden="true" />
          </Link>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
