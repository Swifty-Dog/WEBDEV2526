import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import { type SettingsResponse, useFetchSettings } from '../hooks/Settings/useFetchSettings';
import { useSaveSettings } from '../hooks/Settings/useSaveSettings';
import { type AccentColor, type FontSize, mapFontSizeToLabel, useSettings } from '../config/SettingsContext.ts';
import { useNavigationBlocker } from '../hooks/Settings/useNavigationBlocker';
import { UnsavedChangesDialog } from '../components/Settings/UnsavedChangesDialog';
import { SiteThemeOption, AccentColorOption, FontSizeOption, DefaultCalendarViewOption, LanguageOption } from '../data/SettingsOptions';
import '../styles/_components.css';

export const Settings: React.FC = () => {
    const token = localStorage.getItem('authToken');
    const navigate = useNavigate();

    const {settings, loading, error} = useFetchSettings(token);
    const [originalSettings, setOriginalSettings] = useState<SettingsResponse | null>(null);
    const {saveSettings, loading: saving, error: saveError, success} = useSaveSettings(token);
    const { updateSettings } = useSettings();

    const [dirtySettings, setDirtySettings] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [nextLocation, setNextLocation] = useState<string | null>(null);

    const [siteTheme, setSiteTheme] = useState<SiteThemeOption>('Light');
    const [accentColor, setAccentColor] = useState<AccentColorOption>('Blue');
    const [fontSize, setFontSize] = useState<FontSizeOption>(16);
    const [defaultCalendarView, setCalendarView] = useState<DefaultCalendarViewOption>('Week');
    const [language, setLanguage] = useState<LanguageOption>('English');

    useEffect(() => {
        if (settings && !originalSettings) {
            setOriginalSettings(settings);
            setSiteTheme(settings.siteTheme);
            setAccentColor(settings.accentColor);
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

    const handleSave = async () => {
        try {
            const payload: SettingsResponse = {
                siteTheme,
                accentColor,
                fontSize: Number(fontSize) as FontSizeOption,
                defaultCalendarView,
                language
            };

            await saveSettings(payload);
            setDirtySettings(false);
            setOriginalSettings(payload);

        } catch (err) {
            console.error("Failed to save settings:", err);
        }
    };

    const confirmLeave = () => {
        if (originalSettings) {
            setSiteTheme(originalSettings.siteTheme);
            setAccentColor(originalSettings.accentColor);
            setFontSize(originalSettings.fontSize);
            setCalendarView(originalSettings.defaultCalendarView);
            setLanguage(originalSettings.language);

            updateSettings({
                theme: originalSettings.siteTheme,
                accentColor: originalSettings.accentColor as AccentColor,
                fontSize: mapFontSizeToLabel(originalSettings.fontSize),
                defaultCalendarView: originalSettings.defaultCalendarView,
                language: originalSettings.language
            });
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
                            updateSettings({ theme: newTheme });
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
                        value={accentColor}
                        onChange={e => {
                            const newAccentColor = e.target.value as AccentColorOption;
                            setAccentColor(newAccentColor);
                            updateSettings({ accentColor: newAccentColor as AccentColor });
                            setDirtySettings(true);
                        }}
                    >
                        {AccentColorOption.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>

                <div className="settings-row">
                    <label>Font Size:</label>
                    <select
                        value={fontSize}
                        onChange={e => {
                            const newFontSize = Number(e.target.value) as FontSizeOption;
                            setFontSize(newFontSize);
                            updateSettings({ fontSize: mapFontSizeToLabel(newFontSize) as FontSize });
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
                    onClick={handleSave}
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
