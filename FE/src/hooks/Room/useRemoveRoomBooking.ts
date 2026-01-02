import { useCallback } from 'react';
import { translateFetchError } from "../../utils/locales/translateFetchError";
import { ApiDelete } from '../../config/ApiRequest.ts';

export const useDeleteBooking = (
    onSuccess: () => void,
    onError: (errorMessage: string) => void
) => {
    const deleteBooking = useCallback(async (bookingId: number) => {
        try {
                await ApiDelete(`/RoomBooking/${bookingId}`, {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            });
            onSuccess();
        } catch (err) {
            const errorMessage = translateFetchError(err as Error, 'rooms:roomBookingError.errorDelete');
            onError(errorMessage);
        }
    }, [onSuccess, onError]);

    return { deleteBooking };
};
