import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    return useContext(ThemeContext);
};

export const ThemeProvider = ({ children }) => {
    // Default to 'midnight' if no theme is saved
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('app-theme');
        // If saved theme is not one of the allowed ones, default to midnight
        if (saved !== 'midnight' && saved !== 'light') return 'midnight';
        return saved;
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
            { id: 'midnight', name: 'Midnight', icon: '🌃' },
            { id: 'light', name: 'Light', icon: '☀️' }
        ]
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
