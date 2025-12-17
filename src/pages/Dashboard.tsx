import React from 'react';
import { useTranslation } from 'react-i18next';
import { useState, useCallback } from 'react';
import { Calendar } from '../components/Calendar';
import i18n from "../utils/locales/i18n.ts";

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
    const { t } = useTranslation('common');

    const [eventsHeader, setEventsHeader] = useState<string>(t('dashboard.headerInitial'));
    const [selectedEvents, setSelectedEvents] = useState<Event[]>([]);

    const handleDaySelect = useCallback((dateString: string, dayEvents: string[] | undefined) => {
        const dateParts = dateString.split("-");
        const dateDisplay = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2])).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long', year: 'numeric' });

        if (dayEvents && dayEvents.length > 0) {
            setEventsHeader(t('dashboard.headerEventsFound', { date: dateDisplay, count: dayEvents.length }));

            const mappedEvents: Event[] = dayEvents.map(title => ({
                title: title,
                details: t('dashboard.detailsClick'),
            }));

            setSelectedEvents(mappedEvents);
        } else {
            setEventsHeader(t('dashboard.headerEventsNone', { date: dateDisplay }));
            setSelectedEvents([]);
        }
    }, [t]);


    return (
        <div className="dashboard-grid">
            <div className="panel-fancy-borders">
                <Calendar events={sampleEvents} onDaySelect={handleDaySelect} />
            </div>

            <div className="stats-section section-card">
                <h2>{t('dashboard.statsTitle')}</h2>
                <div className="stats-grid">
                    <p>{t('dashboard.statsTotalUsers')}: 120</p>
                    <p>{t('dashboard.statsEventsMonth')}: {Object.keys(sampleEvents).length}</p>
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
                            <p>
                                {eventsHeader === t('dashboard.headerInitial')
                                ? t('dashboard.statusSelectDay')
                                : t('dashboard.statusNothingPlanned')}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
