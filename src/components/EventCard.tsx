import React, { useEffect, useState, useCallback } from "react";
import { ApiDelete, ApiPost, ApiGet } from "../config/ApiRequest";
import "../styles/EventCard.css";
import { useSettings } from '../config/SettingsContext';
import { LANGUAGE_MAP } from '../data/SettingsOptions';
import { useTranslation } from 'react-i18next';
import { onEvent } from "../utils/signalR/genericHub.ts";

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
    onAttendChange?: (eventId: string | number, attending: boolean) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
    id, title, date, startTime, endTime, location, description,
    attendees = [],
    initialAttending = false,
    onAttendChange
}) => {
    const { t } = useTranslation('events');
    const settings = useSettings();
    const locale = LANGUAGE_MAP[settings.language] || undefined;

    const [attending, setAttending] = useState<boolean>(initialAttending);
    const [localAttendees, setLocalAttendees] = useState<string[]>(Array.isArray(attendees) ? attendees : []);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const token = localStorage.getItem('authToken');

    useEffect(() => {
        if (Array.isArray(attendees)) {
            setLocalAttendees(attendees);
        }
    }, [attendees]);

    const refreshData = useCallback(async () => {
        if (!token) return;
        try {
            const data = await ApiGet<{ attendees: string[], isAttending: boolean }>(
                `/Attend/events/${id}/status`,
                { Authorization: `Bearer ${token}` }
            );

            if (data && Array.isArray(data.attendees)) {
                setLocalAttendees(data.attendees);
                setAttending(data.isAttending);
            }
        } catch (e) {
            console.error("Failed to refresh event data", e);
        }
    }, [id, token]);

    const handleManualToggle = async () => {
        setError(null);
        setLoading(true);
        try {
            const auth = { Authorization: `Bearer ${token}` };
            const res = attending
                ? await ApiDelete<{ attending: boolean }>(`/Attend/events/${id}`, auth)
                : await ApiPost<{ attending: boolean }>(`/Attend/events/${id}`, {}, auth);

            setAttending(res.attending);

            await refreshData();

            if (onAttendChange) onAttendChange(id, res.attending);
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!token) return;

        const unsubscribe = onEvent("AttendanceChanged", () => {
            void refreshData();
        });

        return () => {
            unsubscribe();
        };
    }, [token, refreshData]);

    return (
        <div className="event-card">
            <h3 className="event-title">{title}</h3>

            <p className="event-date">
                {new Date(date).toLocaleDateString(locale)}
            </p>

            <p className="event-time">
                {new Date(startTime).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })} –
                {new Date(endTime).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
            </p>

            <p className="location">{location}</p>
            <p className="description">{description}</p>

            <p className="attendees">
                {t('eventCard.attendeesLabel', {
                    attendees: Array.isArray(localAttendees) ? localAttendees.join(', ') : ''
                })}
            </p>

            {error && <p className="error-message">{error}</p>}

            <div className="table-actions">
                <button
                    className={`btn-sm ${attending ? 'btn-sm-danger' : 'btn-sm-primary'}`}
                    onClick={handleManualToggle}
                    disabled={loading}
                    aria-pressed={attending}
                    aria-label={
                        attending
                            ? t('eventCard.ariaUnattend')
                            : t('eventCard.ariaAttend')
                    }
                >
                    {loading
                        ? t('eventCard.loading')
                        : attending
                            ? t('eventCard.unattend')
                            : t('eventCard.attend')}
                </button>
            </div>
        </div>
    );
};
