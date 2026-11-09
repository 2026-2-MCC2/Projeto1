import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../../assets/images/logo_trocaticket.png';
import { acoes } from '../../planejamento/services/planejamentoApi.js';
import { CATEGORIAS } from '../../planejamento/services/planejamento.js';
import { route } from '../../../app/routes/paths.js';

// Autocadastro de Organizador e Fornecedor (RF01 e RF02): o status inicial é sempre "Pendente".
export default function CadastroParceiro() {
  const [papel, setPapel] = useState('organizador');
  const [erro, setErro] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (form.get('senha') !== form.get('confirmar')) return setErro('As senhas não coincidem.');
    setEnviando(true);
    const r = await acoes.cadastrarParceiro({
      role: papel, nome: form.get('nome'), empresa: form.get('empresa'), cnpj: form.get('documento'),
      email: form.get('email'), telefone: form.get('telefone'), atuacao: form.getAll('atuacao'), senha: form.get('senha'),
    });
    setEnviando(false);
    if (!r.ok) return setErro(r.erro);
    setErro('');
    setEnviado(true);
  };

  if (enviado) {
    return (
      <main className="pagina-auth">
        <section className="auth-card" role="status">
          <h1 className="auth-card_pergunta">Cadastro enviado!</h1>
          <p className="auth-card_descricao">Seu cadastro está <strong>pendente</strong>. Assim que o administrador da TrocaTicket aprovar, você poderá entrar na área de parceiros.</p>
          <Link className="botao-principal" to={route('staffLogin')}>Ir para o login</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="pagina-auth">
      <form className="auth-card" onSubmit={submit} noValidate>
        <Link className="img-centralizada" to={route('home')}><img src={logo} width="120" height="120" alt="Logo da TrocaTicket" /></Link>
        <span className="eyebrow">Área de parceiros</span>
        <h1 className="auth-card_pergunta">Cadastro de parceiro</h1>
        <p className="auth-card_descricao">Organizadores e fornecedores passam por aprovação antes de usar a plataforma.</p>

        <div className="campo">
          <label htmlFor="pc-papel">Eu sou</label>
          <select id="pc-papel" value={papel} onChange={(e) => setPapel(e.target.value)}>
            <option value="organizador">Organizador de eventos</option>
            <option value="fornecedor">Fornecedor de produtos ou serviços</option>
          </select>
        </div>
        <div className="campo"><label htmlFor="pc-nome">Nome do responsável</label><input id="pc-nome" name="nome" autoComplete="name" required /></div>
        <div className="campo"><label htmlFor="pc-empresa">Empresa (opcional)</label><input id="pc-empresa" name="empresa" autoComplete="organization" /></div>
        <div className="campo"><label htmlFor="pc-doc">CNPJ</label><input id="pc-doc" name="documento" inputMode="numeric" placeholder="00.000.000/0000-00" required /></div>
        <div className="campo"><label htmlFor="pc-email">E-mail</label><input id="pc-email" name="email" type="email" autoComplete="email" required /></div>
        <div className="campo"><label htmlFor="pc-tel">Telefone</label><input id="pc-tel" name="telefone" type="tel" autoComplete="tel" /></div>

        {papel === 'fornecedor' && (
          <fieldset className="plan-fieldset">
            <legend>Áreas de atuação</legend>
            {CATEGORIAS.map((c) => <label key={c} className="plan-check"><input type="checkbox" name="atuacao" value={c} /> {c}</label>)}
          </fieldset>
        )}

        <div className="campo"><label htmlFor="pc-senha">Crie uma senha</label><input id="pc-senha" name="senha" type="password" minLength={8} autoComplete="new-password" placeholder="Mínimo de 8 caracteres" required /></div>
        <div className="campo"><label htmlFor="pc-conf">Confirme a senha</label><input id="pc-conf" name="confirmar" type="password" minLength={8} autoComplete="new-password" required /></div>

        {erro && <p className="campo-erro" role="alert">{erro}</p>}
        <button className="botao-principal" type="submit" disabled={enviando}>{enviando ? 'Enviando…' : <>Enviar para aprovação <span aria-hidden="true">→</span></>}</button>
        <p className="auth-card_rodape">Já foi aprovado? <Link to={route('staffLogin')}><strong>Entrar</strong></Link></p>
      </form>
    </main>
  );
}
