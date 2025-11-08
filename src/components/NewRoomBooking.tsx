import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from "./UseAuth.tsx";

const getTodayDate = () => new Date().toISOString().split('T')[0];
const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
};

// Generate times from 08:00 to 18:30
const allTimes: string[] = [];
for (let hour = 8; hour <= 18; hour++) {
    allTimes.push(`${String(hour).padStart(2, '0')}:00`);
    if (hour !== 18) allTimes.push(`${String(hour).padStart(2, '0')}:30`);
}
const initialStartTime = allTimes.find(time => time > getCurrentTime()) || '08:00';

export const NewRoomBooking: React.FC = () => {
    const { employeeId } = useAuth();
    const token = localStorage.getItem('authToken');

    const [rooms, setRooms] = useState<{ id: number; roomName: string }[]>([]);
    const [loadingRooms, setLoadingRooms] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [bookingDetails, setBookingDetails] = useState({
        roomId: 0,
        date: getTodayDate(),
        startTime: initialStartTime,
        endTime: allTimes[allTimes.indexOf(initialStartTime) + 1] || allTimes[allTimes.length - 1],
        reason: '',
    });

    // Fetch rooms
    useEffect(() => {
        const fetchRooms = async () => {
            if (!token) {
                setErrorMessage('Je bent niet ingelogd.');
                setLoadingRooms(false);
                return;
            }

            try {
                const response = await fetch('http://localhost:5222/api/Room', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (!response.ok) throw new Error('Kon kamers niet ophalen');

                const data = await response.json();
                setRooms(data);
                setBookingDetails(prev => ({ ...prev, roomId: data[0]?.id || 0 }));
            } catch (error) {
                console.error('Fout bij ophalen kamers:', error);
                setErrorMessage('Kon kamers niet ophalen van de server.');
            } finally {
                setLoadingRooms(false);
            }
        };

        fetchRooms();
    }, [token]);

    // Compute available times
    const availableTimes = useMemo(() => {
        const today = getTodayDate();
        const current = getCurrentTime();
        if (bookingDetails.date > today) return allTimes;
        return allTimes.filter(time => time >= current);
    }, [bookingDetails.date]);

    const startTimesList = useMemo(() => availableTimes.slice(0, -1), [availableTimes]);
    const endTimesList = useMemo(
        () => availableTimes.filter(time => time > bookingDetails.startTime),
        [availableTimes, bookingDetails.startTime]
    );

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        setBookingDetails({
            ...bookingDetails,
            [e.target.name]: e.target.value,
        });
        setErrorMessage(null); // clear errors on edit
    };

    // Submit booking
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        if (!employeeId || !token) {
            setErrorMessage('Je bent niet ingelogd.');
            return;
        }

        if (bookingDetails.startTime >= bookingDetails.endTime) {
            setErrorMessage('De eindtijd moet na de starttijd liggen.');
            return;
        }

        const requestBody = {
            roomId: bookingDetails.roomId,
            employeeId,
            bookingDate: bookingDetails.date,
            startTime: bookingDetails.startTime,
            endTime: bookingDetails.endTime,
            purpose: bookingDetails.reason,
        };

        try {
            const response = await fetch('http://localhost:5222/api/RoomBooking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(requestBody),
            });

            if (response.status === 201) {
                setErrorMessage(null);
                alert('Kamer succesvol gereserveerd!');
            } else {
                const data = await response.json();
                setErrorMessage(data.message || 'Er is een fout opgetreden.');
            }
        } catch (error) {
            console.error('Booking error:', error);
            setErrorMessage('Kan geen verbinding maken met de server.');
        }
    };

    if (loadingRooms) return <p>Kamers laden...</p>;

    return (
        <div className="section-card vertical-flex-card">
            <h2 className="titling">Nieuwe Boeking Maken</h2>

            <form onSubmit={handleSubmit} className="form-container">
                <div className="form-fields">
                    <div className="form-row">
                        <label htmlFor="roomId">Naam kamer</label>
                        <select
                            id="roomId"
                            name="roomId"
                            className="booking-input"
                            value={bookingDetails.roomId}
                            onChange={handleChange}
                            required
                        >
                            {rooms.map(room => (
                                <option key={room.id} value={room.id}>
                                    {room.roomName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-row">
                        <label htmlFor="date">Boekingsdatum</label>
                        <input
                            id="date"
                            name="date"
                            type="date"
                            className="booking-input"
                            value={bookingDetails.date}
                            onChange={handleChange}
                            min={getTodayDate()}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <label htmlFor="startTime">Starttijd</label>
                        <select
                            id="startTime"
                            name="startTime"
                            className="booking-input"
                            value={bookingDetails.startTime}
                            onChange={handleChange}
                        >
                            {startTimesList.map(time => (
                                <option key={time} value={time}>
                                    {time}
                                </option>
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
                        >
                            {endTimesList.map(time => (
                                <option key={time} value={time}>
                                    {time}
                                </option>
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
                        />
                    </div>
                </div>

                <div className="form-footer">
                    {errorMessage && <p className="error-message">{errorMessage}</p>}

                    <button type="submit" className="button-secondary full-width-button">
                        Reserveer kamer
                    </button>
                </div>
            </form>
        </div>
    );
};
