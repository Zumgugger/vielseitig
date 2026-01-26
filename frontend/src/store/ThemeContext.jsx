import { createContext, useContext, useState, useEffect } from 'react';

/**
 * Theme definitions with Tailwind color palette
 * Each theme includes: name, primary color, secondary, accent, success, error, warning
 */
const THEMES = {
  default: {
    name: 'Default',
    primary: 'blue',
    secondary: 'gray',
    accent: 'indigo',
    success: 'green',
    error: 'red',
    warning: 'amber',
    tailwind: {
      bg: 'bg-gray-50',
      text: 'text-gray-900',
      border: 'border-gray-300',
      card: 'bg-white',
    },
  },
  ocean: {
    name: 'Ocean',
    primary: 'cyan',
    secondary: 'slate',
    accent: 'sky',
    success: 'emerald',
    error: 'rose',
    warning: 'orange',
    tailwind: {
      bg: 'bg-cyan-50',
      text: 'text-cyan-900',
      border: 'border-cyan-200',
      card: 'bg-cyan-100',
    },
  },
  sunset: {
    name: 'Sunset',
    primary: 'orange',
    secondary: 'amber',
    accent: 'red',
    success: 'emerald',
    error: 'rose',
    warning: 'yellow',
    tailwind: {
      bg: 'bg-orange-50',
      text: 'text-orange-900',
      border: 'border-orange-200',
      card: 'bg-white',
    },
  },
  forest: {
    name: 'Forest',
    primary: 'green',
    secondary: 'emerald',
    accent: 'teal',
    success: 'lime',
    error: 'red',
    warning: 'yellow',
    tailwind: {
      bg: 'bg-green-50',
      text: 'text-green-900',
      border: 'border-green-200',
      card: 'bg-white',
    },
  },
  purple: {
    name: 'Purple Dream',
    primary: 'purple',
    secondary: 'violet',
    accent: 'fuchsia',
    success: 'green',
    error: 'red',
    warning: 'amber',
    tailwind: {
      bg: 'bg-purple-50',
      text: 'text-purple-900',
      border: 'border-purple-200',
      card: 'bg-white',
    },
  },
  dark: {
    name: 'Dark Mode',
    primary: 'blue',
    secondary: 'slate',
    accent: 'gray',
    success: 'green',
    error: 'red',
    warning: 'amber',
    tailwind: {
      bg: 'bg-slate-900',
      text: 'text-white',
      border: 'border-slate-700',
      card: 'bg-slate-800',
    },
  },
};

/**
 * ThemeContext provides theme selection and persistence
 */
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('default');

  /**
   * Load theme from localStorage on mount
   */
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme && THEMES[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  /**
   * Update theme and persist to localStorage
   */
  const switchTheme = (themeName) => {
    if (THEMES[themeName]) {
      setCurrentTheme(themeName);
      localStorage.setItem('app-theme', themeName);
    }
  };

  const value = {
    currentTheme,
    theme: THEMES[currentTheme],
    switchTheme,
    themes: THEMES,
    allThemeNames: Object.keys(THEMES),
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * useTheme hook - access theme context anywhere
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
