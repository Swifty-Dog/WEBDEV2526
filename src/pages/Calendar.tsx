import React, { useCallback, useState } from 'react';
import { Calendar as CalendarComponent } from '../components/Calendar';
import { months } from '../utils/months.ts';

interface EventItem {
    title: string;
    details: string;
}

const sampleEvents = {
    '2025-10-01': ['Team Meeting'],
    '2025-10-03': ['Client Call'],
    '2025-10-07': ['Project Review'],
    '2025-10-10': ['Birthday Party'],
    '2025-10-15': ['Conference'],
    '2025-10-20': ['Workshop'],
    '2025-10-25': ['Team Building'],
    '2025-10-31': ['Halloween Party']
};

export const Calendar: React.FC = () => {
    const [eventsHeader, setEventsHeader] = useState<string>('Selecteer een dag');
    const [selectedEvents, setSelectedEvents] = useState<EventItem[]>([]);

    const onDaySelect = useCallback((dateString: string, dayEvents: string[] | undefined) => {
        const displayDate = dateString
            .split('-')
            .map((val, i) => (i === 1 ? months[+val - 1] : val))
            .reverse()
            .join(' ');

        if (dayEvents && dayEvents.length > 0) {
            setEventsHeader(`Events op ${displayDate} (Totaal: ${dayEvents.length})`);
            setSelectedEvents(dayEvents.map(title => ({ title, details: 'Klik voor details...' })));
        } else {
            setEventsHeader(`Geen events op ${displayDate}`);
            setSelectedEvents([]);
        }
    }, []);

    return (
        <div className="dashboard-grid">
            <div className="panel-fancy-borders">
                <CalendarComponent events={sampleEvents} onDaySelect={onDaySelect} />
            </div>

            <div className="events-section panel-fancy-borders calendar-events">
                <h2>{eventsHeader}</h2>
                <div className="events-list">
                    {selectedEvents.length > 0 ? (
                        selectedEvents.map((event, index) => (
                            <div className="event-item" key={index}>
                                <div className="event-details">
                                    <h4>{event.title}</h4>
                                    <p>{event.details}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="event-item no-events">
                            <p>{eventsHeader === 'Selecteer een dag' ? 'Selecteer een dag op de kalender.' : 'Niks gepland.'}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Calendar;
