import React, { useState } from 'react';
import '../styles/_components.css';
import { EventsTable } from '../components/EventsTable';
import { EventFormModal } from '../components/EventFormModal';
import { AttendeesModal } from '../components/AttendeesModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { WeekCalendar } from '../components/WeekCalendar';
import { RegisterButton } from '../components/RegisterButton';

export type EventItem = {
    id: string;
    title: string;
    date: string; // ISO
    location?: string;
    description?: string;
    attendees?: string[];
};

const initialSample: EventItem[] = [
    {
        id: '1',
        title: 'Team Standup',
        date: new Date().toISOString(),
        location: 'Conference Room A',
        description: 'Daily sync for the engineering team',
        attendees: ['Alice', 'Bob']
    },
    {
        id: '2',
        title: 'All-hands Meeting',
        date: new Date(Date.now() + 86400000).toISOString(),
        location: 'Main Hall',
        description: 'Monthly company-wide update',
        attendees: ['Charlie', 'Dana', 'Eve']
    }
];

export const AdminDashboard: React.FC = () => {
    const [events, setEvents] = useState<EventItem[]>(initialSample);
    const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [attendeesFor, setAttendeesFor] = useState<EventItem | null>(null);
    const [confirmDeleteFor, setConfirmDeleteFor] = useState<EventItem | null>(null);
    const [selectedDayISO, setSelectedDayISO] = useState<string | null>(null);

    const toDayKeyISO = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    const filteredEvents = selectedDayISO
        ? events.filter(ev => toDayKeyISO(new Date(ev.date)) === selectedDayISO)
        : events;

    const openNew = () => {
        setEditingEvent(null);
        setIsFormOpen(true);
    };

    const handleSave = async (payload: Omit<EventItem, 'id' | 'attendees'> & { id?: string }) => {
        if (payload.id) {
            // Edit existing
            setEvents(prev => prev.map(ev => ev.id === payload.id ? { ...ev, ...payload } : ev));
            // TODO: call backend UPDATE endpoint, e.g. await fetch(`/api/events/${payload.id}`, {method: 'PUT', body: JSON.stringify(payload)})
        } else {
            // Create new
            const newEv: EventItem = {
                id: String(Date.now()),
                title: payload.title,
                date: payload.date,
                location: payload.location,
                description: payload.description,
                attendees: []
            };
            setEvents(prev => [newEv, ...prev]);
            // TODO: call backend POST endpoint, e.g. await fetch(`/api/events`, {method: 'POST', body: JSON.stringify(newEv)})
        }
        setIsFormOpen(false);
    };

    const handleEdit = (ev: EventItem) => {
        setEditingEvent(ev);
        setIsFormOpen(true);
    };

    const handleDelete = async (ev: EventItem) => {
        // optimistic UI
        setEvents(prev => prev.filter(e => e.id !== ev.id));
        setConfirmDeleteFor(null);
        // TODO: call backend DELETE endpoint, e.g. await fetch(`/api/events/${ev.id}`, { method: 'DELETE' })
    };

    const handleViewAttendees = (ev: EventItem) => {
        setAttendeesFor(ev);
    };

    return (
        <div className="admin-dashboard page-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Admin Dashboard</h1>
                    <p className="muted">Manage calendar events — create, edit, delete and view attendees.</p>
                </div>
                <div>
                    <button className="header-button" onClick={openNew}>+ New Event</button>
                    <RegisterButton style={{ marginLeft: '0.5rem' }} />
                </div>
            </div>
            
            <section style={{ marginTop: '1rem' }}>
                <h2 style={{ margin: '0 0 0.5rem 0' }}>Week view</h2>
                {selectedDayISO && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.25rem 0 0.75rem 0' }}>
                        <span className="muted">Filtered day:</span>
                        <span style={{ background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border-subtle)', padding: '0.15rem 0.5rem', borderRadius: '0.35rem' }}>{selectedDayISO}</span>
                        <button className="btn-sm" onClick={() => setSelectedDayISO(null)}>Clear filter</button>
                    </div>
                )}
                <WeekCalendar
                    events={events}
                    onDaySelect={(iso) => setSelectedDayISO(prev => prev === iso ? null : iso)}
                />
            </section>

            <section style={{ marginTop: '1.5rem' }}>
                <EventsTable
                    events={filteredEvents}
                    onEdit={handleEdit}
                    onDelete={(ev: EventItem) => setConfirmDeleteFor(ev)}
                    onViewAttendees={handleViewAttendees}
                />
            </section>

            {isFormOpen && (
                <EventFormModal
                    existing={editingEvent ?? undefined}
                    onClose={() => setIsFormOpen(false)}
                    onSave={handleSave}
                />
            )}

            {attendeesFor && (
                <AttendeesModal
                    eventItem={attendeesFor}
                    onClose={() => setAttendeesFor(null)}
                />
            )}

            {confirmDeleteFor && (
                <ConfirmDialog
                    title="Delete event"
                    message={`Delete "${confirmDeleteFor.title}"? This cannot be undone.`}
                    onConfirm={() => handleDelete(confirmDeleteFor)}
                    onCancel={() => setConfirmDeleteFor(null)}
                />
            )}
        </div>
    );
};
