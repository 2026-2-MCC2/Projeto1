import logoFull from '../../assets/images/logo_navbar_web_full.png';
import { route } from '../../routes/paths.js';

export default function NotFound() { return <main className="pagina-auth"><section className="auth-card not-found"><img src={logoFull} alt="TrocaTicket"/><span className="eyebrow">Erro 404</span><h1 className="auth-card_pergunta">Não encontramos essa página.</h1><p className="auth-card_descricao">O endereço pode ter mudado ou não existe.</p><a href={route('home')} className="botao-principal">Voltar ao início →</a></section></main>; }
