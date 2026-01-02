import React, { useEffect, useState } from 'react';
import { ApiGet } from '../config/ApiRequest';
import { useTranslation } from 'react-i18next';
import '../styles/global.css';
import '../styles/_components.css';
import "../styles/EventCard.css";
import { EventCard } from "../components/EventCard";
import type { EventApiDto } from '../utils/types';



export const Events: React.FC = () => {
    const { t } = useTranslation('common');
    const { t: tEvents } = useTranslation('events');
    const [events, setEvents] = useState<EventApiDto[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        document.title = t('menu.events') + " | " + import.meta.env.VITE_APP_NAME;
    }, [t]);

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('authToken');
                const data = await ApiGet<EventApiDto[]>("/Event", token ? { Authorization: `Bearer ${token}` } : undefined);
                setEvents(data.map(e => ({ ...e, date: e.eventDate })));
            } catch {
                setError(t('common.networkError'));
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    return (
        <div className="events-page">
            <h1>{t('menu.events')}</h1>

            {error && <p className="error-message">{error}</p>}
            {loading && <p>{tEvents('loading.loadingEvents')}</p>}
            <div className="events-grid">
                {!loading && events.map(event => (
                    <EventCard
                        key={event.id}
                        id={event.id}
                        title={event.title}
                        date={event.eventDate}
                        startTime={event.startTime}
                        endTime={event.endTime}
                        description={event.description || ''}
                        location={event.room?.roomName || ''}
                        attendees={event.attendees}
                        initialAttending={event.attending}
                    />
                ))}
            </div>
        </div>
    );
};

