import { Link } from 'react-router-dom';
import useMeusEventos from '../hooks/useMeusEventos.js';
import PageHeader from '../../../shared/dashboard/PageHeader.jsx';
import StatCard from '../../../shared/dashboard/StatCard.jsx';
import EventosTable from './EventosTable.jsx';
import OrganizerCalendar from '../components/OrganizerCalendar.jsx';
import { AvisoErro, EstadoApi } from '../../planejamento/components/ui.jsx';

export default function MeusEventos() {
  const { eventos, dados, carregando, erro, recarregar } = useMeusEventos();
  return (
    <>
      <PageHeader eyebrow="Eventos" title="Meus eventos" subtitle="Planeje custos, receba propostas e descubra o ticket ideal de cada evento.">
        <Link className="botao-principal" to="/organizador/eventos/novo">+ Criar evento</Link>
      </PageHeader>
      <EstadoApi carregando={carregando} erro={erro} dados={dados} recarregar={recarregar} />
      <AvisoErro erro={erro} dados={dados} />
      {dados && (
        <>
          <section className="cards-resumo">
            <StatCard tone="rosa" label="Total de eventos" value={eventos.length} />
            <StatCard tone="marinho" label="Abertos para cotação" value={eventos.filter((e) => e.aberto).length} />
            <StatCard tone="laranja" label="Propostas recebidas" value={eventos.reduce((s, e) => s + e.propostas, 0)} />
            <StatCard tone="verde" label="Propostas selecionadas" value={eventos.reduce((s, e) => s + e.selecionadas, 0)} />
          </section>
          <OrganizerCalendar events={eventos} />
          <EventosTable title="Lista de eventos" eventos={eventos} />
        </>
      )}
    </>
  );
}
