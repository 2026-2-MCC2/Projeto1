import { faq } from '../../data/painelMock.js';
import useSolicitacoes from '../../hooks/useSolicitacoes.js';
import PageHeader from '../../components/dashboard/PageHeader.jsx';

export default function Suporte() {
  const { criar } = useSolicitacoes();
  const submit = (e) => {
    e.preventDefault();
    criar({ tipo: 'Suporte', problema: String(new FormData(e.currentTarget).get('mensagem')).trim() });
    e.currentTarget.reset();
  };
  return (
    <>
      <PageHeader eyebrow="Ajuda" title="Suporte" subtitle="Veja as dúvidas frequentes ou abra uma solicitação." />
      <section className="faq">
        {faq.map(([p, r]) => <details key={p}><summary>{p}</summary><p>{r}</p></details>)}
      </section>
      <form className="form-painel" onSubmit={submit}>
        <label htmlFor="sup-msg">Descreva o problema</label>
        <textarea id="sup-msg" name="mensagem" rows="4" required />
        <button className="botao-principal">Enviar solicitação</button>
      </form>
    </>
  );
}
