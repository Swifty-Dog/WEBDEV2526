import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/global.css';
import '../styles/_components.css';
import "../styles/EventCard.css";
import { EventCard } from "../components/EventCard";
import { ApiGet } from "../config/ApiRequest";

interface EventApiItem {
    id: number;
    title: string;
    description?: string;
    eventDate: string;
    roomName?: string;
    location?: string;
    attendees: string[];
    attending: boolean;
}

export const Events: React.FC = () => {
    const { t } = useTranslation('common');
    const [events, setEvents] = useState<EventApiItem[]>([]);
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
                // Ensure we always hit /api base
                const data = await ApiGet<EventApiItem[]>("/Event", token ? { Authorization: `Bearer ${token}` } : undefined);
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

            {/* <div className="calender-week-selector">
                Hier komt een component zodat de gebruiker de gewenste week kan selecteren die getoont moet worden.

            </div> */}

            {error && <p className="error-message">{error}</p>}
            {loading && <p>{t('common.loadingEvents')}</p>}
            <div className="events-grid">
                {!loading && events.map(event => (
                    <EventCard
                        key={event.id}
                        id={event.id}
                        title={event.title}
                        date={event.eventDate}
                        description={event.description || ''}
                        location={event.location || event.roomName || ''}
                        attendees={event.attendees}
                        initialAttending={event.attending}
                    />
                ))}
            </div>
        </div>
    );
}
