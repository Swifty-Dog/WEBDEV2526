import { useCallback, useEffect, useState } from 'react';
import { ApiGet } from '../config/ApiRequest';
import type { EventApiDto } from '../utils/types';
import { formatEventDateTime } from '../utils/time';
import type { UseEventsResult } from '../utils/event';
import { useTranslation } from 'react-i18next';


export function useEvents(): UseEventsResult {
    const [eventsByDate, setEventsByDate] = useState<Record<string, string[]>>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation('events');

    const toDayKeyISO = useCallback((d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }, []);

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('authToken');
                const data = await ApiGet<EventApiDto[]>(
                    '/Event',
                    token ? { Authorization: `Bearer ${token}` } : undefined
                );
                const grouped: Record<string, string[]> = {};
                data.forEach(e => {
                    const eDate = e.eventDate;
                    const eStartTime = e.startTime;
                    const eEndTime = e.endTime;
                    formatEventDateTime(eDate, eStartTime, eEndTime); // just to ensure correct format
                    const dateKey = toDayKeyISO(new Date(eDate));
                    if (!grouped[dateKey]) grouped[dateKey] = [];
                    grouped[dateKey].push(e.title);
                });
                setEventsByDate(grouped);
            } catch (e) {
                setError(e instanceof Error ? e.message : t('loading.loadEventsFailed'));
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, [toDayKeyISO]);

    return { eventsByDate, loading, error };
}
