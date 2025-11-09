import React from 'react';
import type { Booking } from './CurrentRoomBookings';
import { formatDate, formatTimeUntil } from './CurrentRoomBookings';

type RoomBookingsModalProps = {
    bookings: Booking[];
    onClose: () => void;
};

export const RoomBookingsModal: React.FC<RoomBookingsModalProps> = ({ bookings, onClose }) => {
    return (
        <div className="modal-overlay">
            <div className="modal">
                <h3 className="titling">Alle aankomende boekingen</h3>

                {bookings.length === 0 ? (
                    <p className="muted">Geen opkomende boekingen gevonden.</p>
                ) : (
                    <ul className="booking-items-list modal-list-scroll">
                        {bookings.map(booking => (
                            <li key={booking.id} className="booking-item">
                                <div className="booking-content">
                                    <div className="form-row">
                                        <label>Datum en tijd:</label>
                                        <span>
                                            {formatDate(booking.bookingDate)} ({booking.startTime} - {booking.endTime}) –{' '}
                                            {formatTimeUntil(booking.bookingDate, booking.startTime)}
                                        </span>
                                    </div>
                                    <div className="form-row">
                                        <label>Kamer:</label>
                                        <span>{booking.roomName}</span>
                                    </div>
                                    <div className="form-row">
                                        <label>Reden:</label>
                                        <span>{booking.purpose}</span>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                <div className="form-actions">
                    <button className="btn-sm btn-primary-accent" onClick={onClose}>Sluiten</button>
                </div>
            </div>
        </div>
    );
};
