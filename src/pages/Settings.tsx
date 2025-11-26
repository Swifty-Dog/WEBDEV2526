import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import { type SettingsResponse, useFetchSettings } from '../hooks/Settings/useFetchSettings';
import { useSaveSettings } from '../hooks/Settings/useSaveSettings';
import { type AccentColor, type FontSizeLabel, mapFontSizeToLabel, useSettings } from '../config/SettingsContext.ts';
import { useNavigationBlocker } from '../hooks/Settings/useNavigationBlocker';
import { UnsavedChangesDialog } from '../components/Settings/UnsavedChangesDialog';
import { SiteThemeOption, AccentColorOption, FontSizeOption, DefaultCalendarViewOption, LanguageOption } from '../data/SettingsOptions';
import '../styles/_components.css';

export const Settings: React.FC = () => {
    const { t: tSettings } = useTranslation('settings');
    const { t: tCommon } = useTranslation('common');
    const token = localStorage.getItem('authToken');
    const navigate = useNavigate();

    const { settings, loading, error } = useFetchSettings(token);
    const [originalSettings, setOriginalSettings] = useState<SettingsResponse | null>(null);
    const { saveSettings, loading: saving, error: saveError, success } = useSaveSettings(token);
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

    if (loading) return <div className="panel-fancy-borders">{tSettings('settingsPage.loading')}</div>;
    if (error) return <div className="panel-fancy-borders error-message">{tSettings('settingsPage.errorLoading', { error })}</div>;

    return (
        <div className="panel-fancy-borders">
            <div className="section-card">
                <h1 className="titling">{tCommon('menu.settings')}</h1>

                <div className="form-container">
                    <div className="form-fields">

                        <div className="form-row">
                            <label htmlFor="siteTheme">{tSettings('settingsPage.labelSiteTheme')}</label>
                            <select
                                id="siteTheme"
                                className="booking-input"
                                value={siteTheme}
                                onChange={e => {
                                    const newTheme = e.target.value as SiteThemeOption;
                                    setSiteTheme(newTheme);
                                    updateSettings({ theme: newTheme });
                                    setDirtySettings(true);
                                }}
                            >
                                {SiteThemeOption.map(opt => (
                                    <option key={opt} value={opt}>{tSettings('settingsOptions.' + opt)}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-row">
                            <label htmlFor="accentColor">{tSettings('settingsPage.labelAccentColor')}</label>
                            <select
                                id="accentColor"
                                className="booking-input"
                                value={accentColor}
                                onChange={e => {
                                    const newAccentColor = e.target.value as AccentColorOption;
                                    setAccentColor(newAccentColor);
                                    updateSettings({ accentColor: newAccentColor as AccentColor });
                                    setDirtySettings(true);
                                }}
                            >
                                {AccentColorOption.map(opt => (
                                    <option key={opt} value={opt}>{tSettings('settingsOptions.' + opt)}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-row">
                            <label htmlFor="fontSize">{tSettings('settingsPage.labelFontSize')}</label>
                            <select
                                id="fontSize"
                                className="booking-input"
                                value={fontSize}
                                onChange={e => {
                                    const newFontSize = Number(e.target.value) as FontSizeOption;
                                    setFontSize(newFontSize);
                                    updateSettings({ fontSize: mapFontSizeToLabel(newFontSize) as FontSizeLabel });
                                    setDirtySettings(true);
                                }}
                            >
                                {FontSizeOption.map(size => {
                                    const key = mapFontSizeToLabel(size);
                                    return (
                                        <option key={size} value={size}>
                                            {tSettings('settingsOptions.' + key)}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        <div className="form-row">
                            <label htmlFor="calendarView">{tSettings('settingsPage.labelDefaultView')}</label>
                            <select
                                id="calendarView"
                                className="booking-input"
                                value={defaultCalendarView}
                                onChange={e => {
                                    setCalendarView(e.target.value as DefaultCalendarViewOption);
                                    setDirtySettings(true);
                                }}
                            >
                                {DefaultCalendarViewOption.map(opt => (
                                    <option key={opt} value={opt}>{tSettings('settingsOptions.' + opt)}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-row">
                            <label htmlFor="language">{tSettings('settingsPage.labelLanguage')}</label>
                            <select
                                id="language"
                                className="booking-input"
                                value={language}
                                onChange={e => {
                                    const newLang = e.target.value as LanguageOption;
                                    setLanguage(newLang);
                                    updateSettings({ language: newLang });
                                    setDirtySettings(true);
                                }}
                            >
                                {LanguageOption.map(opt => (
                                    <option key={opt} value={opt}>{tSettings('settingsOptions.' + opt)}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-footer">
                        {saveError && <p className="error-message">{saveError}</p>}
                        {success && <p className="success-message">{success}</p>}

                        <button
                            className="button-primary full-width-button"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? tCommon('general.buttonSaving') : tCommon('general.buttonSave')}
                        </button>
                    </div>
                </div>
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
