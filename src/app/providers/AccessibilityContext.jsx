import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AccessibilityPanel from '../../features/acessibilidade/components/AccessibilityPanel.jsx';
import ColorFilters from '../../features/acessibilidade/components/ColorFilters.jsx';
import TutorialGuide from '../../features/acessibilidade/components/TutorialGuide.jsx';
import useAssistive from '../../shared/hooks/useAssistive.js';

const KEY = 'trocaticket-a11y';
export const FONT_MIN = -2;
export const FONT_MAX = 4;
export const padroes = {
  fontStep: 0, daltonismo: 'nenhum', voz: false, libras: false, tutorial: false,
  fonteLegivel: false, espacamento: false, destacarLinks: false, reduzirMovimento: false,
};

const Ctx = createContext(null);

export function AccessibilityProvider({ children }) {
  const [opts, setOpts] = useState(() => {
    try { return { ...padroes, ...JSON.parse(localStorage.getItem(KEY)) }; } catch { return padroes; }
  });
  const [painelAberto, setPainelAberto] = useState(false);

  // Aplica tudo no <html>: o CSS reage aos atributos data-*
  useEffect(() => {
    const el = document.documentElement;
    el.style.fontSize = `${100 + opts.fontStep * 10}%`;
    el.dataset.daltonismo = opts.daltonismo;
    const app = document.getElementById('root');
    if (app) app.dataset.daltonismo = opts.daltonismo;
    el.dataset.fonteLegivel = String(opts.fonteLegivel);
    el.dataset.espacamento = String(opts.espacamento);
    el.dataset.links = String(opts.destacarLinks);
    el.dataset.movimento = opts.reduzirMovimento ? 'reduzido' : 'normal';
    try { localStorage.setItem(KEY, JSON.stringify(opts)); } catch { /* armazenamento bloqueado */ }
  }, [opts]);

  useAssistive(opts);

  const set = useCallback((patch) => setOpts((o) => ({ ...o, ...patch })), []);
  const mudarFonte = useCallback((delta) => setOpts((o) => ({ ...o, fontStep: Math.min(FONT_MAX, Math.max(FONT_MIN, o.fontStep + delta)) })), []);
  const restaurar = useCallback(() => setOpts(padroes), []);

  const value = useMemo(() => ({
    opts, set, mudarFonte, restaurar, painelAberto,
    abrirPainel: () => setPainelAberto(true), fecharPainel: () => setPainelAberto(false),
  }), [opts, set, mudarFonte, restaurar, painelAberto]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <ColorFilters />
      {painelAberto && <AccessibilityPanel />}
      {opts.tutorial && <TutorialGuide onClose={() => set({ tutorial: false })} />}
    </Ctx.Provider>
  );
}

export function useA11y() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useA11y precisa estar dentro de AccessibilityProvider');
  return ctx;
}
