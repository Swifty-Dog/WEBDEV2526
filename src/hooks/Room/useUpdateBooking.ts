import { useCallback } from 'react';
import type { Booking } from '../../utils/types';
import { ApiPut } from '../../components/ApiRequest';

export const useUpdateBooking = (
    onSuccess: () => void,
    onError: (errorMessage: string) => void
) => {
    const updateBooking = useCallback(async (bookingToUpdate: Booking) => {
        try {
            console.log(bookingToUpdate);

            await ApiPut(`/RoomBooking/${bookingToUpdate.id}`, bookingToUpdate, {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            });
            onSuccess();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Kon boeking niet bijwerken.';
            onError(errorMessage);
        }
    }, [onSuccess, onError]);

    return { updateBooking };
};
