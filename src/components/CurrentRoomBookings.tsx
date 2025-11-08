import React from 'react';

export const CurrentRoomBookings: React.FC = () => {
    return (
        <div className="section-card vertical-flex-card">
            <h2 className="titling">Opkomende kamerboekingen</h2>

            <ul className="booking-items-list flex-fill">
                <li className="booking-item">
                    <span className="booking-content">
                        Project Q: Kamer A (10:00 - 11:00)
                    </span>
                </li>
                <li className="booking-item">
                    <span className="booking-content">
                        Overleg P: Kamer C (14:30 - 15:00)
                    </span>
                </li>
            </ul>

            <button className="button-secondary">Bekijk al mijn aankomende boekingen &gt;</button>
        </div>
    )
}

