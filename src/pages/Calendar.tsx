import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar as CalendarComponent } from '../components/Calendar';
import { ApiGet } from '../config/ApiRequest';
import { EventDetailsModal } from '../components/EventDetailsModal';

type CalendarEvent = {
    id: string;
    title: string;
    date: string;
    location?: string;
    description?: string;
    attendees?: string[];
    attending?: boolean;
};

type EventApiItem = {
    id: number;
    title: string;
    description?: string;
    eventDate: string;
    roomName?: string;
    location?: string;
    attendees?: string[];
    attending?: boolean;
};

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

const mapApiEvent = (e: EventApiItem): CalendarEvent | null => {
    const iso = e.eventDate;
    const attending = e.attending === true;
    if (!iso || !attending) return null; // only show attending events with a date
    return {
        id: String(e.id),
        title: e.title,
        date: iso,
        location: e.location ?? e.roomName,
        description: e.description,
        attendees: e.attendees ?? [],
        attending
    };
};

const groupEventsByDate = (events: CalendarEvent[]) => {
    const titles: Record<string, string[]> = {};
    const full: Record<string, CalendarEvent[]> = {};
    for (const ev of events) {
        const key = toDayKeyISO(new Date(ev.date));
        (titles[key] ||= []).push(ev.title);
        (full[key] ||= []).push(ev);
    }
    return { titles, full };
};

export const Calendar: React.FC = () => {
    const { t } = useTranslation('common');
    const [eventsHeader, setEventsHeader] = useState(t('dashboard.headerInitial'));
    const [hasSelected, setHasSelected] = useState(false);
    const [selectedEvents, setSelectedEvents] = useState<{ title: string; details: string }[]>([]);
    const [selectedFullEvents, setSelectedFullEvents] = useState<CalendarEvent[]>([]);
    const [detailsFor, setDetailsFor] = useState<CalendarEvent | null>(null);
    const [eventsByDate, setEventsByDate] = useState<Record<string, string[]>>({});
    const [eventsByDateFull, setEventsByDateFull] = useState<Record<string, CalendarEvent[]>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('authToken');
                const data = await ApiGet<EventApiItem[]>(
                    '/Event',
                    token ? { Authorization: `Bearer ${token}` } : undefined
                );
                const mapped = data
                    .map(mapApiEvent)
                    .filter((e): e is CalendarEvent => e !== null);
                const { titles, full } = groupEventsByDate(mapped);
                setEventsByDate(titles);
                setEventsByDateFull(full);
            } catch (e) {
                setError(t('networkError'));
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

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
                    {selectedEvents.length > 0 ? (
                        selectedFullEvents.map((event, index) => (
                            <div className="event-item" key={event.id ?? index}>
                                <div className="event-details">
                                    <h4>
                                        <button className="link-button" onClick={() => setDetailsFor(event)} title={t('general.buttonViewDetails')}>
                                            {event.title}
                                        </button>
                                    </h4>
                                    <p className="muted">{t('dashboard.detailsClick')}</p>
                                </div>
                            </div>
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
                                const nextFull: Record<string, CalendarEvent[]> = {};
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
                        setSelectedFullEvents(prev => prev.map(ev => ev.id === eventId ? { ...ev, attending: nowAttending } : ev));
                        if (detailsFor && detailsFor.id === eventId) {
                            setDetailsFor({ ...detailsFor, attending: nowAttending });
                        }
                    }}
                />
            )}
        </div>
    );
};

export default Calendar;
