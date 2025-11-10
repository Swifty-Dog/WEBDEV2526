import React, { useMemo, useState, useEffect } from 'react';
import { ApiRequest } from "./ApiRequest.tsx";

interface Room {
    id: number;
    roomName: string;
}

interface DailyBookingWithRoom {
    roomId: number;
    startTime: string;
    endTime: string;
}

interface BookingDetails {
    roomId: number;
    date: string;
    startTime: string;
    endTime: string;
    reason: string;
}

const allTimes: string[] = [];
for (let hour = 8; hour <= 18; hour++) {
    allTimes.push(`${String(hour).padStart(2, '0')}:00`);
    if (hour !== 18) allTimes.push(`${String(hour).padStart(2, '0')}:30`);
}

const getTodayDate = (): string => new Date().toISOString().split('T')[0];

const getNextDate = (): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
}

const getCurrentTime = (): string => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
};

const getInitialStartTime = (): string => {
    const current = getCurrentTime();
    return allTimes.find(time => time > current) || allTimes[0];
};

const getInitialBookingDate = (): string => {
    const currentTime = getCurrentTime();
    return currentTime >= '18:00' ? getNextDate() : getTodayDate();
};

const getInitialEndTime = (startTime: string): string => {
    const nextIndex = allTimes.indexOf(startTime) + 1;
    return allTimes[nextIndex] || allTimes[allTimes.length - 1];
};

