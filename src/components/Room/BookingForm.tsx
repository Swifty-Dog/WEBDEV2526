import React from 'react';
import { getTodayDate } from '../../utils/date.ts';
import type { Room, BookingDetails } from '../../utils/types.ts';

interface BookingFormProps {
    rooms: Room[];
    bookingDetails: BookingDetails;
    availableStartTimes: string[];
    availableEndTimes: string[];
    roomIsFullMap: Map<number, boolean>;
    loadingAvailability: boolean;
    fetchError: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    message?: { text: string | null; type: 'success' | 'error' } | null;
}

export const BookingForm: React.FC<BookingFormProps> = (
    {
        rooms,
        bookingDetails,
        availableStartTimes,
        availableEndTimes,
        roomIsFullMap,
        loadingAvailability,
        fetchError,
        onChange,
        onSubmit,
        message
    }) => {
    const timesAreDisabled = loadingAvailability || fetchError || availableStartTimes.length === 0 || bookingDetails.roomId === 0;
    const formIsDisabled = fetchError || loadingAvailability;

    return (
        <form onSubmit={onSubmit} className="form-container">
            <div className="form-fields">
                <div className="form-row">
                    <label htmlFor="bookingDate">Boekingsdatum</label>
                    <input
                        id="bookingDate"
                        name="bookingDate"
                        type="date"
                        className="booking-input"
                        value={bookingDetails.bookingDate}
                        onChange={onChange}
                        min={getTodayDate()}
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
                        onChange={onChange}
                        required
                        disabled={formIsDisabled}
                    >
                        <option value={0} disabled>
                            {loadingAvailability ? "Beschikbaarheid laden..." : "Selecteer een kamer"}
                        </option>
                        {rooms.map(room => {
                            const isFull = roomIsFullMap.get(room.id ?? 0) || false;
                            return (
                                <option key={room.id} value={room.id ?? undefined } disabled={isFull}>
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
                        onChange={onChange}
                        required
                        disabled={timesAreDisabled}
                    >
                        <option value="" disabled>Selecteer een starttijd</option>
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
                        onChange={onChange}
                        required
                        disabled={timesAreDisabled || availableEndTimes.length === 0}
                    >
                        <option value="" disabled>Selecteer een eindtijd</option>
                        {availableEndTimes.map(time => (
                            <option key={time} value={time}>{time}</option>
                        ))}
                    </select>
                </div>

                <div className="form-row">
                    <label htmlFor="purpose">Reden</label>
                    <input
                        id="purpose"
                        name="purpose"
                        type="text"
                        className="booking-input"
                        placeholder="Kort overleg, presentatie..."
                        value={bookingDetails.purpose}
                        onChange={onChange}
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
    );
};
