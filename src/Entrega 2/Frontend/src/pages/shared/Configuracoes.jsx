import { useStore } from '../../context/StoreContext.jsx';
import ThemeButton from '../../components/common/ThemeButton.jsx';
import PageHeader from '../../components/dashboard/PageHeader.jsx';

export default function Configuracoes() {
  const { account, updateAccount } = useStore();
  const submit = (e) => {
    e.preventDefault();
    updateAccount({ ...account, name: String(new FormData(e.currentTarget).get('name')).trim() });
  };
  return (
    <>
      <PageHeader eyebrow="Conta" title="Configurações" subtitle="Atualize seus dados e o tema da interface." />
      <form className="form-painel" onSubmit={submit}>
        <label htmlFor="cfg-nome">Nome</label><input id="cfg-nome" name="name" defaultValue={account.name} required />
        <label htmlFor="cfg-email">E-mail</label><input id="cfg-email" value={account.email} readOnly />
        <button className="botao-principal">Salvar alterações</button>
      </form>
      <div className="form-painel"><span>Tema</span><ThemeButton /></div>
    </>
  );
}
