import { Link } from 'react-router-dom';
import { useStore } from '../../../app/providers/StoreContext.jsx';
import useApi from '../../../shared/hooks/useApi.js';
import { leituras } from '../../planejamento/services/planejamentoApi.js';
import { moeda } from '../../planejamento/services/planejamento.js';
import StatCard from '../../../shared/dashboard/StatCard.jsx';
import PageHeader from '../../../shared/dashboard/PageHeader.jsx';
import { AvisoErro, EstadoApi } from '../../planejamento/components/ui.jsx';

const COR = { Selecionada: 'verde', 'Não selecionada': 'vermelho', Enviada: 'laranja' };
const TEXTO = {
  Selecionada: (p) => `Sua proposta PR-${String(p.id).padStart(3, '0')} foi selecionada.`,
  'Não selecionada': (p) => `A proposta PR-${String(p.id).padStart(3, '0')} não foi selecionada.`,
  Enviada: (p) => `Proposta PR-${String(p.id).padStart(3, '0')} aguardando decisão do organizador.`,
};

export default function FornecedorDashboard() {
  const { account } = useStore();
  const { dados, carregando, erro, recarregar } = useApi(async () => {
    const [propostas, cotacoes] = await Promise.all([leituras.minhasPropostas(), leituras.cotacoes()]);
    return { propostas: propostas.propostas, abertos: cotacoes.eventos.length };
  }, []);
  const minhas = (dados?.propostas ?? []).filter((p) => p.status !== 'Cancelada');
  const selecionadas = minhas.filter((p) => p.status === 'Selecionada');
  return (
    <>
      <PageHeader eyebrow={`Olá, ${account.name}!`} title="Bem-vindo ao seu painel" subtitle="Veja as oportunidades de cotação e o andamento das suas propostas." />
      <EstadoApi carregando={carregando} erro={erro} dados={dados} recarregar={recarregar} />
      <AvisoErro erro={erro} dados={dados} />
      {dados && (
        <div className="layout-duas-colunas">
          <div className="coluna">
            <section className="cards-resumo">
              <StatCard tone="rosa" label="Propostas enviadas" value={minhas.length} />
              <StatCard tone="laranja" label="Aguardando decisão" value={minhas.filter((p) => p.status === 'Enviada').length} />
              <StatCard tone="verde" label="Selecionadas" value={selecionadas.length} />
              <StatCard tone="azul" label="Eventos abertos" value={dados.abertos} />
            </section>
            <div className="banner-faturamento"><strong>Valor das propostas selecionadas:</strong> <span>{moeda(selecionadas.reduce((s, p) => s + p.valor, 0))}</span></div>
            <Link className="acao-rapida acao-rapida--destaque" to="/fornecedor/eventos"><strong>Ver eventos abertos para cotação</strong><small>Envie propostas para os itens que você atende</small></Link>
          </div>
          <aside className="painel-lateral">
            <h2>Atividade recente</h2>
            {minhas.length ? (
              <ul className="lista-notificacoes">
                {minhas.slice(0, 6).map((p) => <li key={p.id}><span className={`dot dot--${COR[p.status] || 'laranja'}`} aria-hidden="true" />{(TEXTO[p.status] || (() => `Proposta ${p.id}`))(p)}</li>)}
              </ul>
            ) : <p>Você ainda não enviou propostas.</p>}
          </aside>
        </div>
      )}
    </>
  );
}
