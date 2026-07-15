import { useEffect, useState } from 'react';

export function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('notas:theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      localStorage.setItem('notas:theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('notas:theme', 'light');
    }
  }, [dark]);

  return { dark, toggle: () => setDark((d) => !d) };
}
