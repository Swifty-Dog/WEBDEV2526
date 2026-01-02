import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Room } from '../../utils/types';
import { BookingForm } from '../Room/BookingForm';
import { useRooms } from '../../hooks/Room/useRooms.ts';
import { useMakeNewBooking } from '../../hooks/Room/useMakeNewBooking.ts';
import { useBookingFormLogic } from '../../hooks/Room/useBookingFormLogic.ts';
import { getInitialBookingDate } from '../../utils/date';
import '../../styles/_components.css';

export const EventRoom: React.FC<{
    onCancel?: () => void;
    onRoomSelected?: (room: Room) => void;
}> = ({ onCancel, onRoomSelected }) => {

    const { t } = useTranslation('rooms');
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
    } = useBookingFormLogic(rooms, initialBookingDetails);


    const handleRoomSelect = (roomId: number) => {
        const room = rooms.find(r => r.id === roomId);
        if (!room) return;

        setBookingDetails(prev => ({ ...prev, roomId }));
        onRoomSelected?.(room);
    };

    useEffect(() => {
        if (bookingDetails.endTime && !availableEndTimes.includes(bookingDetails.endTime)) {
            setBookingDetails(prev => ({ ...prev, endTime: '' }));
        }
    }, [availableEndTimes, bookingDetails.endTime, setBookingDetails]);

    const onBookingSuccess = useCallback(() => {
        setMessage({ text: t('newBooking.messageSuccess'), type: 'success' });
        setBookingDetails(initialBookingDetails);
    }, [setMessage, setBookingDetails, initialBookingDetails, t]);

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

    if (loadingRooms) return <p>{t('newBooking.loadingRooms')}</p>;

    const messageToShow = message || (roomsError ? { text: roomsError, type: 'error' } : null);

    const hasError = formProps.fetchError || !!roomsError;
    const isLoading = formProps.loadingAvailability || loadingRooms;

    return (
        <div className="section-card vertical-flex-card">
            <h2 className="titling">{t('newBooking.title')}</h2>

            <BookingForm
                {...formProps}
                rooms={rooms}
                bookingDetails={bookingDetails}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onRoomSelect={handleRoomSelect}
                message={messageToShow}
                fetchError={hasError}
                loadingAvailability={isLoading}
                availableStartTimes={availableStartTimes}
                availableEndTimes={availableEndTimes}
                roomIsFullMap={roomIsFullMap}
            />

            {onCancel && (
                <button
                    type="button"
                    className="btn-sm btn-cancel-margin"
                    onClick={onCancel}
                >
                    {t('common:general.buttonCancel')}
                </button>
            )}

        </div>
    );
};

