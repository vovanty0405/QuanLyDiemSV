import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('app_theme') || 'dark');
  const [font, setFont] = useState(() => localStorage.getItem('app_font') || 'Inter');

  useEffect(() => {
    // Lưu vào localStorage
    localStorage.setItem('app_theme', theme);
    
    // Toggle class 'light' hoặc 'dark' trên <html>
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else { // system
      if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        root.classList.add('light');
        root.classList.remove('dark');
      } else {
        root.classList.add('dark');
        root.classList.remove('light');
      }
    }
  }, [theme]);

  useEffect(() => {
    // Lưu vào localStorage
    localStorage.setItem('app_font', font);
    
    // Cập nhật font-family
    document.body.style.fontFamily = font;
  }, [font]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, font, setFont }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
