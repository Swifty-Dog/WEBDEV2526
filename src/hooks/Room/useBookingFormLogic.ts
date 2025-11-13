import React, { useState, useCallback, useEffect } from 'react';
import type { BookingDetails, Room } from '../../utils/types.ts';
import { useDailyBookings } from './useDailyBookings.ts';
import { useRoomAvailability } from './useRoomAvailability.ts';
import { getInitialBookingDate } from '../../utils/date.ts';
import { getInitialStartTime, getInitialEndTime } from '../../utils/time.ts';

type BookingMessage = {
    text: string;
    type: 'success' | 'error';
};

const initialDetails: BookingDetails = {
    roomId: 0,
    bookingDate: getInitialBookingDate(),
    startTime: getInitialStartTime(),
    endTime: getInitialEndTime(getInitialStartTime()),
    purpose: '',
};

export const useBookingFormLogic = (
    rooms: Room[],
    initialData?: Partial<BookingDetails>,
    editingBookingId?: number | null
) => {
    const [bookingDetails, setBookingDetails] = useState<BookingDetails>({
        ...initialDetails,
        ...initialData,
    });

    const [message, setMessage] = useState<BookingMessage | null>(null);

    const {
        bookings: allDailyBookings,
        loading: loadingAvailability,
        error: availabilityError
    } = useDailyBookings(bookingDetails.bookingDate);

    const { roomIsFullMap, availableStartTimes, availableEndTimes } = useRoomAvailability(
        rooms,
        allDailyBookings,
        bookingDetails.bookingDate,
        bookingDetails.startTime,
        bookingDetails.roomId,
        editingBookingId
    );

    useEffect(() => {
        if (bookingDetails.endTime && !availableEndTimes.includes(bookingDetails.endTime)) {
            setBookingDetails(prev => ({
                ...prev,
                endTime: ''
            }));
        }
    }, [availableEndTimes, bookingDetails.endTime, setBookingDetails]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (message) {
            setMessage(null);
        }
        const { name, value } = e.target;

        if (name === 'bookingDate') {
            const defaultStart = getInitialStartTime(); // Jouw logica
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
    }, [message]);

    useEffect(() => {
        if (initialData) {
            setBookingDetails(prev => ({ ...prev, ...initialData }));
        }
    }, [initialData]);

    const messageToShow = message || (availabilityError ? { text: availabilityError, type: 'error' } : null);

    return {
        bookingDetails,
        setBookingDetails,
        message: messageToShow,
        setMessage,
        handleChange,

        availableStartTimes,
        availableEndTimes,
        roomIsFullMap,
        loadingAvailability,
        fetchError: !!availabilityError,
    };
};
