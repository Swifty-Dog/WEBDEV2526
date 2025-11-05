import React from 'react';
import type { EventItem } from '../pages/AdminDashboard';

interface Props {
    events: EventItem[];
    onEdit: (ev: EventItem) => void;
    onDelete: (ev: EventItem) => void;
    onViewAttendees: (ev: EventItem) => void;
}

export const EventsTable: React.FC<Props> = ({ events, onEdit, onDelete, onViewAttendees }) => {
    return (
        <div>
            <table className="events-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Date</th>
                        <th>Location</th>
                        <th>Attendees</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {events.length === 0 && (
                        <tr>
                            <td colSpan={5} style={{ textAlign: 'center', padding: '1.25rem' }}>
                                No events yet — create a new event to get started.
                            </td>
                        </tr>
                    )}
                    {events.map(ev => (
                        <tr key={ev.id}>
                            <td>
                                <div style={{ fontWeight: 600 }}>{ev.title}</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>{ev.description}</div>
                            </td>
                            <td>{new Date(ev.date).toLocaleString()}</td>
                            <td>{ev.location ?? '-'}</td>
                            <td>{(ev.attendees ?? []).length}</td>
                            <td>
                                <div className="table-actions">
                                    <button className="btn-sm" onClick={() => onEdit(ev)}>Edit</button>
                                    <button className="btn-sm" onClick={() => onViewAttendees(ev)}>Attendees</button>
                                    <button className="btn-sm btn-danger" onClick={() => onDelete(ev)}>Delete</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default EventsTable;
