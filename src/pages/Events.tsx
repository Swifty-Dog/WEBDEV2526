import React, { useEffect, useState } from 'react';
import { ApiGet } from '../components/ApiRequest';
import { EventCard } from "../components/EventCard";
import type { EventModel } from "../Models/EventModel";
import '../styles/_components.css';

export const Events: React.FC = () => {
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
            <h1>Events</h1>

            <div className="stats-section section-card">
                <h2>Statistieken</h2>
                <div className="stats-grid">
                    <p>Total Users: 120</p>
                    <p>Events This Month: {events.length}</p>
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
                        roomId={event.roomId}
                        attendees={event.attendees}
                    />
                ))}
            </div>
        </div>
    );
};
