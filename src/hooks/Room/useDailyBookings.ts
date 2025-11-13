import {useEffect, useState} from "react";
import type { DailyBookingWithRoom } from "../../utils/types.ts";
import { ApiGet } from "../../components/ApiRequest.tsx";

export const useDailyBookings = (date: string | null) => {
    const [bookings, setBookings] = useState<DailyBookingWithRoom[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!date) {
            setBookings([]);
            return;
        }

        (async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await ApiGet<DailyBookingWithRoom[]>(`/RoomBooking/date/${date}`, { Authorization: `Bearer ${localStorage.getItem('authToken')}` });
                setBookings(data.map(b => ({
                    id: b.id,
                    roomId: b.roomId,
                    startTime: b.startTime.substring(0, 5),
                    endTime: b.endTime.substring(0, 5),
                })));
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Kon beschikbaarheid niet ophalen.');
                setBookings([]);
            } finally {
                setLoading(false);
            }
        })();
    }, [date]);

    return { bookings, loading, error };
};
