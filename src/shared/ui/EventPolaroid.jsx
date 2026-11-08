/** Cartão Polaroid compartilhado entre páginas que exibem eventos/ingressos. */
export default function EventPolaroid({ event, onSelect, action, actionLabel = 'Ver evento', eyebrow = 'Evento', compact = false }) {
  const content = (
    <>
      <span className="tt-polaroid-photo">
        {event.imagem ? <img src={event.imagem} alt={event.imagemAlt || `Imagem de ${event.nome}`} loading="lazy" /> : <span className="tt-polaroid-placeholder">TROCATICKET</span>}
        <span className="tt-polaroid-category">{event.categoria || eyebrow}</span>
      </span>
      <span className="tt-polaroid-content">
        <span className="tt-polaroid-title">{event.nome}</span>
        <span className="tt-polaroid-meta"><small>LOCAL</small><span>{event.local || 'Local a confirmar'}</span></span>
        <span className="tt-polaroid-meta"><small>ORGANIZAÇÃO</small><span>{event.organizador || 'A confirmar'}</span></span>
        <span className="tt-polaroid-bottom"><strong>{event.precoMedio || event.preco || 'Preço a confirmar'}</strong><small>{event.periodo || event.data || 'Data a confirmar'}{event.horario ? ` · ${event.horario}` : ''}</small></span>
      </span>
    </>
  );
  return (
    <article className={`tt-polaroid ${compact ? 'tt-polaroid--compact' : ''}`}>
      {onSelect ? <button type="button" className="tt-polaroid-open" onClick={() => onSelect(event)} aria-label={`${actionLabel}: ${event.nome}`}>{content}<span className="tt-polaroid-arrow" aria-hidden="true">↗</span></button> : <div className="tt-polaroid-static">{content}</div>}
      {action && <div className="tt-polaroid-action">{action}</div>}
    </article>
  );
}
