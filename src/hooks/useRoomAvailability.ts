import { useMemo } from 'react';
import type { Room, DailyBookingWithRoom } from '../utils/types';
import { allTimes } from '../utils/time';
import { getTodayDate } from '../utils/date';
import { getCurrentTime } from '../utils/time';

export const useRoomAvailability = (
    rooms: Room[],
    allDailyBookings: DailyBookingWithRoom[],
    selectedDate: string,
    selectedStartTime: string,
    selectedRoomId: number) => {
    const roomBookingMap = useMemo(() => {
        const map = new Map<number, Set<string>>();

        for (const booking of allDailyBookings) {
            if (!map.has(booking.roomId))
                map.set(booking.roomId, new Set());

            const set = map.get(booking.roomId)!;

            for (const time of allTimes) {
                if (time >= booking.startTime && time < booking.endTime) set.add(time);
            }
        }
        return map;
    }, [allDailyBookings]);

    const roomIsFullMap = useMemo(() => {
        const map = new Map<number, boolean>();
        const today = getTodayDate();
        const current = getCurrentTime();
        const baseTimes = selectedDate > today ? allTimes : allTimes.filter(time => time >= current);

        for (const room of rooms) {
            const bookedSlots = roomBookingMap.get(room.id) || new Set();
            const availableStartSlots = baseTimes.filter(time => !bookedSlots.has(time)).slice(0, -1);
            map.set(room.id, availableStartSlots.length === 0);
        }
        return map;
    }, [rooms, roomBookingMap, selectedDate]);

    const availableStartTimes = useMemo(() => {
        const today = getTodayDate();
        const current = getCurrentTime();
        const baseTimes = selectedDate > today ? allTimes : allTimes.filter(time => time >= current);
        const booked = roomBookingMap.get(selectedRoomId) || new Set();
        return baseTimes.filter(time => !booked.has(time)).slice(0, -1);
    }, [selectedRoomId, roomBookingMap, selectedDate]);

    const availableEndTimes = useMemo(() => {
        if (!selectedStartTime) return [];
        const booked = roomBookingMap.get(selectedRoomId) || new Set();
        const potentialEndTimes = allTimes.filter(time => time > selectedStartTime);
        const validEndTimes: string[] = [];

        for (const endTime of potentialEndTimes) {
            let conflict = false;
            for (const t of allTimes) {
                if (t >= selectedStartTime && t < endTime && booked.has(t)) {
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
