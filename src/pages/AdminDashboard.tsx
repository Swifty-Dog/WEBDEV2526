import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/_components.css';
import '../styles/admin-dashboard.css';
import { EventsTable } from '../components/EventsTable';
import { AttendeesModal } from '../components/AttendeesModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { WeekCalendar } from '../components/WeekCalendar';
import { RegisterButton } from '../components/RegisterButton';
import { CreateNewEvent } from '../components/Event/CreateNewEvent';
import type { EventModel } from "../Models/EventModel";
import type { Room } from '../utils/types';
import { ApiGet } from '../config/ApiRequest';
import { ApiPut } from '../config/ApiRequest';
import { ApiPost } from '../config/ApiRequest';
import { ApiDelete } from '../config/ApiRequest';



export type EventItem = {
    id: number;
    title: string;
    description?: string;
    date: string; // ISO
    createdById?: number;
    location?: Room;
    attendees?: string[];
};

// const initialSample: EventItem[] = [
//     {
//         id: '1',
//         title: 'Team Standup',
//         date: new Date().toISOString(),
//         location: 'Conference Room A',
//         description: 'Daily sync for the engineering team',
//         attendees: ['Alice', 'Bob']
//     },
//     {
//         id: '2',
//         title: 'All-hands Meeting',
//         date: new Date(Date.now() + 86400000).toISOString(),
//         location: 'Main Hall',
//         description: 'Monthly company-wide update',
//         attendees: ['Charlie', 'Dana', 'Eve']
//     }
// ];


