import { createContext, useContext, useState, useLayoutEffect } from 'react';

const ThemeContext = createContext();

const STORAGE_KEY = 'pynnks-theme';

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'dark';
    } catch {
      return 'dark';
    }
  });

  // useLayoutEffect so data-theme is set BEFORE any child useEffect reads CSS vars
  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // storage unavailable
    }
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
