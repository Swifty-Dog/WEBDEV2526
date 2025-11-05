import React from 'react';
import type { EventItem } from '../pages/AdminDashboard';

interface Props {
    eventItem: EventItem;
    onClose: () => void;
}

export const AttendeesModal: React.FC<Props> = ({ eventItem, onClose }) => {
    const attendees = eventItem.attendees ?? [];
    return (
        <div className="modal-overlay">
            <div className="modal">
                <h3>Attendees — {eventItem.title}</h3>
                {attendees.length === 0 ? (
                    <p className="muted">No attendees signed up yet.</p>
                ) : (
                    <ul>
                        {attendees.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button className="btn-sm" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default AttendeesModal;
