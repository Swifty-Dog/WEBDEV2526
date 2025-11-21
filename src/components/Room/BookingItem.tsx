import React from 'react';
import {formatDate, formatTimeUntil } from '../../utils/date.ts';
import { type Booking } from '../../utils/types.ts';

export const BookingItem: React.FC<{ booking: Booking }> = ({ booking }) => (
    <li className="booking-item">
        <div className="booking-content" id="current-bookings">
            <div className="form-row">
                <label>Datum en tijd:</label>
                <span>{formatDate(booking.bookingDate)} ({booking.startTime} - {booking.endTime}) – {formatTimeUntil(booking.bookingDate, booking.startTime)}</span>
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
);
