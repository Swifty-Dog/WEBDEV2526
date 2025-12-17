import { useCallback, useEffect, useState } from 'react';
import { ApiGet } from '../config/ApiRequest';
import type { EventApiItem, UseEventsResult} from '../utils/event';


export function useEvents(): UseEventsResult {
    const [eventsByDate, setEventsByDate] = useState<Record<string, string[]>>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

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
                const data = await ApiGet<EventApiItem[]>(
                    '/Event',
                    token ? { Authorization: `Bearer ${token}` } : undefined
                );
                const grouped: Record<string, string[]> = {};
                data.forEach(e => {
                    const iso = e.eventDate;
                    const dateKey = toDayKeyISO(new Date(iso));
                    if (!grouped[dateKey]) grouped[dateKey] = [];
                    grouped[dateKey].push(e.title);
                });
                setEventsByDate(grouped);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Kon events niet laden.');
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, [toDayKeyISO]);

    return { eventsByDate, loading, error };
}
