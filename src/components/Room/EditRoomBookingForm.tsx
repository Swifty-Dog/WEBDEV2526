import React, { useMemo, useCallback } from 'react';
import type {Booking, Room, BookingDetails} from '../../utils/types';
import { BookingForm } from './BookingForm';
import { useBookingFormLogic } from '../../hooks/Room/useBookingFormLogic';
import { useUpdateBooking } from '../../hooks/Room/useUpdateBooking';

type EditRoomBookingFormProps = {
    booking: Booking;
    rooms: Room[];
    onClose: () => void;
    onSave: (updatedBooking: Booking) => void;
};

export const EditRoomBookingForm: React.FC<EditRoomBookingFormProps> = ({booking, rooms, onClose, onSave}) => {

    const initialDetails = useMemo((): BookingDetails => {
        const roomId = rooms.find(r => r.roomName === booking.roomName)?.id;

        if (roomId === undefined) {
            console.error(`Kamer '${booking.roomName}' niet gevonden.`);
            return {...booking, roomId: 0};
        }

        return {
            bookingDate: booking.bookingDate,
            startTime: booking.startTime,
            endTime: booking.endTime,
            purpose: booking.purpose,
            roomId: roomId ?? 0,
        };
    }, [rooms, booking]);

    const {
        bookingDetails,
        message,
        setMessage,
        handleChange,
        availableStartTimes,
        availableEndTimes,
        roomIsFullMap,
        ...formProps
    } = useBookingFormLogic(
        rooms,
        initialDetails,
        booking.id
    );


    const onUpdate = (updatedBooking: Booking) => {
        onSave(updatedBooking);
    };

    const onUpdateError = useCallback((errorMessage: string) => {
        setMessage({text: errorMessage, type: 'error'});
    }, [setMessage]);

    const {updateBooking} = useUpdateBooking(() => {
    }, onUpdateError);

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        const updatedRoomName = rooms.find(r => r.id === bookingDetails.roomId)?.roomName || 'Onbekend';
        const updatedBooking: Booking = {...booking, ...bookingDetails, roomName: updatedRoomName};

        try {
            await updateBooking(updatedBooking);
            onUpdate(updatedBooking);
        } catch { /* */ }
    };

    return (
        <>
            <BookingForm
                {...formProps}
                rooms={rooms}
                bookingDetails={bookingDetails}
                onChange={handleChange}
                onSubmit={handleEditSubmit}
                message={message}
                fetchError={formProps.fetchError}
                loadingAvailability={formProps.loadingAvailability}
                availableStartTimes={availableStartTimes}
                availableEndTimes={availableEndTimes}
                roomIsFullMap={roomIsFullMap}
            />

            <div className="form-actions">
                <button className="btn-sm btn-secondary" onClick={onClose}>
                    Annuleren
                </button>
            </div>
        </>
    );
};
