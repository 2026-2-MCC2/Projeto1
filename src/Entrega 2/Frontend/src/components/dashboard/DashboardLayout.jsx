import { LogOut, Menu, Settings, UserRound } from 'lucide-react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import logoMark from '../../assets/images/logo_navbar_web.png';
import { useStore } from '../../context/StoreContext.jsx';
import { roles } from '../../config/navigation.js';
import { route } from '../../routes/paths.js';
import ThemeButton from '../common/ThemeButton.jsx';

export default function DashboardLayout({ role }) {
  const { label, base, menu } = roles[role];
  const { account, signOut } = useStore();
  const navigate = useNavigate();
  const sair = () => { signOut(); navigate(route('home')); };
  const itemClass = ({ isActive }) => (isActive ? 'ativo' : undefined);

  return (
    <div className="painel">
      <aside className="sidebar">
        <Link className="sidebar_topo" to={route('home')}>
          <img src={logoMark} alt="" />
          <span><span className="sidebar_titulo">TrocaTicket</span><span className="sidebar_papel">{label}</span></span>
        </Link>
        <nav className="sidebar_nav" aria-label="Menu do painel">
          {menu.map(([nome, to, Icone]) => <NavLink key={to} to={to} className={itemClass}><Icone size={18} aria-hidden="true" />{nome}</NavLink>)}
        </nav>
        <div className="sidebar_rodape">
          <NavLink to={`${base}/configuracoes`} className={itemClass}><Settings size={18} aria-hidden="true" />Configurações</NavLink>
          <button className="sidebar_sair" onClick={sair}><LogOut size={18} aria-hidden="true" />Sair</button>
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
