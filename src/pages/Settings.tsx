import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import { type SettingsResponse, useFetchSettings } from '../hooks/Settings/useFetchSettings';
import { useSaveSettings } from '../hooks/Settings/useSaveSettings';
import { useTheme } from '../config/ThemeContext';
import { useNavigationBlocker } from '../hooks/Settings/useNavigationBlocker';
import { UnsavedChangesDialog } from '../components/Settings/UnsavedChangesDialog';
import { SiteThemeOption, UserThemeOption, FontSizeOption, DefaultCalendarViewOption, LanguageOption } from '../data/SettingsOptions';
import '../styles/_components.css';

export const Settings: React.FC = () => {
    const token = localStorage.getItem('authToken');
    const navigate = useNavigate();

    const {settings, loading, error} = useFetchSettings(token);
    const [originalSettings, setOriginalSettings] = useState<SettingsResponse | null>(null);
    const {saveSettings, loading: saving, error: saveError, success} = useSaveSettings(token);
    const {setTheme} = useTheme();

    const [dirtySettings, setDirtySettings] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [nextLocation, setNextLocation] = useState<string | null>(null);

    const [siteTheme, setSiteTheme] = useState<SiteThemeOption>('Light');
    const [userTheme, setUserTheme] = useState<UserThemeOption>('Blue');
    const [fontSize, setFontSize] = useState<FontSizeOption>(16);
    const [defaultCalendarView, setCalendarView] = useState<DefaultCalendarViewOption>('Week');
    const [language, setLanguage] = useState<LanguageOption>('English');

    useEffect(() => {
        if (settings && !originalSettings) {
            setOriginalSettings(settings);
            setSiteTheme(settings.siteTheme);
            setUserTheme(settings.userTheme);
            setFontSize(settings.fontSize);
            setCalendarView(settings.defaultCalendarView);
            setLanguage(settings.language);
        }
    }, [settings, originalSettings]);

    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            if (!dirtySettings) return;
            e.preventDefault();
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [dirtySettings]);

    const onAttemptNavigate = useCallback((to?: string) => {
        if (dirtySettings) {
            if (to) setNextLocation(to);
            setShowDialog(true);
        }
    }, [dirtySettings]);

    useNavigationBlocker(dirtySettings, onAttemptNavigate);

    useEffect(() => {
        if (!dirtySettings && nextLocation) {
            navigate(nextLocation);
            setNextLocation(null);
        }
    }, [dirtySettings, nextLocation, navigate]);

    const confirmLeave = () => {
        if (originalSettings) {
            setSiteTheme(originalSettings.siteTheme);
            setUserTheme(originalSettings.userTheme);
            setFontSize(originalSettings.fontSize);
            setCalendarView(originalSettings.defaultCalendarView);
            setLanguage(originalSettings.language);
            setTheme(originalSettings.siteTheme);
        }

        setDirtySettings(false);
        setShowDialog(false);
    }

    const cancelLeave = () => {
        setShowDialog(false);
        setNextLocation(null);
    };

    if (loading) return <div className="panel-fancy-borders">Loading settings...</div>;
    if (error) return <div className="panel-fancy-borders error-message">Error loading settings: {error}</div>;

    return (
        <div className="panel-fancy-borders">
            <div className="section-card">
                <h1 className="titling" style={{marginTop: 0}}>Instellingen</h1>

                {saveError && <p className="error-message">{saveError}</p>}
                {success && <p className="success-message">{success}</p>}

                <div className="settings-row">
                    <label>Site Theme:</label>
                    <select
                        value={siteTheme}
                        onChange={e => {
                            const newTheme = e.target.value as SiteThemeOption;
                            setSiteTheme(newTheme);
                            setTheme(newTheme);
                            setDirtySettings(true);
                        }}
                    >
                        {SiteThemeOption.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>

                <div className="settings-row">
                    <label>User Theme:</label>
                    <select
                        value={userTheme}
                        onChange={e => {
                            setUserTheme(e.target.value as UserThemeOption);
                            setDirtySettings(true);
                        }}
                    >
                        {UserThemeOption.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>

                <div className="settings-row">
                    <label>Font Size:</label>
                    <select
                        value={fontSize}
                        onChange={e => {
                            setFontSize(Number(e.target.value) as FontSizeOption);
                            setDirtySettings(true);
                        }}
                    >
                        {FontSizeOption.map(size => (
                            <option key={size} value={size}>
                                {size === 14 ? "Small" : size === 16 ? "Medium" : size === 18 ? "Large" : "Extra Large"}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="settings-row">
                    <label>Default Calendar View:</label>
                    <select
                        value={defaultCalendarView}
                        onChange={e => {
                            setCalendarView(e.target.value as DefaultCalendarViewOption);
                            setDirtySettings(true);
                        }}
                    >
                        {DefaultCalendarViewOption.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>

                <div className="settings-row">
                    <label>Language:</label>
                    <select
                        value={language}
                        onChange={e => {
                            setLanguage(e.target.value as LanguageOption);
                            setDirtySettings(true);
                        }}
                    >
                        {LanguageOption.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>

                <button
                    className="button-primary"
                    onClick={() => {
                        saveSettings({siteTheme, userTheme, fontSize, defaultCalendarView, language});
                        setDirtySettings(false);
                    }}
                    disabled={saving}
                >
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>

            {showDialog && (
                <UnsavedChangesDialog
                    onConfirmLeave={confirmLeave}
                    onCancel={cancelLeave}
                />
            )}
        </div>
    )
};
