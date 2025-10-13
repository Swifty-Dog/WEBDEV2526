import React from 'react';
import { useState, useCallback } from 'react';
import { Calendar } from '../components/Calendar';
import { months } from '../utils/months';

interface Event {
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

export const Dashboard: React.FC = () => {
    const [eventsHeader, setEventsHeader] = useState<string>("Selecteer een dag");
    const [selectedEvents, setSelectedEvents] = useState<Event[]>([]);

    const handleDaySelect = useCallback((dateString: string, dayEvents: string[] | undefined) => {
        dateString = dateString
                .split("-")
                .map((val, i) => (i === 1 ? months[+val - 1] : val))
                .reverse()
                .join(" ");

        if (dayEvents && dayEvents.length > 0) {
            setEventsHeader(`Events op ${dateString} (Totaal: ${dayEvents.length})`);

            const mappedEvents: Event[] = dayEvents.map(title => ({
                title: title,
                details: 'Klik voor details...',
            }));

            setSelectedEvents(mappedEvents);
        } else {
            setEventsHeader(`Geen events op ${dateString}`);
            setSelectedEvents([]);
        }
    }, []);


    return (
        <div className="dashboard-grid">
            <div className="calendar-section">
                <Calendar events={sampleEvents} onDaySelect={handleDaySelect} />
            </div>

            <div className="stats-section section-card">
                <h2>Statistieken</h2>
                <div className="stats-grid">
                    <p>Total Users: 120</p>
                    <p>Events This Month: {Object.keys(sampleEvents).length}</p>
                </div>
            </div>

            <div className="events-section section-card">
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
                            <p>{eventsHeader === "Selecteer een dag" ? "Selecteer een dag op de kalender." : "Niks gepland."}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};