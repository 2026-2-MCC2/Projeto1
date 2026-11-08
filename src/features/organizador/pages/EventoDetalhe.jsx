import { Link, useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../../app/providers/StoreContext.jsx';
import useApi from '../../../shared/hooks/useApi.js';
import { acoes, leituras } from '../../planejamento/services/planejamentoApi.js';
import { STATUS_EVENTO, TRANSICOES, moeda, periodo } from '../../planejamento/services/planejamento.js';
import PageHeader from '../../../shared/dashboard/PageHeader.jsx';
import StatCard from '../../../shared/dashboard/StatCard.jsx';
import StatusBadge from '../../../shared/dashboard/StatusBadge.jsx';
import ItensCusto from '../../planejamento/components/ItensCusto.jsx';
import CustosEvento from '../../planejamento/components/CustosEvento.jsx';
import OrcamentoTicket from '../../planejamento/components/OrcamentoTicket.jsx';
import { AvisoErro, Erro, EstadoApi, Vazio, useAcao } from '../../planejamento/components/ui.jsx';

const ROTULO_TRANSICAO = {
  [STATUS_EVENTO.aberto]: 'Abrir para cotação',
  [STATUS_EVENTO.encerrado]: 'Encerrar cotação',
  [STATUS_EVENTO.fechado]: 'Fechar orçamento',
  [STATUS_EVENTO.rascunho]: 'Voltar para rascunho',
};

// Painel completo de um evento: itens, propostas, custos, orçamento e ticket (dados vindos da API).
export default function EventoDetalhe() {
  const { id } = useParams();
  const { notify } = useStore();
  const navigate = useNavigate();
  const [erro, executar] = useAcao(notify);
  const { dados, carregando, erro: erroCarga, recarregar } = useApi(() => leituras.eventoDoOrganizador(id), [id]);

  if (!dados) {
    if (erroCarga && /não encontrado/i.test(erroCarga)) {
      return <Vazio titulo="Evento não encontrado" texto="Este evento não existe ou não pertence à sua conta."><Link className="botao-principal" to="/organizador/eventos">Voltar aos eventos</Link></Vazio>;
    }
    return <EstadoApi carregando={carregando} erro={erroCarga} dados={dados} recarregar={recarregar} />;
  }

  const { evento, itens, custos, propostas, resumo } = dados;
  const publicoRef = resumo.publicoReferencia;
  const recebidas = propostas.filter((p) => p.status !== 'Cancelada').length;
  const rodar = (promessa, sucesso, depois) => executar(promessa, sucesso, (r) => { recarregar(); depois?.(r); });
  const excluir = () => {
    if (!window.confirm(`Excluir “${evento.nome}” com todos os itens, custos e propostas? Esta ação não pode ser desfeita.`)) return;
    rodar(acoes.excluirEvento(evento.id), 'Evento excluído.', () => navigate('/organizador/eventos'));
  };

  return (
    <>
      <PageHeader eyebrow="Evento" title={evento.nome} subtitle={`${periodo(evento.inicio, evento.fim)} · ${evento.local} · público de ${evento.publicoMin.toLocaleString('pt-BR')} a ${evento.publicoMax.toLocaleString('pt-BR')}`}>
        <div className="plan-topo-acoes">
          <StatusBadge status={evento.status} />
          {evento.status !== STATUS_EVENTO.fechado && <Link className="botao-detalhes" to={`/organizador/eventos/${evento.id}/editar`}>Editar dados</Link>}
          {(TRANSICOES[evento.status] || []).map((novo) => (
            <button key={novo} className={novo === STATUS_EVENTO.aberto || novo === STATUS_EVENTO.fechado ? 'botao-principal' : 'botao-detalhes'}
              onClick={() => rodar(acoes.alterarStatus(evento.id, novo), `Status alterado para “${novo}”.`)}>{ROTULO_TRANSICAO[novo]}</button>
          ))}
          <button className="botao-detalhes plan-perigo" onClick={excluir}>Excluir</button>
        </div>
      </PageHeader>
      <Erro texto={erro} />
      <AvisoErro erro={erroCarga} dados={dados} />

      <section className="cards-resumo">
        <StatCard tone="rosa" label="Itens de custo" value={itens.length} />
        <StatCard tone="laranja" label="Propostas recebidas" value={recebidas} />
        <StatCard tone="marinho" label="Itens com proposta selecionada" value={`${resumo.itensFechados}/${itens.length}`} />
        <StatCard tone="verde" label={`Ticket-alvo (${publicoRef.toLocaleString('pt-BR')} pessoas)`} value={resumo.ticketAlvo == null ? '—' : moeda(resumo.ticketAlvo)} />
      </section>

      <ItensCusto evento={evento} itens={itens} propostas={propostas} acoes={acoes} notify={notify} recarregar={recarregar} />
      <CustosEvento evento={evento} custos={custos} acoes={acoes} notify={notify} recarregar={recarregar} />
      <OrcamentoTicket evento={evento} itens={itens} propostas={propostas} custos={custos} />
    </>
  );
}
