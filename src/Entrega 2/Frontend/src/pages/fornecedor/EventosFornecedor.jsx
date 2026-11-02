import { useState } from 'react';
import eventsData from '../../data/eventos.json';
import useSolicitacoes from '../../hooks/useSolicitacoes.js';
import PageHeader from '../../components/dashboard/PageHeader.jsx';
import EventPolaroid from '../../components/events/EventPolaroid.jsx';

export default function EventosFornecedor() {
  const { criar } = useSolicitacoes();
  const [category, setCategory] = useState('Todos');
  const categories = ['Todos', ...new Set(eventsData.map((event) => event.categoria))];
  const filtered = eventsData.filter((event) => category === 'Todos' || event.categoria === category);
  return <><PageHeader eyebrow="Oportunidades" title="Eventos disponíveis" subtitle="Conheça os eventos e envie uma solicitação para participar como fornecedor."/><nav className="category-filters supplier-event-filters" aria-label="Filtrar eventos">{categories.map((item)=><button type="button" key={item} className={category===item?'selected':''} aria-pressed={category===item} onClick={()=>setCategory(item)}>{item}</button>)}</nav><section className="tt-polaroid-grid supplier-polaroid-grid">{filtered.map((event)=><EventPolaroid key={event.id} event={event} action={<button type="button" className="botao-detalhes" onClick={()=>criar({tipo:'Fornecimento',problema:`Fornecer para ${event.nome}`})}>Solicitar participação ↗</button>}/>)}</section></>;
}
