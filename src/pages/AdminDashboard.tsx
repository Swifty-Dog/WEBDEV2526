import React, { useEffect, useState } from 'react';
import '../styles/_components.css';
import '../styles/admin-dashboard.css';
import { EventsTable } from '../components/EventsTable';
import { EventFormModal } from '../components/EventFormModal';
import { AttendeesModal } from '../components/AttendeesModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { WeekCalendar } from '../components/WeekCalendar';
import { RegisterButton } from '../components/RegisterButton';
import { ApiGet } from '../components/ApiRequest';

export type EventItem = {
    id: string;
    title: string;
    date: string; // ISO
    location?: string;
    description?: string;
    attendees?: string[];
};

interface EventApiItem {
    id: number;
    title: string;
    description?: string;
    date?: string; // legacy key when DTO used JsonPropertyName("date")
    eventDate?: string; // current key after DTO cleanup
    roomName?: string;
    location?: string;
    attendees: string[];
}

export const AdminDashboard: React.FC = () => {
    const [events, setEvents] = useState<EventItem[]>([]);
    const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [attendeesFor, setAttendeesFor] = useState<EventItem | null>(null);
    const [confirmDeleteFor, setConfirmDeleteFor] = useState<EventItem | null>(null);
    const [selectedDayISO, setSelectedDayISO] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const toDayKeyISO = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    const formatISOToDisplay = (iso?: string | null) => {
        if (!iso) return '';
        const parts = iso.split('-').map(p => Number(p));
        if (parts.length < 3 || parts.some(isNaN)) {
            // fallback: try Date parse
            const d = new Date(iso);
            return isNaN(d.getTime()) ? iso : new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
        }
        const [y, m, day] = parts;
        const d = new Date(y, m - 1, day);
        return new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
    };

    const filteredEvents = selectedDayISO
        ? events.filter(ev => toDayKeyISO(new Date(ev.date)) === selectedDayISO)
        : events;

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('authToken');
                const data = await ApiGet<EventApiItem[]>("/Event", token ? { Authorization: `Bearer ${token}` } : undefined);
                const mapped: EventItem[] = data.map(e => ({
                    id: String(e.id),
                    title: e.title,
                    date: (e.date ?? e.eventDate ?? new Date().toISOString()),
                    location: e.location ?? e.roomName,
                    description: e.description,
                    attendees: e.attendees ?? []
                }));
                setEvents(mapped);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Kon events niet laden.');
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

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
            <div className="admin-header">
                <div>
                    <button className="header-button" onClick={openNew}>+ New Event</button>
                    <RegisterButton style={{ marginLeft: '0.5rem' }} />
                </div>
            </div>

            <section className="section section--compact">
                {selectedDayISO && (
                    <div className="filter-row">
                        <span className="muted">Filtered day:</span>
                        <span className="filter-pill">{formatISOToDisplay(selectedDayISO)}</span>
                        <button className="btn-sm" onClick={() => setSelectedDayISO(null)}>Clear filter</button>
                    </div>
                )}
                <div className="panel-fancy-borders panel-compact">
                    {error && <p className="error-message">{error}</p>}
                    {loading && <p>Events laden...</p>}
                    <WeekCalendar
                        events={events}
                        selectedDayISO={selectedDayISO ?? undefined}
                        onDaySelect={(iso) => setSelectedDayISO(prev => prev === iso ? null : iso)}
                    />
                </div>
            </section>

            <section className="section section--spacious">
                <div className="panel-fancy-borders">
                    <EventsTable
                        events={filteredEvents}
                        onEdit={handleEdit}
                        onDelete={(ev: EventItem) => setConfirmDeleteFor(ev)}
                        onViewAttendees={handleViewAttendees}
                    />
                </div>
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
