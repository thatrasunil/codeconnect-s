import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    return useContext(ThemeContext);
};

export const ThemeProvider = ({ children }) => {
    // Default to 'cosmic' if no theme is saved
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('app-theme') || 'cosmic';
    });

    useEffect(() => {
        // Apply the theme to the document element (html tag)
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('app-theme', theme);
    }, [theme]);

    const value = {
        theme,
        setTheme,
        themes: [
            { id: 'cosmic', name: 'Cosmic', icon: '🌌' },
            { id: 'light', name: 'Light', icon: '☀️' },
            { id: 'dark', name: 'Dark', icon: '🌑' },
            { id: 'midnight', name: 'Midnight', icon: '🌃' }
        ]
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
