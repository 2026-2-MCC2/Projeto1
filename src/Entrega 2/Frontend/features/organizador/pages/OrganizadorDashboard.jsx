import { Link } from 'react-router-dom';
import { useStore } from '../../../app/providers/StoreContext.jsx';
import useMeusEventos from '../hooks/useMeusEventos.js';
import PageHeader from '../../../shared/dashboard/PageHeader.jsx';
import StatCard from '../../../shared/dashboard/StatCard.jsx';
import EventosTable from './EventosTable.jsx';
import { AvisoErro, EstadoApi } from '../../planejamento/components/ui.jsx';

export default function OrganizadorDashboard() {
  const { account } = useStore();
  const { eventos, dados, carregando, erro, recarregar } = useMeusEventos();
  return (
    <>
      <PageHeader eyebrow={`Olá, ${account.name}!`} title="Bem-vindo ao seu painel" subtitle="Acompanhe o planejamento, as cotações e o ticket estimado dos seus eventos." />
      <div className="layout-duas-colunas">
        <div className="coluna">
          <EstadoApi carregando={carregando} erro={erro} dados={dados} recarregar={recarregar} />
          <AvisoErro erro={erro} dados={dados} />
          {dados && (
            <section className="cards-resumo">
              <StatCard tone="rosa" label="Eventos" value={eventos.length} />
              <StatCard tone="laranja" label="Abertos para cotação" value={eventos.filter((e) => e.aberto).length} />
              <StatCard tone="azul" label="Propostas recebidas" value={eventos.reduce((s, e) => s + e.propostas, 0)} />
            </section>
          )}
          <Link to="/organizador/suporte" className="ajuda-banner">
            <strong>Precisa de ajuda para organizar seu evento?</strong>
            <span>Acesse nossa página de dúvidas frequentes ou entre em contato com nosso suporte.</span>
          </Link>
          {dados && <EventosTable title="Seus eventos" eventos={eventos} />}
        </div>
        <aside className="painel-lateral">
          <h2>Ações rápidas</h2>
          <Link className="acao-rapida acao-rapida--destaque" to="/organizador/eventos/novo"><strong>+ Criar evento</strong><small>Defina período, local e público</small></Link>
          <Link className="acao-rapida" to="/organizador/eventos"><strong>Ver calendário</strong><small>Confira todos os seus eventos</small></Link>
        </aside>
      </div>
    </>
  );
}
