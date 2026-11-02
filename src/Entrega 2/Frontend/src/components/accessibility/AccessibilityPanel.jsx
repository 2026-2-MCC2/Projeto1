import { Accessibility, ChevronRight } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useA11y } from '../../context/AccessibilityContext.jsx';
import AccessibilityOptions from './AccessibilityOptions.jsx';

export default function AccessibilityPanel() {
  const { fecharPainel } = useA11y();
  const fechar = useRef(null);

  useEffect(() => {
    const anterior = document.activeElement;
    fechar.current?.focus();
    const esc = (e) => e.key === 'Escape' && fecharPainel();
    window.addEventListener('keydown', esc);
    return () => { window.removeEventListener('keydown', esc); anterior?.focus?.(); };
  }, [fecharPainel]);

  return (
    <div className="a11y-fundo" onMouseDown={(e) => e.target === e.currentTarget && fecharPainel()}>
      <section className="a11y-painel" role="dialog" aria-modal="true" aria-labelledby="a11y-titulo">
        <header className="a11y-topo">
          <Accessibility size={44} strokeWidth={1.6} aria-hidden="true" />
          <h2 id="a11y-titulo">Configurações<small>de +Acessibilidade</small></h2>
          <button ref={fechar} className="a11y-fechar" onClick={fecharPainel} aria-label="Fechar configurações de acessibilidade"><ChevronRight size={24} /></button>
        </header>
        <AccessibilityOptions idPrefix="painel" />
      </section>
    </div>
  );
}
