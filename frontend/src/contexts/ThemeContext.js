import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const themes = {
  dark: {
    name: 'dark',
    colors: {
      // Background colors
      background: 'bg-gray-900',
      backgroundSecondary: 'bg-gray-800',
      backgroundTertiary: 'bg-gray-700',
      surface: 'bg-gray-800',
      surfaceSecondary: 'bg-gray-700',
      
      // Text colors
      text: 'text-white',
      textSecondary: 'text-gray-300',
      textTertiary: 'text-gray-400',
      textMuted: 'text-gray-500',
      
      // Border colors
      border: 'border-gray-700',
      borderSecondary: 'border-gray-600',
      
      // Button colors
      primary: 'bg-purple-600 hover:bg-purple-700',
      primaryText: 'text-white',
      secondary: 'bg-gray-700 hover:bg-gray-600',
      secondaryText: 'text-gray-200',
      success: 'bg-green-600 hover:bg-green-700',
      danger: 'bg-red-600 hover:bg-red-700',
      
      // Gradient
      gradient: 'bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900',
      
      // Status colors
      anonymous: 'bg-blue-600',
      pro: 'bg-green-600',
      
      // Input colors
      input: 'bg-gray-700 border-gray-600 text-white placeholder-gray-400',
      
      // Card colors
      card: 'bg-gray-800 border-gray-700',
      cardHover: 'hover:bg-gray-700',
    }
  },
  light: {
    name: 'light',
    colors: {
      // Background colors
      background: 'bg-white',
      backgroundSecondary: 'bg-gray-50',
      backgroundTertiary: 'bg-gray-100',
      surface: 'bg-white',
      surfaceSecondary: 'bg-gray-50',
      
      // Text colors
      text: 'text-gray-900',
      textSecondary: 'text-gray-700',
      textTertiary: 'text-gray-600',
      textMuted: 'text-gray-500',
      
      // Border colors
      border: 'border-gray-200',
      borderSecondary: 'border-gray-300',
      
      // Button colors
      primary: 'bg-purple-600 hover:bg-purple-700',
      primaryText: 'text-white',
      secondary: 'bg-gray-200 hover:bg-gray-300',
      secondaryText: 'text-gray-800',
      success: 'bg-green-600 hover:bg-green-700',
      danger: 'bg-red-600 hover:bg-red-700',
      
      // Gradient
      gradient: 'bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700',
      
      // Status colors
      anonymous: 'bg-blue-600',
      pro: 'bg-green-600',
      
      // Input colors
      input: 'bg-white border-gray-300 text-gray-900 placeholder-gray-500',
      
      // Card colors
      card: 'bg-white border-gray-200',
      cardHover: 'hover:bg-gray-50',
    }
  }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('dark'); // Default to dark mode

  // Load theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('thrifters-eye-theme');
    if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('thrifters-eye-theme', currentTheme);
  }, [currentTheme]);

  const toggleTheme = () => {
    setCurrentTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const theme = themes[currentTheme];

  const value = {
    currentTheme,
    theme,
    toggleTheme,
    isDark: currentTheme === 'dark',
    isLight: currentTheme === 'light',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};