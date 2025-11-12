import React, { useState } from 'react';
import { RoomBookingsModal } from './RoomBookingsModal.tsx';
import { BookingItem } from './BookingItem.tsx';
import { useCurrentRoomBookings } from '../../hooks/useCurrentRoomBookings.ts';

export const CurrentRoomBookings: React.FC = () => {
    const { bookings, loading, error } = useCurrentRoomBookings();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const displayedBookings = bookings.slice(0, 3);

    if (loading) return <p>Boekingen laden...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <>
            <div className="section-card vertical-flex-card">
                <h2 className="titling">Opkomende kamerboekingen</h2>

                {bookings.length === 0 ? (
                    <p className="muted">Geen opkomende boekingen gevonden.</p>
                ) : (
                    <ul className="booking-items-list flex-fill">
                        {displayedBookings.map(b => <BookingItem key={b.id} booking={b} />)}
                    </ul>
                )}

                <button
                    className="button-secondary full-width-button"
                    onClick={() => setIsModalOpen(true)}
                >
                    Bekijk al mijn aankomende boekingen &gt;
                </button>
            </div>

            {isModalOpen && <RoomBookingsModal bookings={bookings} onClose={() => setIsModalOpen(false)} />}
        </>
    );
};
