import React from "react";
import { useTranslation } from 'react-i18next';

interface EventCardProps {
    id: string;
    title: string;
    date: string;
    location: string;
    description: string;
    attendees: string[];
}

export const EventCard: React.FC<EventCardProps> = ({
    title,
    date,
    location,
    description,
    attendees
}) => {
    const { t } = useTranslation('events');

    return (
        <div className="event-card">
            <h3 className="event-title">{title}</h3>
            <p className="event-date">{new Date(date).toLocaleDateString()}</p>
            <p className="location">{location}</p>
            <p className="description">{description}</p>
            <p className="attendees">
                {t('eventCard.attendeesLabel', { attendees: attendees.join(', ') })}
            </p>
        </div>
    );
}
