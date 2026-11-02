import { useMemo, useState } from 'react';
import { Search, CalendarDays, MapPin } from 'lucide-react';
import eventsData from '../../data/eventos.json';
import Header from '../../components/layout/Header.jsx';
import Footer from '../../components/layout/Footer.jsx';
import EventModal from '../../components/events/EventModal.jsx';

const categories = [
  { label: 'Todos', values: [] },
  { label: 'Show / Concerto', values: ['Show', 'Música'] },
  { label: 'Festival', values: ['Festival'] },
  { label: 'Teatro', values: ['Teatro'] },
  { label: 'Cultura', values: ['Cultura'] },
];

const months = { jan: 0, fev: 1, mar: 2, abr: 3, mai: 4, jun: 5, jul: 6, ago: 7, set: 8, out: 9, nov: 10, dez: 11 };
function eventDate(value = '') {
  const match = value.toLocaleLowerCase('pt-BR').match(/(\d{1,2})\s+([a-zç]{3})\s+(\d{4})/);
  if (!match) return null;
  const month = months[match[2].slice(0, 3)];
  return month === undefined ? null : new Date(Number(match[3]), month, Number(match[1]));
}
function Polaroid({ event, onSelect }) {
  return (
    <article className="events-polaroid">
      <button className="events-polaroid_open" onClick={() => onSelect(event)} aria-label={`Ver detalhes de ${event.nome}`}>
        <span className="events-polaroid_photo">
          <img src={event.imagem} alt={event.imagemAlt || `Imagem ilustrativa de ${event.nome}`} loading="lazy"/>
          <span className="events-polaroid_category">{event.categoria}</span>
        </span>
        <span className="events-polaroid_content">
          <strong className="events-polaroid_title">{event.nome}</strong>
          <span className="events-polaroid_line"><small>Local</small><span>{event.local}</span></span>
          <span className="events-polaroid_line"><small>Organização</small><span>{event.organizador || 'A confirmar'}</span></span>
          <span className="events-polaroid_price">{event.precoMedio || event.preco}</span>
          <span className="events-polaroid_period">{event.periodo || event.data} · {event.horario || 'Horário a confirmar'}</span>
          <span className="events-polaroid_arrow" aria-hidden="true">›</span>
        </span>
      </button>
    </article>
  );
}

export default function EventsPage() {
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('Todos');
  const [submitted, setSubmitted] = useState(false);

  const filtered = useMemo(() => eventsData.filter((event) => {
    const text = `${event.nome} ${event.categoria} ${event.local} ${event.organizador || ''}`.toLocaleLowerCase('pt-BR');
    const date = eventDate(event.data);
    const chosenCategory = categories.find((item) => item.label === category);
    const categoryMatch = !chosenCategory?.values.length || chosenCategory.values.includes(event.categoria);
    const queryMatch = !query.trim() || text.includes(query.trim().toLocaleLowerCase('pt-BR'));
    const locationMatch = !location.trim() || event.local.toLocaleLowerCase('pt-BR').includes(location.trim().toLocaleLowerCase('pt-BR'));
    const startMatch = !startDate || (date && date >= new Date(`${startDate}T00:00:00`));
    const endMatch = !endDate || (date && date <= new Date(`${endDate}T23:59:59`));
    return categoryMatch && queryMatch && locationMatch && startMatch && endMatch;
  }), [query, location, startDate, endDate, category]);

  const clearFilters = () => {
    setQuery(''); setLocation(''); setStartDate(''); setEndDate(''); setCategory('Todos'); setSubmitted(false);
  };

  return (
    <>
      <Header/>
      <main className="events-page">
        <section className="events-page_intro container">
          <span className="eyebrow">Agenda TrocaTicket</span>
          <h1>EVENTOS</h1>
          <p>Novas experiências para se viver.</p>
        </section>

        <section className="events-search container" aria-label="Pesquisar eventos">
          <form className="events-search_form" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
            <label className="events-search_field events-search_name">
              <Search className="events-search_icon" size={20} aria-hidden="true" />
              <span><small>Nome do evento, show, palestra...</small><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ex.: Festival Indie" /></span>
            </label>
            <label className="events-search_field">
              <CalendarDays className="events-search_icon" size={20} aria-hidden="true" />
              <span><small>Data inicial</small><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></span>
            </label>
            <label className="events-search_field">
              <CalendarDays className="events-search_icon" size={20} aria-hidden="true" />
              <span><small>Data final</small><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></span>
            </label>
            <label className="events-search_field">
              <MapPin className="events-search_icon" size={20} aria-hidden="true" />
              <span><small>Localização</small><input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Cidade ou espaço" /></span>
            </label>
            <button className="events-search_submit" type="submit">Pesquisar</button>
          </form>
        </section>

        <section className="events-list container">
          <div className="events-categories" aria-label="Filtrar por categoria">
            {categories.map((item) => (
              <button key={item.label} className={category === item.label ? 'active' : ''} onClick={() => setCategory(item.label)} aria-pressed={category === item.label}>{item.label}</button>
            ))}
          </div>
          <div className="events-list_heading">
            <div><span className="eyebrow">Programação</span><h2>{category === 'Todos' ? 'Encontre seu próximo evento' : category}</h2></div>
            <span className="events-result-count">{filtered.length} {filtered.length === 1 ? 'evento encontrado' : 'eventos encontrados'}</span>
          </div>
          {filtered.length ? (
            <div className="events-polaroid_grid">{filtered.map((event) => <Polaroid key={event.id} event={event} onSelect={setSelected}/>)}</div>
          ) : (
            <div className="events-empty"><strong>Nenhum evento encontrado.</strong><p>Experimente alterar a categoria, a data ou a localização.</p><button onClick={clearFilters}>Limpar filtros</button></div>
          )}
          {(submitted || query || location || startDate || endDate) && filtered.length > 0 && <button className="events-clear" onClick={clearFilters}>Limpar pesquisa e filtros</button>}
        </section>
      </main>
      <Footer/>
      <EventModal event={selected} onClose={() => setSelected(null)}/>
    </>
  );
}
