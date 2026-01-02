import React from 'react';
import { useTranslation } from 'react-i18next';
import type {Booking} from '../../utils/types';
import { useRooms } from '../../hooks/Room/useRooms';
import { EditRoomBookingForm } from './EditRoomBookingForm';

type EditRoomBookingModalProps = {
    booking: Booking;
    onClose: () => void;
    onSave: (updatedBooking: Booking) => void;
};

export const EditRoomBookingModal: React.FC<EditRoomBookingModalProps> = ({ booking, onClose, onSave }) => {

    const { t } = useTranslation('rooms');

    const { rooms, loading: loadingRooms, error: roomsError } = useRooms();

    let content: React.ReactNode;
    if (loadingRooms) {
        content = <p>{t('newBooking.loadingRooms')}</p>;
    } else if (roomsError) {
        content = <p className="error-message">{roomsError}</p>;
    } else {
        content = (
            <EditRoomBookingForm
                key={booking.id}
                booking={booking}
                rooms={rooms}
                onClose={onClose}
                onSave={onSave}
            />
        );
    }

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h3 className="titling">{t('editModal.title')}</h3>
                {content}
            </div>
        </div>
    );
};
