import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/_components.css';
import '../styles/admin-dashboard.css';
import { EventsTable } from '../components/EventsTable';
import { AttendeesModal } from '../components/AttendeesModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { WeekCalendar } from '../components/WeekCalendar';
import { RegisterButton } from '../components/Admin/RegisterButton';
import { CreateNewEvent } from '../components/Event/EventFormModal';
import { ApiGet } from '../config/ApiRequest';
import { ApiDelete } from '../config/ApiRequest';
import { formatISOToDisplay } from '../utils/date';
import type { Room, Event, EventApiDto } from '../utils/types';
import { TerminateNavButton } from "../components/Admin/TerminateNavButton.tsx";
import { useSaveEvents } from '../hooks/useSaveEvents.ts';

interface AdminDashboardProps {
    userRole: string | null;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ userRole }) => {
    const { t: tEvents } = useTranslation('events');
    const { t: tCommon } = useTranslation('common');
    const { t: tAdmin } = useTranslation('admin');
    const [events, setEvents] = useState<Event[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const { saveEvent } = useSaveEvents(rooms);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [attendeesFor, setAttendeesFor] = useState<Event | null>(null);
    const [confirmDeleteFor, setConfirmDeleteFor] = useState<Event | null>(null);
    const [selectedDayISO, setSelectedDayISO] = useState<Date | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // helper: zet backend model om naar EventItem
    const mapEventApiToEvent = (dto: EventApiDto, rooms: Room[]): Event => {
        // Vind het room object in frontend lijst op basis van id
        const room = dto.room?.id ? rooms.find(r => r.id === dto.room?.id) : undefined;
        console.log(dto.EndTime, dto.StartTime);

        return {
            id: dto.id,
            title: dto.title,
            description: dto.description,
            eventDate: dto.eventDate,
            eventStartTime: dto.StartTime,
            eventEndTime: dto.EndTime,
            room,
            attendeesCount: dto.attendees?.length ?? 0
        };
    };


    // laad events en rooms bij component mount
    useEffect(() => {
        let mounted = true;

        const loadData = async () => {
            setLoading(true);
            setError(null);

            try {
                // Laad rooms eerst zodat events direct gemapt kunnen worden
                const roomsData = await ApiGet<Room[]>('/Room');
                if (!mounted) return;
                setRooms(roomsData);

                // Laad events
                const token = localStorage.getItem('authToken');
                const eventsData = await ApiGet<EventApiDto[]>('/Event', token ? { Authorization: `Bearer ${token}` } : undefined);
                if (!mounted) return;

                // Map DTO → UI type, koppel room object
                const mappedEvents = eventsData.map(dto => mapEventApiToEvent(dto, roomsData));
                setEvents(mappedEvents);

            } catch (err: any) {
                setError(err?.message ?? 'Kon events niet laden');
            } finally {
                if (mounted) setLoading(false);
            }
        };

        loadData();
        return () => { mounted = false; };
    }, []);

    const filteredEvents = selectedDayISO
        ? events.filter(ev => formatISOToDisplay(ev.eventDate, false) === formatISOToDisplay(selectedDayISO, false))
        : events;

    // useEffect(() => {
    //     const fetchEvents = async () => {
    //         setLoading(true);
    //         setError(null);
    //         try {
    //             const token = localStorage.getItem('authToken');
    //             const data = await ApiGet<EventApiDto[]>("/Event", token ? { Authorization: `Bearer ${token}` } : undefined);
    //             const mapped: Event[] = data.map(e => ({
    //                 id: e.id,
    //                 title: e.title,
    //                 eventDate: e.eventDate,
    //                 eventStartTime: e.StartTime,
    //                 eventEndTime: e.EndTime,
    //                 location: e.room?.roomName,
    //                 description: e.description,
    //                 attendeesCount: e.attendees?.length ?? 0
    //             }));
    //             setEvents(mapped);
    //         } catch (e) {
    //             setError(tCommon('networkError'));
    //         } finally {
    //             setLoading(false);
    //         }
    //     };
    //     fetchEvents();
    // }, []);

    const openNew = () => {
        setEditingEvent(null);
        setIsFormOpen(true);
    };

    const handleSave = async (event: Omit<Event, 'attendeesCount'>) => {
        try {
            const saved = await saveEvent(event);

            setEvents(prev =>
                event.id
                    ? prev.map(e => e.id === saved.id ? saved : e)
                    : [saved, ...prev]
            );
        } catch (e: any) {
            setError(e.message ?? 'Opslaan mislukt');
        }
    };

    const handleEdit = (ev: Event) => {
        setEditingEvent(ev);
        setIsFormOpen(true);
    };

    const handleDelete = async (ev: Event) => {
        // optimistic UI
        setEvents(prev => prev.filter(e => e.id !== ev.id));
        setConfirmDeleteFor(null);
        // TODO: call backend DELETE endpoint, e.g. await fetch(`/api/events/${ev.id}`, { method: 'DELETE' })
        await ApiDelete<void>(`/Event/${ev.id}`);
    };

    const handleViewAttendees = (ev: Event) => {
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
                    <button
                        className="header-button"
                        id="extra-margins"
                        onClick={openNew}>{tAdmin('adminDashboard.buttonNewEvent')}</button>
                    {userRole === 'admin' && (
                        <RegisterButton />
                    )}
                    {userRole === 'admin' &&
                        <TerminateNavButton />
                    }
                </div>
            </div>

            <section className="section section--compact">
                <h2 className="section-title">{tCommon('calendar.weekViewTitle')}</h2>
                {selectedDayISO && (
                    <div className="filter-row">
                        <span className="muted">{tCommon('calendar.filteredDayLabel')}</span>
                        <span className="filter-pill">{formatISOToDisplay(selectedDayISO, false)}</span>
                        <button className="btn-sm" onClick={() => setSelectedDayISO(null)}>{tCommon('general.clearFilter')}</button>
                    </div>
                )}
                <div className="panel-fancy-borders panel-compact">
                    {error && <p className="error-message">{error}</p>}
                    {loading && <p>{tCommon('loadingEvents')}</p>}
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
                        onDelete={(ev: Event) => setConfirmDeleteFor(ev)}
                        onViewAttendees={handleViewAttendees}
                    />
                </div>
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
