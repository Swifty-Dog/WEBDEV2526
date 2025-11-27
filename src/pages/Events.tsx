import React, { useEffect, useState } from 'react';
import '../styles/global.css';
import '../styles/_components.css';
import "../styles/EventCard.css";
import { EventCard } from "../components/EventCard";
import { ApiGet } from "../components/ApiRequest";

interface EventApiItem {
    id: number;
    title: string;
    description?: string;
    date: string; // ISO from backend via JsonPropertyName("date")
    roomName?: string;
    location?: string;
    attendees: string[];
    attending: boolean;
}

export const Events: React.FC = () => {
    const [events, setEvents] = useState<EventApiItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('authToken');
                // Ensure we always hit /api base
                const data = await ApiGet<EventApiItem[]>("/Event", token ? { Authorization: `Bearer ${token}` } : undefined);
                setEvents(data.map(e => ({ ...e, date: e.date })));
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Onbekende fout bij het laden van events.');
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    return (
        <div className="events-page">
            <h1>Events</h1>

            {/* <div className="stats-section section-card">
                <h2>Statistieken</h2>
                <div className="stats-grid">
                    <p>Total Users: 120</p>
                    <p>Events This Month: {events.length}</p>
                </div>
            </div> */}

            {/* <div className="calender-week-selector">
                Hier komt een component zodat de gebruiker de gewenste week kan selecteren die getoont moet worden.

            </div> */}


            {error && <p className="error-message">{error}</p>}
            {loading && <p>Events laden...</p>}
            <div className="events-grid">
                {!loading && events.map(event => (
                    <EventCard
                        key={event.id}
                        id={event.id}
                        title={event.title}
                        date={event.date}
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