import React, { useState } from 'react';
import { ApiDelete, ApiPost } from './ApiRequest';

export interface EventDetailsItem {
    id: string;
    title: string;
    date: string; 
    location?: string;
    description?: string;
    attendees?: string[];
    attending?: boolean;
}

interface EventDetailsModalProps {
    event: EventDetailsItem;
    onClose: (finalAttending?: boolean) => void;
    onAttendChange?: (eventId: string, attending: boolean) => void;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({ event, onClose, onAttendChange }) => {
    const [attending, setAttending] = useState<boolean>(event.attending === true);
    const [busy, setBusy] = useState<boolean>(false);

    const toggleAttend = async () => {
        if (busy) return;
        setBusy(true);
        try {
            const token = localStorage.getItem('authToken');
            if (attending) {
                await ApiDelete(`/Event/${event.id}/attend`, token ? { Authorization: `Bearer ${token}` } : undefined);
                setAttending(false);
                onAttendChange?.(event.id, false);
            } else {
                await ApiPost(`/Event/${event.id}/attend`, {}, token ? { Authorization: `Bearer ${token}` } : undefined);
                setAttending(true);
                onAttendChange?.(event.id, true);
            }
        } catch (e) {
            console.error('Attend toggle failed', e);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <h3>{event.title}</h3>
                </div>
                <div className="modal-body">
                    <div className="detail-row"><strong>Date:</strong> <span>{new Date(event.date).toLocaleString()}</span></div>
                    {event.location && (
                        <div className="detail-row"><strong>Location:</strong> <span>{event.location}</span></div>
                    )}
                    {event.description && (
                        <div className="detail-row"><strong>Description:</strong> <span>{event.description}</span></div>
                    )}
                    <div className="detail-row"><strong>Attendees:</strong> <span>{(event.attendees ?? []).join(', ') || '—'}</span></div>
                </div>
                <div className="modal-footer modal-footer--right">
                    <button
                        className={attending ? 'btn-danger' : 'button-secondary'}
                        onClick={toggleAttend}
                        disabled={busy}
                    >
                        {attending ? 'Unattend' : 'Undo'}
                    </button>
                    <button className="button-secondary" onClick={() => onClose(attending)}>Close</button>
                </div>
            </div>
        </div>
    );
};
