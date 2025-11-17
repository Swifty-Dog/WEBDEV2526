import { useEffect, useState, useCallback } from "react";
import type { DailyBookingWithRoom } from "../../utils/types.ts";
import { ApiGet } from "../../components/ApiRequest.tsx";
import { startGenericHub, onEvent, stopGenericHub } from "../../utils/signalR/genericHub";

export const useDailyBookings = (date: string | null) => {
    const [bookings, setBookings] = useState<DailyBookingWithRoom[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const token = localStorage.getItem("authToken");

    const fetchBookings = useCallback(async () => {
        if (!date) {
            setBookings([]);
            return;
        }

        setLoading(true);
        setError(null);

        if (!token) {
            setError("Je bent niet ingelogd.");
            setLoading(false);
            return;
        }

        try {
            const data = await ApiGet<DailyBookingWithRoom[]>(
                `/RoomBooking/date/${date}`,
                { Authorization: `Bearer ${token}` }
            );

            setBookings(
                data.map((b) => ({
                    id: b.id,
                    roomId: b.roomId,
                    startTime: b.startTime.substring(0, 5),
                    endTime: b.endTime.substring(0, 5),
                }))
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Kon beschikbaarheid niet ophalen."
            );
            setBookings([]);
        } finally {
            setLoading(false);
        }
    }, [date, token]);

    useEffect(() => {
        void fetchBookings();

        if (!token) return;

        startGenericHub();

        const unsubscribe = onEvent("BookingChanged", () => {
            void fetchBookings();
        });

        return () => {
            unsubscribe();
            stopGenericHub();
        };
    }, [token, fetchBookings]);

    return { bookings, loading, error };
};
