import { useState } from 'react';
import { ApiPut } from '../../components/ApiRequest';
import { type SettingsResponse } from './useFetchSettings';

export const useSaveSettings = (token: string | null) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);


    const saveSettings = async (settings: SettingsResponse) => {
        if (!token) return;
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await ApiPut('/settings/current', settings, {
                Authorization: `Bearer ${token}`,
            });
            setSuccess('Settings saved successfully!');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return { saveSettings, loading, error, success };
};
