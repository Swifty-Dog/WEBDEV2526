import React, {useEffect, useState} from 'react';
import { useTranslation } from 'react-i18next';
import { EventsTable } from '../components/EventsTable';
import { AttendeesModal } from '../components/AttendeesModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { WeekCalendar } from '../components/WeekCalendar';
import { RegisterButton } from '../components/Admin/RegisterButton';
import { EventFormModal } from '../components/Event/EventFormModal';
import { ApiDelete } from '../config/ApiRequest';
import type { EventApiDto } from '../utils/types';
import { TerminateNavButton } from "../components/Admin/TerminateNavButton.tsx";
import { useSaveEvents } from '../hooks/useSaveEvents';
import { useUpcomingEvents } from '../hooks/useUpcomingEvents.ts';
import { useRooms } from '../hooks/Room/useRooms.ts';
import '../styles/admin-dashboard.css';
import PromoteDemoteModal from '../components/Admin/PromoteDemote.tsx';
import '../styles/_components.css';
import '../styles/admin-dashboard.css';

interface AdminDashboardProps {
    userRole: string | null;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ userRole }) => {
    const { t: tEvents } = useTranslation('events');
    const { t: tCommon } = useTranslation('common');
    const { t: tAdmin } = useTranslation('admin');
    const { events, loading, error, refetch } = useUpcomingEvents();
    const { saveEvent } = useSaveEvents();
    const { rooms } = useRooms();
    const [editingEvent, setEditingEvent] = useState<EventApiDto | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [attendeesFor, setAttendeesFor] = useState<EventApiDto | null>(null);
    const [confirmDeleteFor, setConfirmDeleteFor] = useState<EventApiDto | null>(null);
    const [selectedDayISO, setSelectedDayISO] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isPromoteDemoteOpen, setIsPromoteDemoteOpen] = useState(false);

    useEffect(() => {
        document.title = tCommon('menu.adminDashboard') + " | " + import.meta.env.VITE_APP_NAME;
    }, [tCommon]);

    const filteredEvents: EventApiDto[] = selectedDayISO
        ? events[selectedDayISO] ?? []
        : Object.values(events).flat();

    const openNew = () => {
        setEditingEvent(null);
        setIsFormOpen(true);
    };

    const handleSave = async (event: EventApiDto) => {
        try {
            await saveEvent(event);
            await refetch();
            setIsFormOpen(false);
        } catch (e: any) {
            setErrorMessage(e.message ?? tCommon('general.saveFailed'));
        }
    };

    const handleEdit = (ev: EventApiDto) => {
        setEditingEvent(ev);
        setIsFormOpen(true);
    };

    const handleDelete = async (ev: EventApiDto) => {
        try {
            const token = localStorage.getItem('authToken');
            await ApiDelete<void>(`/Event/${ev.id}`, token ? { Authorization: `Bearer ${token}` } : undefined);
            await refetch();
            setConfirmDeleteFor(null);
        } catch (err: any) {
            setErrorMessage(err?.message ?? tCommon('general.deleteFailed'));
        }
    };

    const handleViewAttendees = (ev: EventApiDto) => setAttendeesFor(ev);

    return (
        <div className="admin-dashboard page-content">
            <div className="admin-header">
                <div>
                    <h1>{tCommon('menu.adminDashboard')}</h1>
                </div>
                <div>
                    {userRole === 'admin' && (
                        <button
                            className="header-button"
                            onClick={() => setIsPromoteDemoteOpen(true)}>
                            {tAdmin('adminDashboard.promoteDemote')}
                        </button>
                    )}
                    <button
                        className="header-button"
                        id="extra-margins"
                        onClick={openNew}>{tAdmin('adminDashboard.buttonNewEvent')}</button>
                    {userRole === 'admin' &&
                        <RegisterButton />
                    }
                    {userRole === 'admin' &&
                        <TerminateNavButton />
                    }
                </div>
            </div>

            {loading && <p>{tCommon('loadingEvents')}</p>}
            {error && <p className="error-message">{error}</p>}
            {errorMessage && <p className="error-message">{errorMessage}</p>}

            <section className="section section--compact">
                <h2 className="section-title">{tCommon('calendar.weekViewTitle')}</h2>
                {selectedDayISO && (
                    <div className="filter-row">
                        <span className="muted">{tCommon('calendar.filteredDayLabel')}</span>
                        <span className="filter-pill">{selectedDayISO}</span>
                        <button className="btn-sm" onClick={() => setSelectedDayISO(null)}>
                            {tCommon('general.clearFilter')}
                        </button>
                    </div>
                )}
                <div className="panel-fancy-borders panel-compact">
                    <WeekCalendar
                        events={filteredEvents}
                        selectedDayISO={selectedDayISO ?? undefined}
                        onDaySelect={iso => setSelectedDayISO(prev => prev === iso ? null : iso)}
                    />
                </div>
            </section>

            <section className="section section--spacious">
                <div className="panel-fancy-borders">
                    <EventsTable
                        events={filteredEvents}
                        onEdit={handleEdit}
                        onDelete={ev => setConfirmDeleteFor(ev)}
                        onViewAttendees={handleViewAttendees}
                        showEdit={true}
                        adminRights={true}
                    />
                </div>
            </section>

            {isFormOpen && (
                <EventFormModal
                    existing={editingEvent ?? undefined}
                    rooms={rooms}
                    onClose={() => { setIsFormOpen(false); setEditingEvent(null); }}
                    onSave={handleSave}
                />
            )}

            {attendeesFor && (
                <AttendeesModal eventItem={attendeesFor} onClose={() => setAttendeesFor(null)} />
            )}

            {confirmDeleteFor && (
                <ConfirmDialog
                    title={tCommon('general.buttonDelete') + ' ' + tEvents('admin.eventLabel')}
                    message={tAdmin('adminDashboard.confirmDeleteMessage', { title: confirmDeleteFor.title })}
                    onConfirm={() => handleDelete(confirmDeleteFor)}
                    onCancel={() => setConfirmDeleteFor(null)}
                />
            )}

            {isPromoteDemoteOpen && userRole === 'admin' && (
                <PromoteDemoteModal onClose={() => setIsPromoteDemoteOpen(false)} />
            )}
        </div>
    );
};
