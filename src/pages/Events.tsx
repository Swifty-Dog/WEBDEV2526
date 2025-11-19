import React, { useState } from 'react';
import '../styles/global.css';
import '../styles/_components.css';
import "../styles/EventCard.css";
import { EventCard } from "../components/EventCard";

export const Events: React.FC = () => {
    // Sample events data
    const [events] = useState([
        {
            id: "1",
            title: "Team Meeting",
            date: "2025-11-10",
            location: "Room 101",
            description: "Weekly team sync",
            attendees: ["John", "Jane", "Bob"]
        },
        {
            id: "2",
            title: "Sprint Planning",
            date: "2025-11-15",
            location: "Conference Room",
            description: "Plan next sprint",
            attendees: ["Alice", "Bob", "Charlie"]
        },
        {
            id: "3",
            title: "Retrospective",
            date: "2025-11-17",
            location: "Conference Room",
            description: "Review sprint performance",
            attendees: ["Alice", "Bob", "Charlie", "David"]
        },
        {
            id: "4",
            title: "Client Presentation",
            date: "2025-11-19",
            location: "Main Hall",
            description: "Present project updates",
            attendees: ["John", "Emma", "Frank"]
        },
        {
            id: "5",
            title: "Design Workshop",
            date: "2025-11-22",
            location: "Design Studio",
            description: "UI/UX design session",
            attendees: ["Grace", "Henry", "Iris"]
        },
        {
            id: "6",
            title: "Code Review",
            date: "2025-11-24",
            location: "Dev Room",
            description: "Review pull requests",
            attendees: ["Jack", "Kevin", "Liam"]
        },
        {
            id: "7",
            title: "Database Migration",
            date: "2025-11-26",
            location: "Server Room",
            description: "Migrate to new database",
            attendees: ["Mike", "Nancy", "Oscar"]
        },
    ]);

    return (
        <div className="events-page">
            <h1>Events</h1>

            <div className="stats-section section-card">
                <h2>Statistieken</h2>
                <div className="stats-grid">
                    <p>Total Users: 120</p>
                    <p>Events This Month: {events.length}</p>
                </div>
            </div>

            {/* <div className="calender-week-selector">
                Hier komt een component zodat de gebruiker de gewenste week kan selecteren die getoont moet worden.

            </div> */}


            <div className="events-grid">
                {events.map(event => (
                    <EventCard
                        key={event.id}
                        id={event.id}
                        title={event.title}
                        date={event.date}
                        description={event.description}
                        location={event.location}
                        attendees={event.attendees}
                    />
                ))}
            </div>
        </div>
    );
}