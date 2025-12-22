import React, { useEffect, useMemo, useState } from 'react';
import { WeekCalendar } from '../components/WeekCalendar';
import { ApiGet, ApiDelete } from '../config/ApiRequest';
import { EventsTable } from '../components/EventsTable';
import { AttendeesModal } from '../components/AttendeesModal';
import type { EventItem as AdminEventItem } from './AdminDashboard';
import { useTranslation } from 'react-i18next';

interface EventApiItem {
    id: number;
    title: string;
    description?: string;
    eventDate: string;
    roomName?: string;
    location?: string;
    attendees: string[];
}

export const Dashboard: React.FC = () => {
    const { t } = useTranslation('common');
    const [events, setEvents] = useState<Array<{
        id: string;
        title: string;
        date: string; // ISO
        location?: string;
        description?: string;
        attendees?: string[];
        attending?: boolean;
    }>>([]);
    const [selectedDayISO, setSelectedDayISO] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [attendeesFor, setAttendeesFor] = useState<AdminEventItem | null>(null);

    const toDayKeyISO = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('authToken');
                const data = await ApiGet<EventApiItem[]>("/Event", token ? { Authorization: `Bearer ${token}` } : undefined);
                const mapped = data.map(e => ({
                    id: String(e.id),
                    title: e.title,
                    date: e.eventDate,
                    location: e.location ?? e.roomName,
                    description: e.description,
                    attendees: e.attendees,
                    attending: (e as any).attending === true
                }));
                setEvents(mapped);
            } catch (e) {
                setError(t('networkError'));
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const attendingEvents = useMemo(() => events.filter(ev => ev.attending), [events]);
    const filtered = useMemo(() => {
        const base = attendingEvents;
        if (!selectedDayISO) return base;
        return base.filter(ev => toDayKeyISO(new Date(ev.date)) === selectedDayISO);
    }, [attendingEvents, selectedDayISO]);

    const toAdminItem = (e: { id: string; title: string; date: string; location?: string; description?: string; attendees?: string[]; }): AdminEventItem => ({
        id: e.id,
        title: e.title,
        date: e.date,
        location: e.location,
        description: e.description,
        attendees: e.attendees ?? []
    });

    const unattend = async (ev: AdminEventItem) => {
        try {
            const token = localStorage.getItem('authToken');
            await ApiDelete(`/Event/${ev.id}/attend`, token ? { Authorization: `Bearer ${token}` } : undefined);
            setEvents(prev => prev.filter(e => e.id !== ev.id));
        } catch (e) {
            console.error('Unattend failed', e);
        }
    };

    return (
        <div className="dashboard-grid">
            <section className="section section--compact full-width">
                {selectedDayISO && (
                    <div className="filter-row">
                        <span className="muted">{t('calendar.filteredDayLabel')}</span>
                        <span className="filter-pill">{selectedDayISO}</span>
                        <button className="btn-sm" onClick={() => setSelectedDayISO(null)}>{t('general.clearFilter')}</button>
                    </div>
                )}
                <div className="panel-fancy-borders panel-compact">
                    {error && <p className="error-message">{error}</p>}
                    {loading ? (
                        <p>{t('loadingEvents')}</p>
                    ) : (
                        <WeekCalendar
                            events={events}
                            selectedDayISO={selectedDayISO ?? undefined}
                            onDaySelect={(iso) => setSelectedDayISO(prev => prev === iso ? null : iso)}
                        />
                    )}
                </div>

                <div className="panel-fancy-borders" style={{ marginTop: '1rem' }}>
                    <EventsTable
                        events={filtered.map(toAdminItem)}
                        onEdit={() => { /* no edit on normal dashboard */ }}
                        onDelete={(ev) => unattend(ev)}
                        onViewAttendees={(ev) => setAttendeesFor(ev)}
                        showEdit={false}
                        deleteLabel={t('general.buttonUnattend')}
                    />
                </div>
            </section>

            {attendeesFor && (
                <AttendeesModal
                    eventItem={attendeesFor}
                    onClose={() => setAttendeesFor(null)}
                />
            )}
        </div>
    );
};
