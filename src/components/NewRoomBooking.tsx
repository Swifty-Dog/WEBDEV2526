import React, {useMemo, useState} from 'react';

const mockRooms: string[] = ['Kamer 1A', 'Kamer 1B', 'Kamer 2A', 'Kamer 2B', 'Kamer 3A'];
const mockTimes: string[] = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
};

const getCurrentTime = (): string => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
};

export const NewRoomBooking: React.FC = () => {
    const initialStartTime: string = mockTimes.find(time => time > getCurrentTime()) || mockTimes[0];

    const [bookingDetails, setBookingDetails] = useState({
        roomName: mockRooms[0],
        date: getTodayDate(),
        startTime: initialStartTime,
        endTime: mockTimes[mockTimes.indexOf(initialStartTime) + 1] || mockTimes[mockTimes.length - 1],
        reason: '',
    });

    const availableTimes: string[] = useMemo(() => {
        const todayDate = getTodayDate();
        const currentTime = getCurrentTime();

        if (bookingDetails.date > todayDate) {
            return mockTimes;
        }

        return mockTimes.filter(time => time >= currentTime);
    }, [bookingDetails.date]);

    const startTimesList: string[] = useMemo(() => {
        return availableTimes.slice(0, -1);
    }, [availableTimes]);

    const endTimesList: string[] = useMemo(() => {
        return availableTimes.filter(time => time > bookingDetails.startTime);
    }, [availableTimes, bookingDetails.startTime]);

    React.useEffect(() => {
        if (!startTimesList.includes(bookingDetails.startTime)) {
            const newStartTime = startTimesList[0] || '';

            let newEndTime = mockTimes[mockTimes.indexOf(newStartTime) + 1] || mockTimes[mockTimes.length - 1];

            if (!endTimesList.includes(newEndTime)) {
                newEndTime = endTimesList[0] || '';
            }

            setBookingDetails(prev => ({
                ...prev,
                startTime: newStartTime,
                endTime: newEndTime,
            }));
        }
    }, [bookingDetails.startTime, endTimesList, startTimesList]);

    React.useEffect(() => {
        if (bookingDetails.startTime >= bookingDetails.endTime) {
            const newEndTime = endTimesList[0] || mockTimes[mockTimes.length - 1];
            setBookingDetails(prev => ({
                ...prev,
                endTime: newEndTime,
            }));
        }
    }, [bookingDetails.startTime, bookingDetails.endTime, endTimesList]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        setBookingDetails({
            ...bookingDetails,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (bookingDetails.startTime >= bookingDetails.endTime) {
            alert("Fout: De endtijd moet na de starttijd liggen.");
            return;
        }

        alert(`${bookingDetails.roomName} gereserveerd!`);
    };

    return (
        <div className="section-card vertical-flex-card">
            <h2 className="titling">Nieuwe Boeking Maken</h2>

            <div className="flex-fill">
                <form onSubmit={handleSubmit} id="new-booking-form">

                    <div className="form-row">
                        <label htmlFor="roomName">Naam kamer</label>
                        <select
                            id="roomName"
                            name="roomName"
                            className="booking-input"
                            value={bookingDetails.roomName}
                            onChange={handleChange}
                        >
                            {mockRooms.map(room => (
                                <option key={room} value={room}>{room}</option>
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
                            required
                            min={getTodayDate()}
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
                        >
                            {endTimesList.map(time => (
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
                            placeholder="Kort overleg, presentatie..."
                            className="booking-input"
                            value={bookingDetails.reason}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </form>
            </div>

            <button
                type="submit"
                className="button-primary"
                id="button-smaller"
                form="new-booking-form"
            >
                Reserveer kamer
            </button>
        </div>
    );
};