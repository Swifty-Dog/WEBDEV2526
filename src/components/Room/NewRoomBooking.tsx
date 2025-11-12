import React, { useState, useCallback } from 'react';
import type { BookingDetails } from '../../utils/types';
import { BookingForm } from './BookingForm';
import { useRooms } from '../../hooks/useRooms';
import { useMakeNewBooking } from '../../hooks/useMakeNewBooking';
import { useDailyBookings } from '../../hooks/useDailyBookings';
import { useRoomAvailability } from '../../hooks/useRoomAvailability';
import { getInitialBookingDate } from '../../utils/date';
import { getInitialStartTime, getInitialEndTime } from '../../utils/time';

type BookingMessage = {
    text: string;
    type: 'success' | 'error';
};

export const NewRoomBooking: React.FC = () => {
    const { rooms, loading: loadingRooms, error: roomsError } = useRooms();
    const [bookingDetails, setBookingDetails] = useState<BookingDetails>({
        roomId: 0,
        bookingDate: getInitialBookingDate(),
        startTime: getInitialStartTime(),
        endTime: getInitialEndTime(getInitialStartTime()),
        purpose: '',
    });

    const [bookingMessage, setBookingMessage] = useState<BookingMessage | null>(null);

    const { bookings: allDailyBookings, loading: loadingAvailability } = useDailyBookings(bookingDetails.bookingDate);

    const { roomIsFullMap, availableStartTimes, availableEndTimes } = useRoomAvailability(
        rooms,
        allDailyBookings,
        bookingDetails.bookingDate,
        bookingDetails.startTime,
        bookingDetails.roomId
    );

    const onBookingSuccess = useCallback(() => {
        setBookingMessage({ text: 'Boeking succesvol gemaakt!', type: 'success' });
        setBookingDetails({
            roomId: 0,
            bookingDate: getInitialBookingDate(),
            startTime: getInitialStartTime(),
            endTime: getInitialEndTime(getInitialStartTime()),
            purpose: '',
        });
    }, []);

    const onBookingError = useCallback((errorMessage: string) => {
        setBookingMessage({ text: errorMessage, type: 'error' });
    }, []);

    const { makeBooking } = useMakeNewBooking(
        bookingDetails,
        onBookingSuccess,
        onBookingError
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (bookingMessage) {
            setBookingMessage(null);
        }

        const { name, value } = e.target;

        if (name === 'bookingDate') {
            const defaultStart = getInitialStartTime();

            setBookingDetails(prev => ({
                ...prev,
                roomId: 0,
                bookingDate: value,
                startTime: defaultStart,
                endTime: getInitialEndTime(defaultStart),
            }));
            return;
        }

        setBookingDetails(prev => ({
            ...prev,
            [name]: name === 'roomId' ? Number(value) : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setBookingMessage(null);
        void makeBooking();
    };

    if (loadingRooms) return <p>Kamers laden...</p>;

    const messageToShow = bookingMessage || (roomsError ? { text: roomsError, type: 'error' } : null);

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
                message={messageToShow}
            />
        </div>
    );
};
