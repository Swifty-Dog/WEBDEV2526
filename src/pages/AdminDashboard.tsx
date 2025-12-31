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
import type { Room, EventApiDto } from '../utils/types';
import { TerminateNavButton } from "../components/Admin/TerminateNavButton.tsx";
import { useSaveEvents } from '../hooks/useSaveEvents.ts';

interface AdminDashboardProps {
    userRole: string | null;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ userRole }) => {
    const token = localStorage.getItem('authToken');
    const { t: tEvents } = useTranslation('events');
    const { t: tCommon } = useTranslation('common');
    const { t: tAdmin } = useTranslation('admin');
    const [events, setEvents] = useState<EventApiDto[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const { saveEvent } = useSaveEvents();
    const [editingEvent, setEditingEvent] = useState<EventApiDto | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [attendeesFor, setAttendeesFor] = useState<EventApiDto | null>(null);
    const [confirmDeleteFor, setConfirmDeleteFor] = useState<EventApiDto | null>(null);
    const [selectedDayISO, setSelectedDayISO] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // helper: zet backend model om naar EventItem
    const mapEventApiToEvent = (dto: EventApiDto, rooms: Room[]): EventApiDto => {
        // Vind het room object in frontend lijst op basis van id
        const roomId = dto.room?.id ?? 0;
        const room = rooms.find(r => r.id === roomId);
        console.log(room?.roomName);

        return {
            id: dto.id,
            title: dto.title,
            description: dto.description,
            eventDate: dto.eventDate,
            startTime: dto.startTime,
            endTime: dto.endTime,
            room: { id: roomId, roomName: room?.roomName },
            attendees: dto.attendees,
            attending: dto.attending
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
        ? events.filter(ev => ev.eventDate === selectedDayISO)
        : events;

    const openNew = () => {
        setEditingEvent(null);
        setIsFormOpen(true);
    };

    const handleSave = async (event: EventApiDto) => {
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

    const handleEdit = (ev: EventApiDto) => {
        setEditingEvent(ev);
        setIsFormOpen(true);
    };

    const handleDelete = async (ev: EventApiDto) => {
        // optimistic UI
        setEvents(prev => prev.filter(e => e.id !== ev.id));
        setConfirmDeleteFor(null);
        // TODO: call backend DELETE endpoint, e.g. await fetch(`/api/events/${ev.id}`, { method: 'DELETE' })
        await ApiDelete<void>(`/Event/${ev.id}`, token ? { Authorization: `Bearer ${token}` } : undefined);
    };

    const handleViewAttendees = (ev: EventApiDto) => {
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
                        <span className="filter-pill">{selectedDayISO}</span>
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
                        onDelete={(ev: EventApiDto) => setConfirmDeleteFor(ev)}
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
