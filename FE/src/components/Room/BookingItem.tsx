import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate, formatTimeUntil } from '../../utils/date.ts';
import { type Booking } from '../../utils/types.ts';

export const BookingItem: React.FC<{ booking: Booking }> = ({ booking }) => {
    const { t } = useTranslation('rooms');

    return (
        <li className="booking-item">
            <div className="booking-content" id="current-bookings">
                <div className="form-row">
                    <label>{t('bookingItem.labelDateTime')}:</label>
                    <span>{formatDate(booking.bookingDate)} ({booking.startTime} - {booking.endTime}) – {formatTimeUntil(booking.bookingDate, booking.startTime)}</span>
                </div>
                <div className="form-row">
                    <label>{t('bookingItem.labelRoom')}:</label>
                    <span>{booking.roomName}</span>
                </div>
                <div className="form-row">
                    <label>{t('bookingItem.labelPurpose')}:</label>
                    <span>{booking.purpose}</span>
                </div>
            </div>
        </li>
    );
};
