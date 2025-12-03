import React from 'react';
import { type Booking } from '../../utils/types.ts';
import { formatDate, formatTimeUntil, isBookingInPast } from '../../utils/date.ts';

type RoomBookingsModalProps = {
    bookings: Booking[];
    onClose: () => void;
    onEdit: (booking: Booking) => void;
    onDelete: (booking: Booking) => void;
    message?: { text: string | null; type: 'success' | 'error' } | null;
};

export const RoomBookingsModal: React.FC<RoomBookingsModalProps> = ({ bookings, onClose, onEdit, onDelete, message }) => {
    return (
        <div className="modal-overlay">
            <div className="modal">
                <h3 className="titling">Alle aankomende boekingen</h3>
                {message?.text && (
                    <p className={message.type === 'error' ? 'error-message' : 'success-message'}>
                        {message.text}
                    </p>
                )}

                {bookings.length === 0 ? (
                    <p className="muted">Geen opkomende boekingen gevonden.</p>
                ) : (
                    <ul className="booking-items-list modal-list-scroll">
                        {bookings.map(booking => {
                            const isPast = isBookingInPast(booking.bookingDate, booking.startTime);

                            return (
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

                                    <div className="booking-actions">
                                        <button
                                            className="btn-sm button-secondary"
                                            onClick={() => onEdit(booking)}
                                            disabled={isPast}
                                            title={isPast ? "Boekingen in het verleden kunnen niet bewerkt worden" : "Boeking bewerken"}
                                        >
                                            Bewerken
                                        </button>
                                        <button
                                            className="btn-sm btn-danger"
                                            onClick={() => onDelete(booking)}
                                            disabled={isPast}
                                            title={isPast ? "Boekingen in het verleden kunnen niet verwijderd worden" : "Boeking verwijderen"}
                                        >
                                            Verwijderen
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}

                <div className="form-actions">
                    <button className="btn-sm btn-primary-accent" onClick={onClose}>Sluiten</button>
                </div>
            </div>
        </div>
    );
};
