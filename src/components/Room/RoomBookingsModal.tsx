import React from 'react';
import { useTranslation } from 'react-i18next';
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
    const { t: tRooms } = useTranslation('rooms');
    const { t: tCommon } = useTranslation('common');

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h3 className="titling">{tRooms('roomBookingsModal.title')}</h3>
                {message?.text && (
                    <p className={message.type === 'error' ? 'error-message' : 'success-message'}>
                        {message.text}
                    </p>
                )}

                {bookings.length === 0 ? (
                    <p className="muted">{tRooms('roomBookingsModal.empty')}</p>
                ) : (
                    <ul className="booking-items-list modal-list-scroll">
                        {bookings.map(booking => {
                            const isPast = isBookingInPast(booking.bookingDate, booking.startTime);

                            return (
                                <li key={booking.id} className="booking-item">
                                    <div className="booking-content">
                                        <div className="form-row">
                                            <label>{tRooms('bookingItem.labelDateTime')}:</label>
                                            <span>
                                                {formatDate(booking.bookingDate)} ({booking.startTime} - {booking.endTime}) –{' '}
                                                {formatTimeUntil(booking.bookingDate, booking.startTime)}
                                            </span>
                                        </div>
                                        <div className="form-row">
                                            <label>{tRooms('bookingItem.labelRoom')}:</label>
                                            <span>{booking.roomName}</span>
                                        </div>
                                        <div className="form-row">
                                            <label>{tRooms('bookingItem.labelPurpose')}:</label>
                                            <span>{booking.purpose}</span>
                                        </div>
                                    </div>

                                    <div className="booking-actions">
                                        <button
                                            className="btn-sm button-secondary"
                                            onClick={() => onEdit(booking)}
                                            disabled={isPast}
                                            title={tRooms(isPast ? 'roomBookingsModal.tooltipEditPast' : 'roomBookingsModal.tooltipEdit')}
                                        >
                                            {tCommon('general.buttonEdit')}
                                        </button>
                                        <button
                                            className="btn-sm btn-danger"
                                            onClick={() => onDelete(booking)}
                                            disabled={isPast}
                                            title={tRooms(isPast ? 'roomBookingsModal.tooltipDeletePast' : 'roomBookingsModal.tooltipDelete')}
                                        >
                                            {tCommon('general.buttonDelete')}
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}

                <div className="form-actions">
                    <button className="btn-sm btn-primary-accent" onClick={onClose}>
                        {tCommon('general.buttonClose')}
                    </button>
                </div>
            </div>
        </div>
    );
};
