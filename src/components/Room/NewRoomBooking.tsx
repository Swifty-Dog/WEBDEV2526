import React, { useCallback, useEffect, useMemo } from 'react';
import { BookingForm } from './BookingForm';
import { useRooms } from '../../hooks/Room/useRooms.ts';
import { useMakeNewBooking } from '../../hooks/Room/useMakeNewBooking.ts';
import { useBookingFormLogic } from '../../hooks/Room/useBookingFormLogic.ts';
import { getInitialBookingDate } from '../../utils/date';

export const NewRoomBooking: React.FC = () => {
    const { rooms, loading: loadingRooms, error: roomsError } = useRooms();

    const initialBookingDetails = useMemo(() => ({
        roomId: 0,
        bookingDate: getInitialBookingDate(),
        startTime: '',
        endTime: '',
        purpose: '',
    }), []);

    const {
        bookingDetails,
        setBookingDetails,
        message,
        setMessage,
        handleChange,
        availableStartTimes,
        availableEndTimes,
        roomIsFullMap,
        ...formProps
    } = useBookingFormLogic(
        rooms,
        initialBookingDetails
    );

    useEffect(() => {
        if (bookingDetails.endTime && !availableEndTimes.includes(bookingDetails.endTime)) {
            setBookingDetails(prev => ({
                ...prev,
                endTime: ''
            }));
        }
    }, [availableEndTimes, bookingDetails.endTime, setBookingDetails]);

    const onBookingSuccess = useCallback(() => {
        setMessage({ text: 'Boeking succesvol gemaakt!', type: 'success' });
        setBookingDetails(initialBookingDetails);
    }, [setMessage, setBookingDetails, initialBookingDetails]);

    const onBookingError = useCallback((errorMessage: string) => {
        setMessage({ text: errorMessage, type: 'error' });
    }, [setMessage]);

    const { makeBooking } = useMakeNewBooking(
        bookingDetails,
        onBookingSuccess,
        onBookingError
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        void makeBooking();
    };

    if (loadingRooms) return <p>Kamers laden...</p>;

    const messageToShow = message || (roomsError ? { text: roomsError, type: 'error' } : null);
    const hasError = formProps.fetchError || !!roomsError;
    const isLoading = formProps.loadingAvailability || loadingRooms;

    return (
        <div className="section-card vertical-flex-card">
            <h2 className="titling">Nieuwe Boeking Maken</h2>
            <BookingForm
                {...formProps}
                rooms={rooms}
                bookingDetails={bookingDetails}
                onChange={handleChange}
                onSubmit={handleSubmit}
                message={messageToShow}
                fetchError={hasError}
                loadingAvailability={isLoading}
                availableStartTimes={availableStartTimes}
                availableEndTimes={availableEndTimes}
                roomIsFullMap={roomIsFullMap}
            />
        </div>
    );
};
