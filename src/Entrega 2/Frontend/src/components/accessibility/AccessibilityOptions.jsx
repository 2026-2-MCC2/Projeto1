import { Minus, Plus, RotateCcw } from 'lucide-react';
import { FONT_MAX, FONT_MIN, useA11y } from '../../context/AccessibilityContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import Switch from '../common/Switch.jsx';

const daltonismos = [
  ['nenhum', 'Padrão'], ['protanopia', 'Paleta para protanopia'], ['deuteranopia', 'Paleta para deuteranopia'],
  ['tritanopia', 'Paleta para tritanopia'],
];

// Conteúdo reaproveitado no painel "+Acessibilidade" do site e em Configurações dos painéis
export default function AccessibilityOptions({ idPrefix = 'a11y' }) {
  const { opts, set, mudarFonte, restaurar } = useA11y();
  const { theme, toggle } = useTheme();
  return (
    <div className="a11y-opcoes">
      <Switch id={`${idPrefix}-tutorial`} label="Deseja ativar o tutorial?" checked={opts.tutorial} onChange={(v) => set({ tutorial: v })} />

      <h3 className="a11y-secao"><span>Visual</span></h3>
      <label className="a11y-campo" htmlFor={`${idPrefix}-dalt`}>Daltonismo</label>
      <select id={`${idPrefix}-dalt`} value={opts.daltonismo} onChange={(e) => set({ daltonismo: e.target.value })}>
        {daltonismos.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <p className="a11y-ajuda">Aplica uma simulação aproximada também às imagens. As cores nunca são o único indicador: textos, ícones e contornos continuam disponíveis. Não substitui avaliação individual de acessibilidade.</p>
      <div className="a11y-linha">
        <span id={`${idPrefix}-fonte`}>Tamanho do texto</span>
        <div className="a11y-fonte" role="group" aria-labelledby={`${idPrefix}-fonte`}>
          <button type="button" onClick={() => mudarFonte(-1)} disabled={opts.fontStep <= FONT_MIN} aria-label="Diminuir texto"><Minus size={16} /></button>
          <output>{100 + opts.fontStep * 10}%</output>
          <button type="button" onClick={() => mudarFonte(1)} disabled={opts.fontStep >= FONT_MAX} aria-label="Aumentar texto"><Plus size={16} /></button>
        </div>
      </div>
      <Switch id={`${idPrefix}-tema`} label="Contraste (tema escuro)" checked={theme === 'dark'} onChange={toggle} />
      <Switch id={`${idPrefix}-fonteleg`} label="Fonte de leitura fácil" checked={opts.fonteLegivel} onChange={(v) => set({ fonteLegivel: v })} />
      <Switch id={`${idPrefix}-esp`} label="Mais espaçamento entre textos" checked={opts.espacamento} onChange={(v) => set({ espacamento: v })} />
      <Switch id={`${idPrefix}-links`} label="Destacar links" checked={opts.destacarLinks} onChange={(v) => set({ destacarLinks: v })} />
      <Switch id={`${idPrefix}-mov`} label="Reduzir animações" checked={opts.reduzirMovimento} onChange={(v) => set({ reduzirMovimento: v })} />

      <h3 className="a11y-secao"><span>Deficiências</span></h3>
      <div className="a11y-duas">
        <Switch id={`${idPrefix}-voz`} label="Voz narrada" checked={opts.voz} onChange={(v) => set({ voz: v })} />
        <Switch id={`${idPrefix}-libras`} label="Libras" checked={opts.libras} onChange={(v) => set({ libras: v })} />
      </div>
      <button type="button" className="a11y-restaurar" onClick={restaurar}><RotateCcw size={15} aria-hidden="true" /> Restaurar padrões</button>
    </div>
  );
}
