import { useEffect, useState } from 'react';

export function useReducedMotion(explicit?: boolean): boolean {
  const [preferred, setPreferred] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (explicit !== undefined || typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (event: MediaQueryListEvent): void => setPreferred(event.matches);
    setPreferred(query.matches);
    query.addEventListener?.('change', onChange);
    return () => query.removeEventListener?.('change', onChange);
  }, [explicit]);

  return explicit ?? preferred;
}
