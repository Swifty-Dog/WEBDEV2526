import React, { useState } from 'react';
import type { BookingDetails } from '../../utils/types';
import { BookingForm } from './BookingForm';
import { useRooms } from '../../hooks/useRooms';
import { useDailyBookings } from '../../hooks/useDailyBookings';
import { useRoomAvailability } from '../../hooks/useRoomAvailability';
import { getInitialBookingDate } from '../../utils/date';
import { getInitialStartTime, getInitialEndTime } from '../../utils/time';

export const NewRoomBooking: React.FC = () => {
    const { rooms, loading: loadingRooms, error: roomsError } = useRooms();
    const [bookingDetails, setBookingDetails] = useState<BookingDetails>({
        roomId: 0,
        date: getInitialBookingDate(),
        startTime: getInitialStartTime(),
        endTime: getInitialEndTime(getInitialStartTime()),
        reason: '',
    });

    const { bookings: allDailyBookings, loading: loadingAvailability } = useDailyBookings(bookingDetails.date);

    const { roomIsFullMap, availableStartTimes, availableEndTimes } = useRoomAvailability(
        rooms,
        allDailyBookings,
        bookingDetails.date,
        bookingDetails.startTime,
        bookingDetails.roomId
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'date') {
            const defaultStart = getInitialStartTime();
            setBookingDetails({
                roomId: 0,
                date: value,
                startTime: defaultStart,
                endTime: getInitialEndTime(defaultStart),
                reason: '',
            });
            return;
        }

        setBookingDetails(prev => ({
            ...prev,
            [name]: name === 'roomId' ? Number(value) : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Submit booking', bookingDetails);
    };

    if (loadingRooms) return <p>Kamers laden...</p>;

    return (
        <div className="section-card vertical-flex-card">
            <h2 className="titling">Nieuwe Boeking Maken</h2>
            <BookingForm
                rooms={rooms}
                bookingDetails={bookingDetails}
                availableStartTimes={availableStartTimes}
                availableEndTimes={availableEndTimes}
                roomIsFullMap={roomIsFullMap}
                loadingAvailability={loadingAvailability}
                fetchError={!!roomsError}
                onChange={handleChange}
                onSubmit={handleSubmit}
                message={roomsError ? { text: roomsError, type: 'error' } : null}
            />
        </div>
    );
};
