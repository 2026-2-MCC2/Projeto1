import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../../assets/images/logo_trocaticket.png';
import { useStore } from '../../context/StoreContext.jsx';
import { homeFor, route } from '../../routes/paths.js';

export default function AuthForm({ signup = false, equipe = false }) {
  const [error, setError] = useState('');
  const store = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const submit = (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    if (signup && data.get('senha') !== data.get('confirmar')) return setError('As senhas não coincidem.');
    const email = String(data.get('email')).trim().toLowerCase();
    const role = String(data.get('perfil'));
    const user = signup ? store.signUp({ name: String(data.get('nome')).trim(), email, role }) : store.signIn(email, role);
    navigate(location.state?.from || homeFor(user.role), { replace: true });
  };

  return (
    
<main className="pagina-auth">
  <form className="auth-card" onSubmit={submit}>
    <Link
      className="img-centralizada"
      to={route('home')}
    >
      <img
        src={logo}
        width="120"
        height="120"
        alt="Logo da TrocaTicket"
      />
    </Link>

    <span className="eyebrow">
      Sua próxima experiência
    </span>

    <h1 className="auth-card_pergunta">
      {signup
        ? 'Crie sua conta'
        : 'Que bom ter você de volta.'}
    </h1>

    <p className="auth-card_descricao">
      {signup
        ? 'Cadastre-se para acessar eventos, ingressos e experiências.'
        : 'Acesse seus eventos, ingressos e pedidos.'}
    </p>

    {signup && (
      <div className="campo">
        <label htmlFor="nome">Nome completo</label>
        <input
          type="text"
          id="nome"
          name="nome"
          autoComplete="name"
          required
        />
      </div>
    )}

    <div className="campo">
      <label htmlFor="email">E-mail</label>
      <input
        type="email"
        id="email"
        name="email"
        placeholder="nome@exemplo.com"
        autoComplete="email"
        required
      />
    </div>

    <div className="campo">
      <label htmlFor="senha">
        {signup ? 'Crie uma senha' : 'Senha'}
      </label>

      <input
        type="password"
        id="senha"
        name="senha"
        placeholder={
          signup ? 'Mínimo de 8 caracteres' : 'Sua senha'
        }
        minLength={signup ? 8 : undefined}
        autoComplete={
          signup ? 'new-password' : 'current-password'
        }
        required
      />
    </div>

    {signup && (
      <div className="campo">
        <label htmlFor="confirmar">
          Confirme sua senha
        </label>

        <input
          type="password"
          id="confirmar"
          name="confirmar"
          placeholder="Repita sua senha"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>
    )}

    {error && (
      <p className="campo-erro" role="alert">
        {error}
      </p>
    )}

    <button className="botao-principal" type="submit">
      {signup ? 'Criar conta' : 'Entrar'}
      <span aria-hidden="true">→</span>
    </button>

    <p className="auth-card_rodape">
      {signup
        ? 'Já tem uma conta?'
        : 'Ainda não tem conta?'}

      {' '}
      <Link to={route(signup ? 'login' : 'signup')}>
        <strong>
          {signup ? 'Entrar' : 'Criar conta'}
        </strong>
      </Link>
    </p>
  </form>
</main>
  );
}
