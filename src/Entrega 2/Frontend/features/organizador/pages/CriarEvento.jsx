import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../../app/providers/StoreContext.jsx';
import useApi from '../../../shared/hooks/useApi.js';
import { acoes, leituras } from '../../planejamento/services/planejamentoApi.js';
import PageHeader from '../../../shared/dashboard/PageHeader.jsx';
import { Campo, Erro, EstadoApi, Vazio } from '../../planejamento/components/ui.jsx';

// Serve para criar (/eventos/novo) e editar (/eventos/:id/editar).
export default function CriarEvento() {
  const { id } = useParams();
  const { notify } = useStore();
  const navigate = useNavigate();
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const { dados, carregando, erro: erroCarga, recarregar } = useApi(() => (id ? leituras.eventoDoOrganizador(id) : Promise.resolve({ evento: null })), [id]);
  const atual = dados?.evento;

  if (id && !dados) {
    if (erroCarga && /não encontrado/i.test(erroCarga)) {
      return <Vazio titulo="Evento não encontrado" texto="Este evento não existe ou não pertence à sua conta."><Link className="botao-principal" to="/organizador/eventos">Voltar aos eventos</Link></Vazio>;
    }
    return <EstadoApi carregando={carregando} erro={erroCarga} dados={dados} recarregar={recarregar} />;
  }

  const submit = async (e) => {
    e.preventDefault();
    const form = Object.fromEntries(new FormData(e.currentTarget));
    setSalvando(true);
    const r = id ? await acoes.atualizarEvento(id, form) : await acoes.criarEvento(form);
    setSalvando(false);
    if (!r.ok) return setErro(r.erro);
    notify(id ? 'Evento atualizado.' : 'Evento criado como rascunho. Cadastre os itens de custo.');
    navigate(`/organizador/eventos/${r.id}`);
  };

  return (
    <>
      <PageHeader eyebrow="Eventos" title={id ? 'Editar evento' : 'Criar evento'} subtitle="Informe período, local e as estimativas de público. Cada evento tem um único tipo de ingresso." />
      <form className="form-painel plan-form plan-form--evento" onSubmit={submit} noValidate>
        <Campo id="ev-nome" label="Nome do evento" className="plan-campo--cheio"><input id="ev-nome" name="nome" required minLength={3} defaultValue={atual?.nome} /></Campo>
        <Campo id="ev-desc" label="Descrição (opcional)" className="plan-campo--cheio"><textarea id="ev-desc" name="descricao" rows="2" defaultValue={atual?.descricao} /></Campo>
        <Campo id="ev-ini" label="Início"><input id="ev-ini" name="inicio" type="date" required defaultValue={atual?.inicio} /></Campo>
        <Campo id="ev-fim" label="Fim"><input id="ev-fim" name="fim" type="date" required defaultValue={atual?.fim} /></Campo>
        <Campo id="ev-local" label="Local" className="plan-campo--cheio"><input id="ev-local" name="local" required minLength={3} defaultValue={atual?.local} placeholder="Ex.: Pátio da FECAP — São Paulo/SP" /></Campo>
        <Campo id="ev-min" label="Público mínimo"><input id="ev-min" name="publicoMin" type="number" min="1" step="1" required defaultValue={atual?.publicoMin} /></Campo>
        <Campo id="ev-max" label="Público máximo"><input id="ev-max" name="publicoMax" type="number" min="1" step="1" required defaultValue={atual?.publicoMax} /></Campo>
        <Campo id="ev-esp" label="Público esperado (opcional)" dica="Referência extra entre o mínimo e o máximo."><input id="ev-esp" name="publicoEsperado" type="number" min="1" step="1" defaultValue={atual?.publicoEsperado ?? ''} /></Campo>
        <Campo id="ev-margem" label="Margem de lucro (%)" dica="Aplicada sobre a receita. Ex.: 20 para 20%."><input id="ev-margem" name="margem" type="number" min="0" max="99.99" step="0.01" required defaultValue={atual?.margem ?? 20} /></Campo>
        <Erro texto={erro} />
        <div className="plan-form_acoes plan-campo--cheio">
          <button className="botao-principal" type="submit" disabled={salvando}>{salvando ? 'Salvando…' : id ? 'Salvar alterações' : 'Criar evento'}</button>
          <Link className="botao-detalhes" to={id ? `/organizador/eventos/${id}` : '/organizador/eventos'}>Cancelar</Link>
        </div>
      </form>
    </>
  );
}
