import React, { useState, useEffect } from 'react';
import * as signalR from '@microsoft/signalr';
import { RoomBookingsModal } from "./RoomBookingsModal.tsx";

export interface Booking {
    id: number;
    purpose: string;
    roomName: string;
    startTime: string;
    endTime: string;
    bookingDate: string;
}

export const formatTimeUntil = (bookingDate: string, startTime: string) => {
    const now = new Date();
    const bookingDateTime = new Date(`${bookingDate}T${startTime}`);
    const diffMs = bookingDateTime.getTime() - now.getTime();

    if (diffMs <= 0) return 'Nu';
    const diffMinutes = Math.ceil(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `in ${diffDays} dag${diffDays > 1 ? 'en' : ''}`;

    if (diffHours > 0) {
        const remainingMinutes = diffMinutes % 60;
        if (remainingMinutes === 0) {
            return `in ${diffHours} uur`;
        }
        return `in ${diffHours} uur en ${remainingMinutes} ${remainingMinutes !== 1 ? 'minuten' : 'minuut'}`;
    }

    return `in ${diffMinutes} ${diffMinutes > 1 ? 'minuten' : 'minuut'}`;
};

export const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};

export const CurrentRoomBookings: React.FC = () => {
    const token = localStorage.getItem('authToken');

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBookings = async () => {
        if (!token) {
            setError('Je bent niet ingelogd.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`http://localhost:5222/api/RoomBooking/Employee/current`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) throw new Error('Kon boekingen niet ophalen.');

            const data: Booking[] = await response.json();

            data.sort((a, b) => {
                const dateA = new Date(`${a.bookingDate}T${a.startTime}`);
                const dateB = new Date(`${b.bookingDate}T${b.startTime}`);
                return dateA.getTime() - dateB.getTime();
            });

            setBookings(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Er is een fout opgetreden bij het ophalen van boekingen.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();

        if (!token) return;

        const connection = new signalR.HubConnectionBuilder()
            .withUrl('http://localhost:5222/hubs/roomBookings', {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .build();

        connection.start().catch(err => console.error('SignalR connection error:', err));

        connection.on('BookingChanged', () => {
            fetchBookings();
        });

        return () => {
            connection.stop();
        };
    }, [fetchBookings, token]);

    useEffect(() => {
        const interval = setInterval(() => {
            setBookings(prev => [...prev]);
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    const displayedBookings = bookings.slice(0, 3);

    if (loading) return <p>Boekingen laden...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <>
            <div className="section-card vertical-flex-card">
                <h2 className="titling">Opkomende kamerboekingen</h2>

                {bookings.length === 0 ? (
                    <p className="muted">Geen opkomende boekingen gevonden.</p>
                ) : (
                    <ul className="booking-items-list flex-fill">
                        {displayedBookings.map(booking => (
                            <li key={booking.id} className="booking-item">
                                <div className="booking-content" id="current-bookings">
                                    <div className="form-row">
                                        <label>Datum en tijd:</label>
                                        <span>
                                            {formatDate(booking.bookingDate)} ({booking.startTime} - {booking.endTime}) –{' '}
                                            {formatTimeUntil(booking.bookingDate, booking.startTime)}
                                        </span>
                                    </div>
                                    <div className="form-row">
                                        <label>Kamer:</label>
                                        <span>{booking.roomName}</span>
                                    </div>
                                    <div className="form-row">
                                        <label>Reden:</label>
                                        <span>{booking.purpose}</span>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                <button
                    className="button-secondary full-width-button"
                    onClick={() => setIsModalOpen(true)}
                >
                    Bekijk al mijn aankomende boekingen &gt;
                </button>
            </div>

            {isModalOpen && (
                <RoomBookingsModal
                    bookings={bookings}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </>
    );
};
