import React, { useEffect, useMemo, useState } from 'react';
import { WeekCalendar } from '../components/WeekCalendar';
import { ApiGet, ApiDelete } from '../config/ApiRequest';
import { EventsTable } from '../components/EventsTable';
import { AttendeesModal } from '../components/AttendeesModal';
import type { EventApiDto } from '../utils/types';
import { useTranslation } from 'react-i18next';
import {getUserRoleFromToken} from "../utils/auth.ts";

export const Dashboard: React.FC = () => {
    const { t } = useTranslation('common');
    const [events, setEvents] = useState<EventApiDto[]>([]);
    const [selectedDayISO, setSelectedDayISO] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [attendeesFor, setAttendeesFor] = useState<EventApiDto | null>(null);
    const token = localStorage.getItem('authToken');

    useEffect(() => {
        document.title = t('menu.dashboard') + " | " + import.meta.env.VITE_APP_NAME;
    }, [t]);

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
                const data = await ApiGet<EventApiDto[]>("/Event", token ? { Authorization: `Bearer ${token}` } : undefined);
                setEvents(data);
            } catch {
                setError(t('networkError'));
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, [t]);

    const attendingEvents = useMemo(() => events.filter(ev => (ev as any).attending), [events]);
    const filtered = useMemo(() => {
        const base = attendingEvents;
        if (!selectedDayISO) return base;
        return base.filter(ev => toDayKeyISO(new Date(ev.eventDate)) === selectedDayISO);
    }, [attendingEvents, selectedDayISO]);

    const toAdminItem = (e: EventApiDto): EventApiDto => e;

    const unattend = async (ev: EventApiDto) => {
        try {

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
                        showDelete={getUserRoleFromToken(token) !== "employee"}
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
