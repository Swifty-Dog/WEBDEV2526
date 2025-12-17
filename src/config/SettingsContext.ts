import { createContext, useContext } from 'react';
import type { SiteThemeOption, AccentColorOption, DefaultCalendarViewOption, LanguageOption } from '../data/SettingsOptions';

export type Theme = SiteThemeOption;
export type FontSizeLabel = 'Small' | 'Medium' | 'Large' | 'Extra Large';
export type AccentColor = AccentColorOption;
export type DefaultCalendarView = DefaultCalendarViewOption;
export type Language = LanguageOption;

export interface UserSettings {
    theme: Theme;
    fontSize: FontSizeLabel;
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

export const mapFontSizeToLabel = (size: number): FontSizeLabel => {
    switch (size) {
        case 14: return 'Small';
        case 18: return 'Large';
        case 20: return 'Extra Large';
        default: return 'Medium';
    }
};
