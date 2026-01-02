import {type FC, type ReactNode, useState, useEffect, useCallback} from 'react';
import { SettingsContext, type UserSettings, type FontSizeLabel, type AccentColor } from './SettingsContext';
import { LANGUAGE_MAP } from '../data/SettingsOptions';
import i18n from '../utils/locales/i18n.ts';

interface Props {
    children: ReactNode;
    initialSettings?: Partial<UserSettings>;
}

const FONT_SCALES: Record<FontSizeLabel, string> = {
    Small: '14px',
    Medium: '16px',
    Large: '18px',
    "Extra Large": '20px'
};

const COLOR_PALETTES: Record<AccentColor, { primary: string; secondary: string; accent: string }> = {
    Blue: { primary: '#6bc2df', secondary: '#4faccc', accent: '#0078d4' },
    Purple: { primary: '#c084fc', secondary: '#a855f7', accent: '#7e22ce' },
    Orange: { primary: '#fb923c', secondary: '#f97316', accent: '#c2410c' },
    Yellow: { primary: '#facc15', secondary: '#eab308', accent: '#ca8a04' },
};

export const SettingsProvider: FC<Props> = ({ children, initialSettings }) => {
    const [settings, setSettingsState] = useState<UserSettings>({
        theme: 'Light',
        fontSize: 'Medium',
        accentColor: 'Blue',
        defaultCalendarView: 'Week',
        language: 'English',
        ...initialSettings
    });

    const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
        setSettingsState(prev => ({ ...prev, ...newSettings }));
    }, []);

    useEffect(() => {
        document.body.classList.remove('Light', 'Dark');
        document.body.classList.add(settings.theme);
    }, [settings.theme]);

    useEffect(() => {
        document.documentElement.style.setProperty('--base-font-size', FONT_SCALES[settings.fontSize]);
    }, [settings.fontSize]);

    useEffect(() => {
        const palette = COLOR_PALETTES[settings.accentColor];
        const root = document.documentElement.style;
        if (palette) {
            root.setProperty('--color-brand-primary', palette.primary);
            root.setProperty('--color-brand-secondary', palette.secondary);
            root.setProperty('--color-brand-accent', palette.accent);
        }
    }, [settings.accentColor]);

    useEffect(() => {
        const i18nCode = LANGUAGE_MAP[settings.language];
        if (i18nCode) {
            void i18n.changeLanguage(i18nCode);
        }
    }, [settings.language]);

    return (
        <SettingsContext.Provider value={{ ...settings, updateSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};
