import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';

export default function ThemeButton({ compact = false }) {
  const { theme, toggle } = useTheme();
  const label = theme === 'dark' ? 'Modo claro' : 'Modo escuro';
  return (
    <button className="theme-toggle" onClick={toggle} aria-label={compact ? label : undefined}>
      {theme === 'dark' ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
      {!compact && <span>{label}</span>}
    </button>
  );
}
