import React from 'react';
import type {Booking, DailyBookingWithRoom} from '../../utils/types';
import { useRooms } from '../../hooks/Room/useRooms';
import { EditRoomBookingForm } from './EditRoomBookingForm';
import { useCurrentRoomBookings } from '../../hooks/Room/useCurrentRoomBookings';

type EditRoomBookingModalProps = {
    booking: Booking;
    onClose: () => void;
    onSave: (updatedBooking: Booking) => void;
};

export const EditRoomBookingModal: React.FC<EditRoomBookingModalProps> = ({ booking, onClose, onSave }) => {
    const { rooms, loading: loadingRooms, error: roomsError } = useRooms();
    const { bookings: allDailyBookings } = useCurrentRoomBookings();

    const dailyBookings: DailyBookingWithRoom[] = allDailyBookings.map(b => {
        const room = rooms.find(r => r.roomName === b.roomName);
        if (!room) {
            console.warn(`Room '${b.roomName}' not found for booking ${b.id}`);
        }
        return {
            id: b.id,
            roomId: room?.id ?? 0,
            startTime: b.startTime,
            endTime: b.endTime,
        };
    });

    let content: React.ReactNode;
    if (loadingRooms) {
        content = <p>Kamers laden...</p>;
    } else if (roomsError) {
        content = <p className="error-message">{roomsError}</p>;
    } else {
        content = (
            <EditRoomBookingForm
                key={booking.id}
                booking={booking}
                rooms={rooms}
                allDailyBookings={dailyBookings}
                onClose={onClose}
                onSave={onSave}
            />
        );
    }

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h3 className="titling">Boeking bewerken</h3>
                {content}
            </div>
        </div>
    );
};
