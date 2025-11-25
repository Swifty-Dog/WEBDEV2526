import { useEffect, useState } from 'react';
import { ApiGet } from '../../components/ApiRequest';
import { SiteThemeOption, AccentColorOption, FontSizeOption, DefaultCalendarViewOption, LanguageOption } from '../../data/SettingsOptions';

export interface SettingsResponse {
    siteTheme: SiteThemeOption;
    accentColor: AccentColorOption;
    fontSize: FontSizeOption;
    defaultCalendarView: DefaultCalendarViewOption;
    language: LanguageOption;
}

export const useFetchSettings = (token: string | null) => {
    const [settings, setSettings] = useState<SettingsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) return;

        (async () => {
            setLoading(true);
            try {
                const data = await ApiGet<SettingsResponse>('/settings/current', {
                    Authorization: `Bearer ${token}`,
                });
                setSettings(data);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : String(err);
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        })();
    }, [token]);

    return { settings, setSettings, loading, error };
};
