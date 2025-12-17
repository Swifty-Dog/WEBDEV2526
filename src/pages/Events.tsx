import React, { useEffect, useState } from 'react';
import { ApiGet } from '../config/ApiRequest';
import { useTranslation } from 'react-i18next';
import '../styles/global.css';
import '../styles/_components.css';
import "../styles/EventCard.css";
import { EventCard } from "../components/EventCard";
import type { EventModel } from "../Models/EventModel";


export const Events: React.FC = () => {
    const { t } = useTranslation('common');
    const [events, setEvents] = useState<EventModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadEvents() {
            try {
                const events = await ApiGet<EventModel[]>("/Event");
                setEvents(events);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadEvents();
    }, []);

    if (loading) return <p>Bezig met laden...</p>;
    if (error) return <p>Fout: {error}</p>;


    return (
        <div className="events-page">
            <h1>{t('menu.events')}</h1>

            <div className="stats-section section-card">
                <h2>{t('dashboard.statsTitle')}</h2>
                <div className="stats-grid">
                    <p>{t('dashboard.statsTotalUsers')}: 120</p>
                    <p>{t('dashboard.statsEventsMonth')}: {events.length}</p>
                </div>
            </div>


            <div className="events-grid">
                {events.map(event => (
                    <EventCard
                        key={event.id}
                        id={event.id}
                        title={event.title}
                        eventDate={event.eventDate}
                        description={event.description}
                        roomName={event.room?.roomName}
                        attendees={event.attendees}
                    />
                ))}
            </div>
        </div>
    );
};

