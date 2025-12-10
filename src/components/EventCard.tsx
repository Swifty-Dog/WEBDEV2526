import React from "react";
import { useTranslation } from 'react-i18next';

interface EventCardProps {
    id: number;                     // C# long → TS number
    title: string;                  // C# string
    description?: string | null;    // C# string? → TS string | null
    eventDate: string;              // C# DateTime → TS string (ISO)
    roomId?: number | null;         // C# long? → TS number | null
    attendees?: string[];           // mapping van EventParticipations (optioneel)
}

export const EventCard: React.FC<EventCardProps> = ({
    title,
    eventDate,
    roomId,
    description,
    attendees
}) => {
    const { t } = useTranslation('events');

    return (
        <div className="event-card">
            <h3 className="event-title">{title}</h3>
            <p className="event-date">{new Date(eventDate).toLocaleDateString()}</p>
            <p className="location">{roomId}</p>
            <p className="description">{description}</p>
            <p className="attendees">
                {t('eventCard.attendeesLabel', { attendees: attendees?.join(', ') })}
            </p>
        </div>
    );
}
