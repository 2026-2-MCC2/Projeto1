import { Contrast, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';

// rotulo: texto fixo (ex.: "Contraste"). Sem rotulo mostra "Modo claro/escuro".
export default function ThemeButton({ compact = false, rotulo, tour }) {
  const { theme, toggle } = useTheme();
  const texto = rotulo || (theme === 'dark' ? 'Modo claro' : 'Modo escuro');
  const Icone = rotulo ? Contrast : theme === 'dark' ? Sun : Moon;
  return (
    <button className="theme-toggle" data-tour={tour} onClick={toggle} aria-pressed={theme === 'dark'}
      aria-label={compact ? `${texto}. Alternar entre tema claro e escuro` : undefined}
      title="Alternar entre tema claro e escuro">
      <Icone size={16} aria-hidden="true" />
      {!compact && <span>{texto}</span>}
    </button>
  );
}
