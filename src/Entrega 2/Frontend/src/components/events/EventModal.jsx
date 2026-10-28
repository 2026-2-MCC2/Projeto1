import { useEffect } from 'react';
import { useStore } from '../../context/StoreContext.jsx';

export default function EventModal({ event, onClose }) {
  const store = useStore();
  useEffect(() => { const esc = (e) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', esc); return () => window.removeEventListener('keydown', esc); }, [onClose]);
  if (!event) return null;
  return <div className="modal-overlay" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><section className="modal-caixa event-detail" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button className="modal-fechar" onClick={onClose} aria-label="Fechar">×</button>{event.imagem && <><img className="modal-evento_imagem" src={event.imagem} alt={event.imagemAlt || `Imagem ilustrativa: ${event.nome}`}/><small className="image-caption">Imagem ilustrativa; não é o cartaz oficial do evento.</small></>}<span className="eyebrow">{event.categoria} · Evento demonstrativo</span><h2 id="modal-title">{event.nome}</h2><p className="event-detail-description">{event.descricao || 'Os detalhes completos serão publicados quando as informações oficiais estiverem disponíveis.'}</p><dl className="event-detail-facts"><div><dt>Data</dt><dd>{event.data}</dd></div><div><dt>Local informado</dt><dd>{event.local}</dd></div><div><dt>Ingresso</dt><dd>{event.preco}</dd></div></dl><p className="event-demo-note">Os dados do evento, disponibilidade e valores são exemplos e precisam ser confirmados pela organização.</p><button className="botao-principal" onClick={() => {store.addToCart(event); onClose();}}>Adicionar ingresso ao carrinho <span>→</span></button></section></div>;
}