interface AdminDashboardProps {
    userRole: string | null;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ userRole }) => {
    const { t: tEvents } = useTranslation('events');
    const { t: tCommon } = useTranslation('common');
    const { t: tAdmin } = useTranslation('admin');

    const [events, setEvents] = useState<EventItem[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [attendeesFor, setAttendeesFor] = useState<EventItem | null>(null);
    const [confirmDeleteFor, setConfirmDeleteFor] = useState<EventItem | null>(null);
    const [selectedDayISO, setSelectedDayISO] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // helper: zet backend model om naar EventItem
    const mapEventModelToItem = (m: EventModel): EventItem => ({
        id: Number((m as any).id ?? (m as any).Id), // veilig halen
        title: (m as any).title ?? (m as any).Title ?? '',
        date: new Date((m as any).eventDate ?? (m as any).EventDate ?? (m as any).date).toISOString(),
        location: (m as any).location ?? (m as any).Location ?? undefined,
        description: (m as any).description ?? (m as any).Description ?? undefined,
        attendees: (m as any).attendees ?? (m as any).Attendees ?? []
    });

    // laad events en rooms bij component mount
    React.useEffect(() => {
        let mounted = true;
        async function load() {
            setLoading(true);
            setError(null);
            try {
                // Laad events
                const eventsData = await ApiGet<EventModel[]>('/Event');
                console.log('API /Event response:', eventsData);
                if (!mounted) return;
                setEvents(eventsData.map(mapEventModelToItem));

                // Laad rooms
                const roomsData = await ApiGet<Room[]>('/Room');
                console.log('API /Room response:', roomsData);
                if (!mounted) return;
                setRooms(roomsData);
            } catch (err: any) {
                setError(err?.message ?? 'Kon events niet laden');
            } finally {
                if (mounted) setLoading(false);
            }
        }
        load();
        return () => { mounted = false; };
    }, []);

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
        ? events.filter(ev => ev.date.startsWith(selectedDayISO))
        : events;

    const openNew = () => {
        setEditingEvent(null);
        setIsFormOpen(true);
    };

    const handleSave = async (payload: Omit<EventItem, 'id' | 'attendees'> & { id?: number }) => {
        try {
            if (payload.id) {
                // Update via API — verwacht de bijgewerkte EventModel terug
                const updated = await await ApiPut<EventModel>(`/Event/${payload.id}`, {
                    title: payload.title,
                    description: payload.description,
                    eventDate: payload.date,
                    roomId: payload.location?.id,
                    createdById: 1,
                });

                setEvents(prev => prev.map(ev => ev.id == payload.id ? mapEventModelToItem(updated) : ev));
            } else {
                // Create via API — gebruik id uit response
                const created = await ApiPost<EventModel>('/Event', {
                    title: payload.title,
                    description: payload.description,
                    eventDate: payload.date,
                    roomId: payload.location?.id,
                    createdById: 1,
                });

                setEvents(prev => [mapEventModelToItem(created), ...prev]);

            }
            // if (payload.id) {
            //     // Edit existing
            //     setEvents(prev => prev.map(ev => ev.id === payload.id ? { ...ev, ...payload } : ev));
            //     // TODO: call backend UPDATE endpoint, e.g. await fetch(`/api/events/${payload.id}`, {method: 'PUT', body: JSON.stringify(payload)})
            //     await ApiPut<EventModel>(`/Event/${payload.id}`, {
            //         title: payload.title,
            //         eventDate: payload.date,
            //         location: payload.location,
            //         description: payload.description
            //     });
            // } else {
            //     // Create new
            //     const newEv: EventItem = {
            //         id: String(Date.now()),
            //         title: payload.title,
            //         date: payload.date,
            //         location: payload.location,
            //         description: payload.description,
            //         attendees: []
            //     };
            //     setEvents(prev => [newEv, ...prev]);
            //     // TODO: call backend POST endpoint, e.g. await fetch(`/api/events`, {method: 'POST', body: JSON.stringify(newEv)})
            //     await ApiPost<EventModel>('/Event', {
            //         title: newEv.title,
            //         eventDate: newEv.date,
            //         location: newEv.location,
            //         description: newEv.description
            //     });
            // }
        } catch (err: any) {
            // eenvoudige foutafhandeling
            console.error(err);
            setError(err?.message ?? 'Opslaan mislukt');
        } finally {
            setIsFormOpen(false);
        }
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
        await ApiDelete<void>(`/Event/${ev.id}`);
    };

    const handleViewAttendees = (ev: EventItem) => {
        setAttendeesFor(ev);
    };

    { loading && <p>Bezig met laden...</p> }
    { error && <p className="error">{error}</p> }


    return (
        <div className="admin-dashboard page-content">
            <div className="admin-header">
                <div>
                    <h1>{tCommon('menu.adminDashboard')}</h1>
                    {/* <p className="muted">{tAdmin('adminDashboard.subtitle')}</p> */}
                </div>
                <div>
                    <button className="header-button" onClick={openNew}>{tAdmin('adminDashboard.buttonNewEvent')}</button>
                    {userRole === 'admin' && (
                        <RegisterButton style={{ marginLeft: '0.5rem' }} />
                    )}
                </div>
            </div>

            <section className="section section--compact">
                <h2 className="section-title">{tCommon('calendar.weekViewTitle')}</h2>
                {selectedDayISO && (
                    <div className="filter-row">
                        <span className="muted">{tCommon('calendar.filteredDayLabel')}</span>
                        <span className="filter-pill">{formatISOToDisplay(selectedDayISO)}</span>
                        <button className="btn-sm" onClick={() => setSelectedDayISO(null)}>{tCommon('general.clearFilter')}</button>
                    </div>
                )}
                <WeekCalendar
                    events={events}
                    selectedDayISO={selectedDayISO ?? undefined}
                    onDaySelect={(iso) => setSelectedDayISO(prev => prev === iso ? null : iso)}
                />
            </section>

            <section className="section section--spacious">
                <EventsTable
                    events={filteredEvents}
                    onEdit={handleEdit}
                    onDelete={(ev: EventItem) => setConfirmDeleteFor(ev)}
                    onViewAttendees={handleViewAttendees}
                />
            </section>

            {isFormOpen && (

                <CreateNewEvent
                    existing={editingEvent ?? undefined}
                    rooms={rooms}
                    onClose={() => {
                        setIsFormOpen(false);
                        setEditingEvent(null);
                    }}
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
                    title={tCommon('general.buttonDelete') + ' ' + tEvents('admin.eventLabel')}
                    message={tAdmin('adminDashboard.confirmDeleteMessage', { title: confirmDeleteFor.title })}
                    onConfirm={() => handleDelete(confirmDeleteFor)}
                    onCancel={() => setConfirmDeleteFor(null)}
                />
            )}
        </div>
    );
};
