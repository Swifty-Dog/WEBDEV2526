import { createContext, useContext } from 'react';

export type Theme = 'Light' | 'Dark';
export type FontSize = 'Small' | 'Medium' | 'Large' | 'ExtraLarge';
export type AccentColor = 'Blue' | 'Purple' | 'Orange' | 'Yellow';
export type DefaultCalendarView = 'Week' | 'Month';
export type Language = 'English' | 'Dutch';

export interface UserSettings {
    theme: Theme;
    fontSize: FontSize;
    accentColor: AccentColor;
    defaultCalendarView: DefaultCalendarView;
    language: Language;
}

export interface UserSettingsContextProps extends UserSettings {
    updateSettings: (settings: Partial<UserSettings>) => void;
}

export const SettingsContext = createContext<UserSettingsContextProps>({
    theme: 'Light',
    fontSize: 'Medium',
    accentColor: 'Blue',
    defaultCalendarView: 'Week',
    language: 'English',
    updateSettings: () => {},
});

export const useSettings = () => useContext(SettingsContext);

export const mapFontSizeToLabel = (size: number): FontSize => {
    switch (size) {
        case 14: return 'Small';
        case 18: return 'Large';
        case 20: return 'ExtraLarge';
        default: return 'Medium';
    }
};
