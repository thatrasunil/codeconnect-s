import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    return useContext(ThemeContext);
};

export const ThemeProvider = ({ children }) => {
    // Force 'midnight' theme always
    const theme = 'midnight';

    // Dummy setter to prevent errors if used elsewhere
    const setTheme = () => { };

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', 'midnight');
        localStorage.setItem('app-theme', 'midnight');
    }, []);

    const value = {
        theme,
        setTheme,
        themes: [
            { id: 'midnight', name: 'Midnight', icon: '🌃' }
        ]
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
