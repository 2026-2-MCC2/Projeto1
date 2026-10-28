import { useCallback, useState } from 'react';

// useState que também grava no localStorage (protótipo sem API).
export default function useLocalState(key, seed) {
  const [value, setValue] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) ?? seed; } catch { return seed; }
  });
  const update = useCallback((next) => {
    setValue((prev) => {
      const result = typeof next === 'function' ? next(prev) : next;
      try { localStorage.setItem(key, JSON.stringify(result)); } catch { /* sem espaço ou bloqueado */ }
      return result;
    });
  }, [key]);
  return [value, update];
}
