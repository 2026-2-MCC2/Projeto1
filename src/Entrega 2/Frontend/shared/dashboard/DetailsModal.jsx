import { useEffect } from 'react';

export default function DetailsModal({ title, fields, onClose, children }) {
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);
  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <section className="modal-caixa" role="dialog" aria-modal="true" aria-label={title}>
        <button className="modal-fechar" onClick={onClose} aria-label="Fechar">×</button>
        <h2>{title}</h2>
        {fields.map(([k, v]) => <p key={k}><strong>{k}:</strong> {v}</p>)}
        {children}
        <button className="botao-detalhes" onClick={onClose}>Fechar</button>
      </section>
    </div>
  );
}
