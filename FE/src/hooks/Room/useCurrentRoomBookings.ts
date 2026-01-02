import { useState, useEffect, useCallback } from 'react';
import i18n from '../../utils/locales/i18n';
import { translateFetchError} from "../../utils/locales/translateFetchError";
import { ApiGet } from '../../config/ApiRequest.ts';
import { type Booking } from '../../utils/types';
import { startGenericHub, onEvent } from '../../utils/signalR/genericHub';

export const useCurrentRoomBookings = () => {
    const token = localStorage.getItem('authToken');
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBookings = useCallback(async () => {
        if (!token) {
            setError(i18n.t('general.errorNotLoggedIn'));
            setLoading(false);
            return;
        }

        try {
            const data = await ApiGet<Booking[]>(
                '/RoomBooking/Employee/current',
                { Authorization: `Bearer ${token}` }
            );

            data.sort(
                (a: Booking, b: Booking) =>
                    new Date(`${a.bookingDate}T${a.startTime}`).getTime() -
                    new Date(`${b.bookingDate}T${b.startTime}`).getTime()
            );

            setBookings(data);
            setError(null);
        } catch (err) {
            const errorMessage = translateFetchError(err as Error, 'rooms:roomBookingError.errorFetchUpcoming');
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        void fetchBookings();
        if (!token) return;

        startGenericHub().catch(err => console.error('Error starting SignalR hub for bookings:', err));

        const unsubscribe = onEvent("BookingChanged", () => {
            void fetchBookings();
        });

        return () => unsubscribe();
    }, [token, fetchBookings]);

    useEffect(() => {
        const interval = setInterval(() => setBookings(prev => [...prev]), 60000);
        return () => clearInterval(interval);
    }, []);

    return { bookings, loading, error };
};
