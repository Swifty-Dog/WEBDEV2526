import { useCallback, useEffect, useState } from 'react';
import { ApiGet } from '../config/ApiRequest';
import type { EventApiDto } from '../utils/types';
import { useTranslation } from 'react-i18next';

export function useUpcomingEvents() {
    const [events, setEvents] = useState<Record<string, EventApiDto[]>>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation('events');

    const fetchUpcoming = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('authToken');
            const data = await ApiGet<EventApiDto[]>("/Event/upcoming", token ? { Authorization: `Bearer ${token}` } : undefined);

            const groupedEvents: Record<string, EventApiDto[]> = {};
            data.forEach((event) => {
                const dateKey = event.eventDate.split('T')[0];

                if (!groupedEvents[dateKey]) {
                    groupedEvents[dateKey] = [];
                }
                groupedEvents[dateKey].push(event);
            });

            setEvents(groupedEvents);

        } catch {
            setError(t('common.networkError'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        void fetchUpcoming();
    }, [fetchUpcoming]);

    return { events, loading, error, refetch: fetchUpcoming };
}
