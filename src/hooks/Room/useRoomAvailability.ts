import { useMemo } from 'react';
import type { Room, DailyBookingWithRoom } from '../../utils/types.ts';
import { allTimes } from '../../utils/time.ts';
import { getTodayDate } from '../../utils/date.ts';
import { getCurrentTime } from '../../utils/time.ts';

export const useRoomAvailability = (
    rooms: Room[],
    allDailyBookings: DailyBookingWithRoom[],
    selectedDate: string,
    selectedStartTime: string,
    selectedRoomId: number,
    editingBookingId?: number | null
) => {
    const roomBookingMap = useMemo(() => {
        const map = new Map<number, Set<string>>();

        const bookingsToUse = editingBookingId
            ? allDailyBookings.filter(b => Number(b.id) !== Number(editingBookingId))
            : allDailyBookings;

        for (const booking of bookingsToUse) {
            if (!map.has(booking.roomId)) map.set(booking.roomId, new Set());
            const set = map.get(booking.roomId)!;
            for (const time of allTimes) {
                if (time >= booking.startTime && time < booking.endTime) set.add(time);
            }
        }
        return map;
    }, [allDailyBookings, editingBookingId]);

    const roomIsFullMap = useMemo(() => {
        const map = new Map<number, boolean>();
        const today = getTodayDate();
        const current = getCurrentTime();

        const allPossibleStartTimes = allTimes.slice(0, -1);

        for (const room of rooms) {
            const bookedSlots = roomBookingMap.get(room.id) || new Set();

            let availableSlots = allPossibleStartTimes.filter(time => !bookedSlots.has(time));

            if (!editingBookingId && selectedDate === today) {
                availableSlots = availableSlots.filter(time => time >= current);
            }

            map.set(room.id, availableSlots.length === 0);
        }
        return map;
    }, [rooms, roomBookingMap, selectedDate, editingBookingId]);

    const availableStartTimes = useMemo(() => {
        const today = getTodayDate();
        const current = getCurrentTime();

        const allPossibleStartTimes = allTimes.slice(0, -1);

        const bookedByOthers = roomBookingMap.get(selectedRoomId) || new Set();
        let availableTimes = allPossibleStartTimes.filter(time => !bookedByOthers.has(time));

        if (!editingBookingId && selectedDate === today) {
            availableTimes = availableTimes.filter(time => time >= current);
        }

        return availableTimes;

    }, [selectedRoomId, roomBookingMap, selectedDate, editingBookingId]);

    const availableEndTimes = useMemo(() => {
        if (!selectedStartTime) return [];

        const bookedByOthers = roomBookingMap.get(selectedRoomId) || new Set();
        const potentialEndTimes = allTimes.filter(time => time > selectedStartTime);
        const validEndTimes: string[] = [];

        for (const endTime of potentialEndTimes) {
            let conflict = false;
            for (const t of allTimes) {
                if (t >= selectedStartTime && t < endTime && bookedByOthers.has(t)) {
                    conflict = true;
                    break;
                }
            }
            if (conflict) break;
            validEndTimes.push(endTime);
        }

        return validEndTimes;
    }, [selectedStartTime, selectedRoomId, roomBookingMap]);

    return { roomIsFullMap, availableStartTimes, availableEndTimes };
};
