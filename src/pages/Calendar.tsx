import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar as CalendarComponent } from '../components/Calendar';
import { ApiGet } from '../config/ApiRequest';
import { EventDetailsModal } from '../components/EventDetailsModal';
import type { EventApiDto } from '../utils/types';
import { EventCard } from '../components/EventCard';


const toDayKeyISO = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const formatDisplayDate = (key: string) => {
    const [y, m, d] = key.split('-').map(Number);
    const date = new Date(y, (m ?? 1) - 1, d ?? 1);
    return new Intl.DateTimeFormat(undefined, {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    }).format(date);
};

const mapApiEvent = (e: EventApiDto): EventApiDto | null => {
    if (!e.eventDate || !e.attending) return null; // alleen attending = true
    return {
        id: e.id,
        title: e.title,
        eventDate: e.eventDate,
        startTime: e.startTime,
        endTime: e.endTime,
        room: e.room,
        description: e.description,
        attendees: e.attendees ?? [],
        attending: true
    };
};

const groupEventsByDate = (events: EventApiDto[]) => {
    const titles: Record<string, string[]> = {};
    const full: Record<string, EventApiDto[]> = {};
    for (const ev of events) {
        const key = toDayKeyISO(new Date(ev.eventDate));
        (titles[key] ||= []).push(ev.title);
        (full[key] ||= []).push(ev);
    }
    return { titles, full };
};

export const Calendar: React.FC = () => {
    const { t } = useTranslation('common');
    const [eventsHeader, setEventsHeader] = useState(t('dashboard.headerInitial'));
    const [hasSelected, setHasSelected] = useState(false);
    const [, setSelectedEvents] = useState<{ title: string; details: string }[]>([]);
    const [selectedFullEvents, setSelectedFullEvents] = useState<EventApiDto[]>([]);
    const [detailsFor, setDetailsFor] = useState<EventApiDto | null>(null);
    const [eventsByDate, setEventsByDate] = useState<Record<string, string[]>>({});
    const [eventsByDateFull, setEventsByDateFull] = useState<Record<string, EventApiDto[]>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('authToken');

                const data = await ApiGet<EventApiDto[]>(
                    '/Event',
                    token ? { Authorization: `Bearer ${token}` } : undefined
                );
                const mapped = data
                    .map(mapApiEvent)
                    .filter((e): e is EventApiDto => e !== null && e.attending === true); // alleen attending
                console.log('Mapped events for calendar:', mapped);
                const { titles, full } = groupEventsByDate(mapped);
                setEventsByDate(titles);
                setEventsByDateFull(full);
            } catch {
                setError(t('networkError'));
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, [t]);

    const onDaySelect = useCallback((dateString: string, dayEvents?: string[]) => {
        const displayDate = formatDisplayDate(dateString);
        const full = eventsByDateFull[dateString] ?? [];

        if (dayEvents && dayEvents.length > 0) {
            setEventsHeader(t('dashboard.headerEventsFound', { date: displayDate, count: dayEvents.length }));
            setSelectedEvents(dayEvents.map(title => ({ title, details: t('dashboard.detailsClick') })));
            setSelectedFullEvents(full);
        } else {
            setEventsHeader(t('dashboard.headerEventsNone', { date: displayDate }));
            setSelectedEvents([]);
            setSelectedFullEvents([]);
        }
        setHasSelected(true);
    }, [eventsByDateFull, t]);

    return (
        <div className="dashboard-grid">
            <div className="panel-fancy-borders">
                {error && <p className="error-message">{error}</p>}
                {loading ? (
                    <p>{t('loadingEvents')}</p>
                ) : (
                    <CalendarComponent events={eventsByDate} onDaySelect={onDaySelect} />
                )}
            </div>

            <div className="events-section panel-fancy-borders calendar-events">
                <h2>{eventsHeader}</h2>
                <div className="events-list">
                    {selectedFullEvents.length > 0 ? (
                        selectedFullEvents.map(event => (
                            <EventCard
                                key={event.id}
                                id={event.id}
                                title={event.title}
                                date={event.eventDate}
                                startTime={event.startTime}
                                endTime={event.endTime}
                                location={event.room?.roomName || ''}
                                description={event.description || ''}
                                attendees={event.attendees}
                                initialAttending={event.attending}
                                onAttendChange={(id, attending) => {
                                    // update Calendar state
                                    setSelectedFullEvents(prev =>
                                        prev.map(ev => ev.id === id ? { ...ev, attending } : ev).filter(ev => ev.attending)
                                    );
                                    setEventsByDateFull(prev => {
                                        const nextFull: Record<string, EventApiDto[]> = {};
                                        for (const key of Object.keys(prev)) {
                                            const filtered = prev[key].map(ev => ev.id === id ? { ...ev, attending } : ev)
                                                .filter(ev => ev.attending);
                                            if (filtered.length > 0) nextFull[key] = filtered;
                                        }
                                        // update titles
                                        const nextTitles: Record<string, string[]> = {};
                                        for (const key of Object.keys(nextFull)) {
                                            nextTitles[key] = nextFull[key].map(ev => ev.title);
                                        }
                                        setEventsByDate(nextTitles);
                                        return nextFull;
                                    });
                                }}
                            />
                        ))
                    ) : (
                        <div className="event-item no-events">
                            <p>{hasSelected ? t('dashboard.statusNothingPlanned') : t('dashboard.statusSelectDay')}</p>
                        </div>
                    )}
                </div>

            </div>

            {detailsFor && (
                <EventDetailsModal
                    event={detailsFor}
                    onClose={(finalAttending) => {
                        if (finalAttending === false && detailsFor) {
                            const eventId = detailsFor.id;
                            setSelectedFullEvents(prev => prev.filter(ev => ev.id !== eventId));
                            setSelectedEvents(prev => prev.filter(ev => (ev as any).id !== eventId));
                            setEventsByDateFull(prev => {
                                const nextFull: Record<string, EventApiDto[]> = {};
                                for (const key of Object.keys(prev)) {
                                    const filtered = prev[key].filter(ev => ev.id !== eventId);
                                    if (filtered.length > 0) nextFull[key] = filtered;
                                }
                                const nextTitles: Record<string, string[]> = {};
                                for (const key of Object.keys(nextFull)) {
                                    nextTitles[key] = nextFull[key].map(ev => ev.title);
                                }
                                setEventsByDate(nextTitles);
                                return nextFull;
                            });
                        }
                        setDetailsFor(null);
                    }}
                    onAttendChange={(eventId, nowAttending) => {
                        setSelectedFullEvents(prev => prev
                            .map(ev => ev.id === eventId ? { ...ev, attending: nowAttending } : ev)
                            .filter(ev => ev.attending) // verwijder events die niet meer attending zijn
                        );

                        if (detailsFor && detailsFor.id === eventId && !nowAttending) {
                            setDetailsFor(null); // sluit modal als event niet meer attending is
                        }
                    }}
                />
            )}
        </div>
    );
};

export default Calendar;
