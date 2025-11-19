import React from "react";

// Define the props interface
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
    return (
        <div className="event-card">
            <h3 className="event-title">{title}</h3>
            <p className="event-date">{new Date(date).toLocaleDateString()}</p>
            <p className="location">{location}</p>
            <p className="description">{description}</p>
            <p className="attendees">
                Attendees: {attendees.join(', ')}
            </p>
        </div>
    );
}