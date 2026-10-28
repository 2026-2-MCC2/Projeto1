import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { homeFor, route } from './paths.js';

// Só deixa entrar quem está logado com o perfil exigido.
export default function ProtectedRoute({ role }) {
  const { account } = useStore();
  const location = useLocation();
  if (!account) return <Navigate to={route('login')} state={{ from: location.pathname }} replace />;
  if (account.role !== role) return <Navigate to={homeFor(account.role)} replace />;
  return <Outlet />;
}
