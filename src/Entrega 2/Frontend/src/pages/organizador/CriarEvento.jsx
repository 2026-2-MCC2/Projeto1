import { useNavigate } from 'react-router-dom';
import useMeusEventos from '../../hooks/useMeusEventos.js';
import PageHeader from '../../components/dashboard/PageHeader.jsx';

export default function CriarEvento() {
  const { criar } = useMeusEventos();
  const navigate = useNavigate();
  const submit = (e) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    criar({ nome: String(d.get('nome')).trim(), data: String(d.get('data')), valor: String(d.get('valor')).trim() || 'Gratuito' });
    navigate('/organizador/eventos');
  };
  return (
    <>
      <PageHeader eyebrow="Eventos" title="Criar evento" subtitle="Preencha os dados básicos. A equipe analisa antes de publicar." />
      <form className="form-painel" onSubmit={submit}>
        <label htmlFor="ev-nome">Nome do evento</label><input id="ev-nome" name="nome" required />
        <label htmlFor="ev-data">Data</label><input id="ev-data" name="data" type="date" required />
        <label htmlFor="ev-valor">Valor do ingresso</label><input id="ev-valor" name="valor" placeholder="Ex.: R$ 90 ou Gratuito" />
        <button className="botao-principal">Enviar para análise</button>
      </form>
    </>
  );
}
