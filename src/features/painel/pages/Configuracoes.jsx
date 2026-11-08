import { useStore } from '../../../app/providers/StoreContext.jsx';
import AccessibilityOptions from '../../acessibilidade/components/AccessibilityOptions.jsx';
import PageHeader from '../../../shared/dashboard/PageHeader.jsx';

export default function Configuracoes() {
  const { account, updateAccount } = useStore();
  const submit = (e) => {
    e.preventDefault();
    updateAccount({ ...account, name: String(new FormData(e.currentTarget).get('name')).trim() });
  };
  return (
    <>
      <PageHeader eyebrow="Conta" title="Configurações" subtitle="Atualize seus dados e ajuste a acessibilidade da interface." />
      <form className="form-painel" onSubmit={submit}>
        <label htmlFor="cfg-nome">Nome</label><input id="cfg-nome" name="name" defaultValue={account.name} required />
        <label htmlFor="cfg-email">E-mail</label><input id="cfg-email" value={account.email} readOnly />
        <button className="botao-principal">Salvar alterações</button>
      </form>
      <section className="form-painel" aria-labelledby="cfg-a11y">
        <h2 id="cfg-a11y">+Acessibilidade</h2>
        <AccessibilityOptions idPrefix="cfg" />
      </section>
    </>
  );
}
