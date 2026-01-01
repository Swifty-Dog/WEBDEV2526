import { useCallback, useEffect, useState } from 'react';
import { ApiGet } from '../config/ApiRequest';
import type { EventApiDto } from '../utils/types';
import { useTranslation } from 'react-i18next';

export function useEvents() {
    const [eventsByDate, setEventsByDate] = useState<Record<string, EventApiDto[]>>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation('events');

    // Helper om een date key te maken voor grouping (YYYY-MM-DD)
    const toDayKeyISO = useCallback((d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }, []);

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('authToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

        try {
            const data = await ApiGet<EventApiDto[]>('/Event', headers);

            const grouped: Record<string, EventApiDto[]> = {};
            data.forEach(event => {
                const dateKey = toDayKeyISO(new Date(event.eventDate));
                if (!grouped[dateKey]) grouped[dateKey] = [];
                grouped[dateKey].push(event);
            });

            setEventsByDate(grouped);
        } catch (e) {
            const msg = e instanceof Error ? e.message : t('general.API_ErrorUnexpected');
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, [t, toDayKeyISO]);

    // initial fetch
    useEffect(() => {
        void fetchEvents();
    }, [fetchEvents]);

    return { eventsByDate, loading, error, refetch: fetchEvents };
}
