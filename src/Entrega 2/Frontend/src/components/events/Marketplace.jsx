import { useMemo, useState } from 'react';
import eventsData from '../../data/eventos.json';
import EventPolaroid from './EventPolaroid.jsx';

export default function Marketplace({ onSelect }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todos');
  const categories = ['Todos', ...new Set(eventsData.map((event) => event.categoria))];
  const filtered = useMemo(() => eventsData.filter((event) => (category === 'Todos' || event.categoria === category) && `${event.nome} ${event.local} ${event.categoria} ${event.organizador || ''}`.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'))), [category, query]);
  return <section className="marketplace container" id="marketplace"><header className="marketplace-heading"><div><span className="eyebrow">Marketplace</span><h2>Escolha como viver.</h2><p>Encontre eventos por nome, categoria ou cidade.</p></div><label className="market-search"><span aria-hidden="true">⌕</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar eventos..." aria-label="Buscar eventos"/></label></header><div className="category-filters" aria-label="Filtrar por categoria">{categories.map((item) => <button type="button" key={item} className={category === item ? 'selected' : ''} onClick={() => setCategory(item)} aria-pressed={category===item}>{item}</button>)}</div>{filtered.length ? <div className="tt-polaroid-grid">{filtered.map((event) => <EventPolaroid key={event.id} event={event} onSelect={onSelect}/>)}</div> : <div className="no-results"><strong>Nenhum evento encontrado.</strong><p>Tente outro nome ou categoria.</p><button onClick={() => {setQuery('');setCategory('Todos');}}>Limpar filtros</button></div>}</section>;
}
