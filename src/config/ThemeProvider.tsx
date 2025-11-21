import {type FC, type ReactNode, useState, useEffect } from 'react';
import { ThemeContext, type Theme } from './ThemeContext';

export const ThemeProvider: FC<{ children: ReactNode; initialTheme?: Theme }> = ({ children, initialTheme = 'Light' }) => {
    const [theme, setTheme] = useState<Theme>(initialTheme);

    useEffect(() => {
        document.body.classList.remove('Light', 'Dark');
        document.body.classList.add(theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
