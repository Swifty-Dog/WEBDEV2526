import { useCallback } from 'react';
import { translateFetchError } from "../../utils/locales/translateFetchError";
import type { BookingDetails } from '../../utils/types.ts';
import { ApiPost } from '../../config/ApiRequest.ts';

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
            const errorMessage = translateFetchError(err as Error, 'rooms:roomBookingError.errorCreate');
            onError(errorMessage);
        }
    }, [bookingDetails, onSuccess, onError]);

    return { makeBooking };
};
