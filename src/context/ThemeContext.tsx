import React, { createContext, useContext, useEffect } from 'react';

type Theme = 'dark';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  isDark: true,
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    try {
      localStorage.setItem('siperbawa_theme', 'dark');
    } catch {
      // ignore
    }

    document.documentElement.classList.add('dark');
    document.body.style.backgroundColor = '#020617'; // slate-950
    document.body.style.color = '#f8fafc';
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: 'dark', isDark: true, toggleTheme: () => {}, setTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

