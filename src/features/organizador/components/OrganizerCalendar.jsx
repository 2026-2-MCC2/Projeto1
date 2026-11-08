import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

const monthNames = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const monthMap = { jan:0, fev:1, mar:2, abr:3, mai:4, jun:5, jul:6, ago:7, set:8, out:9, nov:10, dez:11 };
export function parseCalendarDate(value = '') {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) { const [y,m,d] = value.split('-').map(Number); return new Date(y,m-1,d); }
  const match = String(value).toLocaleLowerCase('pt-BR').match(/(\d{1,2})(?:\s*[–-]\s*\d{1,2})?\s+([a-zç]{3})\s+(\d{4})/);
  if (!match || monthMap[match[2]] === undefined) return null;
  return new Date(Number(match[3]), monthMap[match[2]], Number(match[1]));
}
const dayKey = (date) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;

export default function OrganizerCalendar({ events = [] }) {
  const [month, setMonth] = useState(() => { const now = new Date(); return new Date(now.getFullYear(), now.getMonth(), 1); });
  const [selectedDay, setSelectedDay] = useState(() => dayKey(new Date()));
  const monthEvents = useMemo(() => events.map((event) => ({ ...event, parsedDate: parseCalendarDate(event.data) })).filter((event) => event.parsedDate && event.parsedDate.getFullYear() === month.getFullYear() && event.parsedDate.getMonth() === month.getMonth()), [events, month]);
  const eventDays = new Set(monthEvents.map((event) => dayKey(event.parsedDate)));
  const firstWeekday = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth()+1, 0).getDate();
  const cells = [...Array(firstWeekday).fill(null), ...Array.from({length:daysInMonth}, (_,i)=>i+1)];
  while (cells.length % 7) cells.push(null);
  const selectedEvents = monthEvents.filter((event) => dayKey(event.parsedDate) === selectedDay);
  const moveMonth = (delta) => { const next = new Date(month.getFullYear(), month.getMonth()+delta, 1); setMonth(next); setSelectedDay(dayKey(next)); };
  return (
    <section className="organizer-calendar" aria-label="Calendário dos eventos">
      <header className="organizer-calendar-heading"><div><span className="eyebrow">Planejamento</span><h2><CalendarDays size={21}/> Calendário de eventos</h2><p>Selecione um dia para consultar os eventos programados.</p></div><div className="organizer-calendar-controls"><button type="button" onClick={() => moveMonth(-1)} aria-label="Mês anterior"><ChevronLeft/></button><strong>{monthNames[month.getMonth()]} {month.getFullYear()}</strong><button type="button" onClick={() => moveMonth(1)} aria-label="Próximo mês"><ChevronRight/></button></div></header>
      <div className="organizer-calendar-layout"><div className="organizer-calendar-grid" role="grid" aria-label={`${monthNames[month.getMonth()]} de ${month.getFullYear()}`}>
        {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map((day) => <span className="organizer-calendar-weekday" key={day}>{day}</span>)}
        {cells.map((day,index) => { const key = day ? dayKey(new Date(month.getFullYear(),month.getMonth(),day)) : `blank-${index}`; return <button type="button" key={key} disabled={!day} className={`organizer-calendar-day ${day && selectedDay===key?'is-selected':''} ${day && eventDays.has(key)?'has-event':''}`} onClick={() => day && setSelectedDay(key)} aria-pressed={day ? selectedDay===key : undefined} aria-label={day ? `${day} de ${monthNames[month.getMonth()]}${eventDays.has(key)?', tem evento':''}` : undefined}>{day}<span/></button>; })}
      </div><aside className="organizer-calendar-agenda"><h3>{selectedDay === dayKey(new Date()) ? 'Hoje' : new Date(`${selectedDay}T12:00:00`).toLocaleDateString('pt-BR',{day:'numeric',month:'long'})}</h3>{selectedEvents.length ? selectedEvents.map((event) => <article className="organizer-calendar-event" key={event.id}><strong>{event.nome}</strong><span>{event.horario || 'Horário a confirmar'}</span><small>{event.local || 'Local a confirmar'}</small><em>{event.status || 'Programado'}</em></article>) : <p>Nenhum evento cadastrado para este dia.</p>}</aside></div>
      <div className="organizer-calendar-legend"><span><i/> Dia com evento</span><small>{monthEvents.length} {monthEvents.length===1?'evento neste mês':'eventos neste mês'}</small></div>
    </section>
  );
}
