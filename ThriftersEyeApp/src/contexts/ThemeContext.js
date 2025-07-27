import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true); // Default to dark mode

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme !== null) {
        setIsDark(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  // Theme colors for React Native
  const theme = {
    colors: {
      // Backgrounds
      background: isDark ? '#1a1a2e' : '#ffffff',
      backgroundSecondary: isDark ? '#16213e' : '#f8f9fa',
      backgroundTertiary: isDark ? '#0f172a' : '#f1f3f4',
      surface: isDark ? '#1e293b' : '#ffffff',
      
      // Text
      text: isDark ? '#ffffff' : '#1f2937',
      textSecondary: isDark ? '#d1d5db' : '#6b7280',
      textMuted: isDark ? '#9ca3af' : '#9ca3af',
      
      // Primary colors
      primary: '#667eea',
      primaryText: '#ffffff',
      success: '#10b981',
      
      // Interactive elements
      cardHover: isDark ? '#374151' : '#f9fafb',
      
      // Borders
      border: isDark ? '#374151' : '#e5e7eb',
    },
    isDark
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};