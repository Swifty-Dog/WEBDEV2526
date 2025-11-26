import {useCallback, useState} from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../utils/i18n';
import { ApiPut } from '../../components/ApiRequest';
import { type SettingsResponse } from './useFetchSettings';

interface ApiErrorData {
    message?: string;
    arguments?: Record<string, string>;
}

export const useSaveSettings = (token: string | null) => {
    const { t } = useTranslation('settings');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const translateApiError = useCallback((data: ApiErrorData, fallbackT: typeof t): string => {
        if (data?.message) {
            const [namespace, key] = data.message.split('.');
            const fullKey = `${namespace}:${key}`;
            const interpolationData = data.arguments as Record<string, string>;
            return i18n.t(fullKey, interpolationData);
        }

        return fallbackT('saveSettings.messageFailDefault');
    }, []);

    const saveSettings = useCallback(async (settings: SettingsResponse) => {
        if (!token) return;
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await ApiPut('/settings/current', settings, {
                Authorization: `Bearer ${token}`,
            });
            setSuccess(t('saveSettings.messageSuccess'));
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            const errorObject = err as { response?: { data: ApiErrorData } };
            let errorMessage: string;

            if (errorObject?.response?.data?.message) {
                errorMessage = translateApiError(errorObject.response.data, t);
            } else {
                errorMessage = t('saveSettings.messageFailDefault');
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [token, t, translateApiError]);

    return { saveSettings, loading, error, success };
};
