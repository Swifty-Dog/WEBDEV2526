import React, { useState } from "react";
import { ApiDelete, ApiPost } from "../config/ApiRequest";
import "../styles/EventCard.css";
import { useSettings } from '../config/SettingsContext';
import { LANGUAGE_MAP } from '../data/SettingsOptions';
import { useTranslation } from 'react-i18next';

interface EventCardProps {
    id: string | number;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    description: string;
    attendees?: string[];
    initialAttending?: boolean;
    onAttendChange?: (eventId: string | number, attending: boolean) => void; // Callback naar Calendar
}

type AttendResponse = { attending: boolean };

export const EventCard: React.FC<EventCardProps> = ({
    id,
    title,
    date,
    startTime,
    endTime,
    location,
    description,
    attendees,
    initialAttending = false,
    onAttendChange
}) => {
    const { t } = useTranslation('events');
    const settings = useSettings();
    const locale = LANGUAGE_MAP[settings.language] || undefined;
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
            let res: AttendResponse;
            if (attending) {
                // Afmelden van event
                res = await ApiDelete<AttendResponse>(`/attend/events/${id}`, authHeader());
            } else {
                // Aanmelden voor event
                res = await ApiPost<AttendResponse>(`/attend/events/${id}`, {}, authHeader());
            }
            const nowAttending = res.attending;
            setAttending(nowAttending);
            // Callback naar Calendar
            if (onAttendChange) onAttendChange(id, nowAttending);

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
            <p className="event-date">{new Date(date).toLocaleDateString(locale)}</p>
            <p className="event-time">
                {new Date(startTime).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })} -
                {new Date(endTime).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="location">{location}</p>
            <p className="description">{description}</p>
            <p className="attendees">
                {t('eventCard.attendeesLabel', { attendees: attendees?.join(', ') })}
            </p>
            {error && <p className="error-message">{error}</p>}
            <div className="table-actions">
                <button
                    className={`btn-sm ${attending ? 'btn-sm-danger' : 'btn-sm-primary'}`}
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
};
