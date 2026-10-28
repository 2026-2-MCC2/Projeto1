import { Link } from 'react-router-dom';
import logoFull from '../../assets/images/logo_navbar_web_full.png';
import { route } from '../../routes/paths.js';

export default function Footer() {
  return <footer className="rodape"><div className="rodape_logo"><img src={logoFull} alt="TrocaTicket" /></div><div className="rodape_colunas container">
    <div><h3>A TrocaTicket</h3><Link to={route('home')}>Início</Link><Link to={route('marketplace')}>Marketplace</Link><Link to={route('contact')}>Contato</Link></div>
    <div><h3>Suporte e ajuda</h3><Link to={route('contact')}>Central de ajuda</Link><Link to={route('contact')}>Fale conosco</Link><Link to={route('contact')}>Dúvidas frequentes</Link></div>
    <div><h3>Segurança e dados</h3><Link to={route('contact')}>Solicitar termos de uso</Link><Link to={route('contact')}>Solicitar política de privacidade</Link></div>
    <div><h3>Área de demonstração</h3><Link to={route('signup')}>Cadastro</Link><Link to={route('login')}>Entrar</Link><Link to={route('admin')}>Painel Admin</Link><Link to={route('vendor')}>Painel Fornecedor</Link><Link to={route('organizer')}>Painel Organizador</Link></div>
  </div><p className="copyright">© 2026 TrocaTicket. Todos os direitos reservados.</p></footer>;
}
