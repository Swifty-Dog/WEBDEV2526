import { useState, useEffect, useCallback } from 'react';
import { ApiGet } from '../../components/ApiRequest.tsx';
import { type Booking } from '../../utils/types.ts';
import { startGenericHub, onEvent } from '../../utils/signalR/genericHub';

export const useCurrentRoomBookings = () => {
    const token = localStorage.getItem('authToken');
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBookings = useCallback(async () => {
        if (!token) {
            setError('Je bent niet ingelogd.');
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
            setError(
                err instanceof Error
                    ? err.message
                    : 'Fout bij ophalen boekingen.'
            );
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        void fetchBookings();
        if (!token) return;

        startGenericHub();

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
