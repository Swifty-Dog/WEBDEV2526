import { createContext, useContext } from 'react';

export type Theme = 'Light' | 'Dark';

export interface ThemeContextProps {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextProps>({
    theme: 'Light',
    setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);
