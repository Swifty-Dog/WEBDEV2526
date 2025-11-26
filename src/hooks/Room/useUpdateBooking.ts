import { useCallback } from 'react';
import { translateFetchError } from '../../utils/locales/translateFetchError';
import type { Booking } from '../../utils/types';
import { ApiPut } from '../../components/ApiRequest';

export const useUpdateBooking = (
    onSuccess: () => void,
    onError: (errorMessage: string) => void
) => {
    const updateBooking = useCallback(async (bookingToUpdate: Booking) => {
        try {
            await ApiPut(`/RoomBooking/${bookingToUpdate.id}`, bookingToUpdate, {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            });
            onSuccess();
        } catch (err) {
            const errorMessage = translateFetchError(err as Error, 'rooms:roomBookingError.errorUpdate');
            onError(errorMessage);
        }
    }, [onSuccess, onError]);

    return { updateBooking };
};
