import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/_components.css';
import '../styles/admin-dashboard.css';
import { EventsTable } from '../components/EventsTable';
import { AttendeesModal } from '../components/AttendeesModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { WeekCalendar } from '../components/WeekCalendar';
import { RegisterButton } from '../components/RegisterButton';
import { CreateNewEvent } from '../components/Event/EventFormModal';
import { ApiGet } from '../config/ApiRequest';
import { ApiPut } from '../config/ApiRequest';
import { ApiPost } from '../config/ApiRequest';
import { ApiDelete } from '../config/ApiRequest';
import { formatISOToDisplay } from '../utils/date';
import type { Room, Event, EventApiDto, UpdateEventApiDto, CreateEventApiDto } from '../utils/types';


interface AdminDashboardProps {
    userRole: string | null;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ userRole }) => {
    const { t: tEvents } = useTranslation('events');
    const { t: tCommon } = useTranslation('common');
    const { t: tAdmin } = useTranslation('admin');

    const [events, setEvents] = useState<Event[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [attendeesFor, setAttendeesFor] = useState<Event | null>(null);
    const [confirmDeleteFor, setConfirmDeleteFor] = useState<Event | null>(null);
    const [selectedDayISO, setSelectedDayISO] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // helper: zet backend model om naar EventItem
    const mapEventApiToEvent = (dto: EventApiDto, rooms: Room[]): Event => {
        // Vind het room object in frontend lijst op basis van id
        const room = dto.room?.id ? rooms.find(r => r.id === dto.room?.id) : undefined;

        return {
            id: dto.id,
            title: dto.title,
            description: dto.description,
            eventDate: dto.eventDate,
            eventStartTime: dto.StartTime,
            eventEndTime: dto.EndTime,
            room,
            attendeesCount: dto.attendeesCount
        };
    };


    // laad events en rooms bij component mount
    React.useEffect(() => {
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
                const eventsData = await ApiGet<EventApiDto[]>('/Event');
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

    const openNew = () => {
        setEditingEvent(null);
        setIsFormOpen(true);
    };

    const handleSave = async (
        payload: Omit<Event, 'attendeesCount'> & { id?: number, attendeesCount?: number }
    ) => {
        const startIso = `${payload.eventDate}T${payload.eventStartTime}:00`;
        const endIso = `${payload.eventDate}T${payload.eventEndTime}:00`;
        console.log('Saving event with startIso:', startIso, 'and endIso:', endIso);
        if (!payload.room?.id) {
            setError('Selecteer een room');
            return;
        }

        try {
            if (payload.id) {
                // Update via API
                const dto: UpdateEventApiDto = {
                    title: payload.title,
                    description: payload.description,
                    eventDate: payload.eventDate,
                    startTime: startIso,
                    endTime: endIso,
                    roomId: payload.room.id
                };

                const updatedDto = await ApiPut<EventApiDto>(`/Event/${payload.id}`, dto);

                // Map naar frontend event en koppel room uit rooms array
                const updatedEvent: Event = {
                    id: updatedDto.id,
                    title: updatedDto.title,
                    description: updatedDto.description,
                    eventDate: updatedDto.eventDate,
                    eventStartTime: updatedDto.StartTime,
                    eventEndTime: updatedDto.EndTime,
                    room: rooms.find(r => r.id === updatedDto.room?.id) ?? payload.room,
                    attendeesCount: updatedDto.attendeesCount ?? payload.attendeesCount ?? 0
                };

                setEvents(prev =>
                    prev.map(ev => ev.id === payload.id ? updatedEvent : ev)
                );

            } else {
                // Create via API
                const dto: CreateEventApiDto = {
                    title: payload.title,
                    description: payload.description,
                    eventDate: payload.eventDate,
                    startTime: startIso,
                    endTime: endIso,
                    roomId: payload.room.id
                };

                const createdDto = await ApiPost<EventApiDto>('/Event', dto);

                const newEvent: Event = {
                    id: createdDto.id,
                    title: createdDto.title,
                    description: createdDto.description,
                    eventDate: createdDto.eventDate,
                    eventStartTime: createdDto.StartTime,
                    eventEndTime: createdDto.EndTime,
                    room: rooms.find(r => r.id === createdDto.room?.id) ?? payload.room,
                    attendeesCount: createdDto.attendeesCount ?? 0
                };

                setEvents(prev => [newEvent, ...prev]);
            }

        } catch (err: any) {
            console.error(err);
            setError(err?.message ?? 'Opslaan mislukt');
        } finally {
            setIsFormOpen(false);
            setEditingEvent(null);
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
                        <span className="filter-pill">{formatISOToDisplay(selectedDayISO, false)}</span>
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
                    onDelete={(ev: Event) => setConfirmDeleteFor(ev)}
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
