'use client';

import { createContext, useContext, useEffect } from 'react';

interface ThemeContextType {
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextType>({ toggle: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Aplica tema salvo (ou preferência do sistema) sem causar mismatch de hidratação
    try {
      const stored = localStorage.getItem('theme');
      const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
      const dark = stored ? stored === 'dark' : prefersDark;
      document.documentElement.classList.toggle('dark', dark);
    } catch {}
  }, []);

  function toggle() {
    try {
      const isDark = document.documentElement.classList.contains('dark');
      const next = !isDark;
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch {}
  }

  return <ThemeContext.Provider value={{ toggle }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
