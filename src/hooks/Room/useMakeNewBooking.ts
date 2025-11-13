import { useCallback } from 'react';
import type { BookingDetails } from '../../utils/types.ts';
import { ApiPost } from '../../components/ApiRequest.tsx';

export const useMakeNewBooking = (
    bookingDetails: BookingDetails,
    onSuccess: () => void,
    onError: (errorMessage: string) => void
) => {
    const makeBooking = useCallback(async () => {
        try {
            await ApiPost('/RoomBooking', bookingDetails, {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            });
            onSuccess();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Kon boeking niet maken.';
            onError(errorMessage);
        }
    }, [bookingDetails, onSuccess, onError]);

    return { makeBooking };
};