export const NewRoomBooking: React.FC = () => {
    const token = localStorage.getItem('authToken');

    const [rooms, setRooms] = useState<Room[]>([]);
    const [loadingRooms, setLoadingRooms] = useState(true);
    const [fetchError, setFetchError] = useState(false);

    const [allDailyBookings, setAllDailyBookings] = useState<DailyBookingWithRoom[]>([]);
    const [loadingAvailability, setLoadingAvailability] = useState(false);

    const [message, setMessage] = useState<{ text: string | null; type: 'success' | 'error' } | null>(null);

    const [bookingDetails, setBookingDetails] = useState<BookingDetails>(() => {
        const initialDate: string = getInitialBookingDate();
        const initialStart: string = getInitialStartTime();
        return {
            roomId: 0,
            date: initialDate,
            startTime: initialStart,
            endTime: getInitialEndTime(initialStart),
            reason: '',
        };
    });

    useEffect(() => {
        const fetchRooms = async () => {
            if (!token) {
                setMessage({ text: 'Je bent niet ingelogd.', type: 'error' });
                setLoadingRooms(false);
                setFetchError(true);
                return;
            }

            try {
                const data: Room[] = await ApiRequest<Room[]>(
                    'http://localhost:5222/api/Room',
                    'GET',
                    null,
                    { Authorization: `Bearer ${token}` }
                );
                setRooms(data);
            } catch {
                setMessage({ text: 'Kon kamers niet ophalen van de server.', type: 'error' });
                setFetchError(true);
            } finally {
                setLoadingRooms(false);
            }
        };
        fetchRooms();
    }, [token]);

    useEffect(() => {
        const fetchAvailabilityForDate = async () => {
            if (!token || !bookingDetails.date) {
                setAllDailyBookings([]);
                return;
            }

            setLoadingAvailability(true);
            setMessage(null);
            try {
                const data = await ApiRequest<{ roomId: number; startTime: string; endTime: string }[]>(
                    `http://localhost:5222/api/RoomBooking/date/${bookingDetails.date}`,
                    'GET',
                    null,
                    { Authorization: `Bearer ${token}` }
                );

                const formattedData: DailyBookingWithRoom[] = data.map(b => ({
                    roomId: b.roomId,
                    startTime: b.startTime.substring(0, 5),
                    endTime: b.endTime.substring(0, 5),
                }));

                setAllDailyBookings(formattedData);
            } catch {
                setMessage({ text: 'Kon de beschikbaarheid van de kamers niet controleren.', type: 'error' });
                setAllDailyBookings([]);
            } finally {
                setLoadingAvailability(false);
            }
        };

        fetchAvailabilityForDate();
    }, [bookingDetails.date, token]);

    const roomBookingMap = useMemo(() => {
        const map = new Map<number, Set<string>>();

        for (const booking of allDailyBookings) {
            if (!map.has(booking.roomId)) {
                map.set(booking.roomId, new Set<string>());
            }
            const roomSet = map.get(booking.roomId)!;

            for (const time of allTimes) {
                if (time >= booking.startTime && time < booking.endTime) {
                    roomSet.add(time);
                }
            }
        }
        return map;
    }, [allDailyBookings]);

    const roomIsFullMap = useMemo(() => {
        const map = new Map<number, boolean>();
        const today = getTodayDate();
        const current = getCurrentTime();

        const baseTimes = bookingDetails.date > today
            ? allTimes
            : allTimes.filter(time => time >= current);

        for (const room of rooms) {
            const bookedSlots = roomBookingMap.get(room.id) || new Set<string>();

            const availableStartSlots = baseTimes
                .filter(time => !bookedSlots.has(time))
                .slice(0, -1);

            map.set(room.id, availableStartSlots.length === 0);
        }
        return map;
    }, [rooms, roomBookingMap, bookingDetails.date]);

    useEffect(() => {
        if (loadingAvailability || rooms.length === 0) return;

        const currentRoomIsInvalid = bookingDetails.roomId === 0 || roomIsFullMap.get(bookingDetails.roomId);

        if (currentRoomIsInvalid) {
            const firstAvailableRoom = rooms.find(room => !roomIsFullMap.get(room.id));

            if (firstAvailableRoom) {
                setBookingDetails(prev => ({
                    ...prev,
                    roomId: firstAvailableRoom.id
                }));
            } else {
                setBookingDetails(prev => ({ ...prev, roomId: 0 }));
            }
        }
    }, [roomIsFullMap, rooms, loadingAvailability, bookingDetails.roomId]);

    const currentRoomBookings = useMemo(() => {
        return allDailyBookings.filter(b => b.roomId === bookingDetails.roomId);
    }, [allDailyBookings, bookingDetails.roomId]);

    const bookedTimesSet = useMemo(() => {
        const set = new Set<string>();
        if (!currentRoomBookings.length) return set;

        for (const booking of currentRoomBookings) {
            for (const time of allTimes) {
                if (time >= booking.startTime && time < booking.endTime) {
                    set.add(time);
                }
            }
        }
        return set;
    }, [currentRoomBookings]);

    const availableStartTimes = useMemo(() => {
        const today = getTodayDate();
        const current = getCurrentTime();

        const baseTimes = bookingDetails.date > today
            ? allTimes
            : allTimes.filter(time => time >= current);

        return baseTimes
            .filter(time => !bookedTimesSet.has(time))
            .slice(0, -1);

    }, [bookingDetails.date, bookedTimesSet]);

    const availableEndTimes = useMemo(() => {
        const potentialEndTimes = allTimes.filter(time => time > bookingDetails.startTime);

        const validEndTimes: string[] = [];
        for (const endTime of potentialEndTimes) {
            let hasConflict: boolean = false;
            for (const timeSlot of allTimes) {
                if (timeSlot >= bookingDetails.startTime && timeSlot < endTime) {
                    if (bookedTimesSet.has(timeSlot)) {
                        hasConflict = true;
                        break;
                    }
                }
            }
            if (hasConflict) break;
            validEndTimes.push(endTime);
        }
        return validEndTimes;
    }, [bookingDetails.startTime, bookedTimesSet]);

    useEffect(() => {
        if (availableStartTimes.length > 0 && !availableStartTimes.includes(bookingDetails.startTime)) {
            setBookingDetails(prev => ({
                ...prev,
                startTime: availableStartTimes[0],
            }));
        }
    }, [availableStartTimes, bookingDetails.startTime]);

    useEffect(() => {
        if (availableEndTimes.length > 0 && !availableEndTimes.includes(bookingDetails.endTime)) {
            setBookingDetails(prev => ({
                ...prev,
                endTime: availableEndTimes[0],
            }));
        }
    }, [availableEndTimes, bookingDetails.endTime]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setBookingDetails(prev => ({
            ...prev,
            [name]: name === 'roomId' ? Number(value) : value,
        }));
        setMessage(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (!availableEndTimes.includes(bookingDetails.endTime) || !availableStartTimes.includes(bookingDetails.startTime)) {
            setMessage({ text: 'De geselecteerde tijden zijn niet (meer) geldig.', type: 'error' });
            return;
        }

        const requestBody = {
            roomId: Number(bookingDetails.roomId),
            bookingDate: bookingDetails.date,
            startTime: bookingDetails.startTime,
            endTime: bookingDetails.endTime,
            purpose: bookingDetails.reason,
        };

        try {
            await ApiRequest(
                'http://localhost:5222/api/RoomBooking',
                'POST',
                requestBody,
                { Authorization: `Bearer ${token}` }
            );

            setMessage({ text: 'Kamer succesvol gereserveerd!', type: 'success' });

            const newBooking: DailyBookingWithRoom = {
                roomId: requestBody.roomId,
                startTime: requestBody.startTime,
                endTime: requestBody.endTime
            };
            setAllDailyBookings(prev => [...prev, newBooking].sort((a, b) => a.startTime.localeCompare(b.startTime)));

            const currentBookedSet = new Set<string>();
            for (const b of currentRoomBookings) {
                for (const time of allTimes) {
                    if (time >= b.startTime && time < b.endTime) currentBookedSet.add(time);
                }
            }
            for (const time of allTimes) {
                if (time >= newBooking.startTime && time < newBooking.endTime) currentBookedSet.add(time);
            }

            const baseTimes = bookingDetails.date > getTodayDate() ? allTimes : allTimes.filter(t => t >= getCurrentTime());
            const nextAvailableStart = baseTimes
                .filter(time => !currentBookedSet.has(time))
                .find(time => time >= requestBody.endTime);

            setBookingDetails(prev => {
                const nextStart = nextAvailableStart || getInitialStartTime();
                return {
                    ...prev,
                    startTime: nextStart,
                    endTime: getInitialEndTime(nextStart),
                    reason: '',
                };
            });

            setTimeout(() => setMessage(null), 5000);
        } catch (error) {
            if (error instanceof Error) {
                setMessage({ text: error.message, type: 'error' });
            } else {
                setMessage({ text: 'Kan geen verbinding maken met de server.', type: 'error' });
            }
        }
    };

    if (loadingRooms) {
        return <p>Kamers laden...</p>;
    }

    const timesAreDisabled = loadingAvailability || fetchError || availableStartTimes.length === 0 || bookingDetails.roomId === 0;
    const formIsDisabled = fetchError || loadingAvailability;
    const noRoomsAvailable = rooms.every(room => roomIsFullMap.get(room.id));

    return (
        <div className="section-card vertical-flex-card">
            <h2 className="titling">Nieuwe Boeking Maken</h2>

            <form onSubmit={handleSubmit} className="form-container">
                <div className="form-fields">
                    <div className="form-row">
                        <label htmlFor="date">Boekingsdatum</label>
                        <input
                            id="date"
                            name="date"
                            type="date"
                            className="booking-input"
                            value={bookingDetails.date}
                            onChange={handleChange}
                            min={getCurrentTime() >= '18:00' ? getNextDate() : getTodayDate()}
                            required
                            disabled={fetchError}
                        />
                    </div>

                    <div className="form-row">
                        <label htmlFor="roomId">Kamer</label>
                        <select
                            id="roomId"
                            name="roomId"
                            className="booking-input"
                            value={bookingDetails.roomId}
                            onChange={handleChange}
                            required
                            disabled={formIsDisabled}
                        >
                            <option value={0} disabled>
                                {loadingAvailability ? "Beschikbaarheid laden..." : "Selecteer een kamer"}
                            </option>

                            {!loadingAvailability && rooms.map(room => {
                                const isFull = roomIsFullMap.get(room.id) || false;
                                return (
                                    <option key={room.id} value={room.id} disabled={isFull}>
                                        {room.roomName} {isFull ? "(Vol)" : ""}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    <div className="form-row">
                        <label htmlFor="startTime">Starttijd</label>
                        <select
                            id="startTime"
                            name="startTime"
                            className="booking-input"
                            value={bookingDetails.startTime}
                            onChange={handleChange}
                            required
                            disabled={timesAreDisabled}
                        >
                            {loadingAvailability && <option>Laden...</option>}
                            {!loadingAvailability && noRoomsAvailable && <option>Alle kamers vol</option>}
                            {!loadingAvailability && bookingDetails.roomId === 0 && <option>Selecteer kamer</option>}
                            {!loadingAvailability && bookingDetails.roomId !== 0 && availableStartTimes.length === 0 && <option>Geen tijden beschikbaar</option>}

                            {availableStartTimes.map(time => (
                                <option key={time} value={time}>{time}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-row">
                        <label htmlFor="endTime">Eindtijd</label>
                        <select
                            id="endTime"
                            name="endTime"
                            className="booking-input"
                            value={bookingDetails.endTime}
                            onChange={handleChange}
                            required
                            disabled={timesAreDisabled || availableEndTimes.length === 0}
                        >
                            {loadingAvailability && <option>Laden...</option>}
                            {!loadingAvailability && availableEndTimes.length === 0 && <option>Selecteer starttijd</option>}

                            {availableEndTimes.map(time => (
                                <option key={time} value={time}>{time}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-row">
                        <label htmlFor="reason">Reden</label>
                        <input
                            id="reason"
                            name="reason"
                            type="text"
                            className="booking-input"
                            placeholder="Kort overleg, presentatie..."
                            value={bookingDetails.reason}
                            onChange={handleChange}
                            required
                            disabled={formIsDisabled || bookingDetails.roomId === 0}
                        />
                    </div>
                </div>

                <div className="form-footer">
                    {message?.text && (
                        <p className={message.type === 'error' ? 'error-message' : 'success-message'}>
                            {message.text}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="button-secondary full-width-button"
                        disabled={formIsDisabled || availableEndTimes.length === 0 || bookingDetails.roomId === 0}
                    >
                        {loadingAvailability ? "Beschikbaarheid controleren..." : "Reserveer kamer"}
                    </button>
                </div>
            </form>
        </div>
    );
};
