import React, { useState } from "react";
import { ApiDelete, ApiPost } from "./ApiRequest";
import "../styles/EventCard.css";
import "../styles/_components.css";

interface EventCardProps {
    id: string | number;
    title: string;
    date: string;
    location: string;
    description: string;
    attendees: string[];
    initialAttending?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({
    id,
    title,
    date,
    location,
    description,
    attendees,
    initialAttending = false
}) => {
    const [attending, setAttending] = useState<boolean>(initialAttending);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const authHeader = () => {
        const token = localStorage.getItem('authToken');
        return token ? { Authorization: `Bearer ${token}` } : undefined;
    };

    const onToggleAttend = async () => {
        setError(null);
        setLoading(true);
        try {
            if (attending) {
                const res = await ApiDelete<{ attending: boolean}>(`/Event/${id}/attend`, authHeader());
                setAttending(!!res?.attending);
            } else {
                const res = await ApiPost<{ attending: boolean }>(`/Event/${id}/attend`, {}, authHeader());
                setAttending(!!res?.attending);
            }
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Er is iets misgegaan.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="event-card">
            <h3 className="event-title">{title}</h3>
            <p className="event-date">{new Date(date).toLocaleDateString()}</p>
            <p className="location">{location}</p>
            <p className="description">{description}</p>
            <p className="attendees">
                Attendees: {attendees.join(', ')}
            </p>
            {error && <p className="error-message">{error}</p>}
            <div className="table-actions">
                <button
                    className={`btn-sm ${attending ? 'btn-danger' : 'btn-primary-accent'}`}
                    onClick={onToggleAttend}
                    disabled={loading}
                    aria-pressed={attending}
                    aria-label={attending ? 'Unattend event' : 'Attend event'}
                >
                    {loading ? 'Bezig…' : attending ? 'Unattend' : 'Attend'}
                </button>
            </div>
        </div>
    );
}