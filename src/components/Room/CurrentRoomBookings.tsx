import React, { useState, useEffect, useCallback } from 'react';
import { RoomBookingsModal } from './RoomBookingsModal';
import { BookingItem } from './BookingItem';
import { useCurrentRoomBookings } from '../../hooks/Room/useCurrentRoomBookings.ts';
import { EditRoomBookingModal } from "./EditRoomBookingModal";
import type { Booking } from "../../utils/types";
import { useDeleteBooking } from "../../hooks/Room/useRemoveRoomBooking.ts";
import { ConfirmDialog } from "../ConfirmDialog.tsx";
import { formatDate } from '../../utils/date.ts';
import {useUpdateBooking} from "../../hooks/Room/useUpdateBooking.ts";

type ModalMessage = { text: string | null; type: 'success' | 'error' };

export const CurrentRoomBookings: React.FC = () => {
    const { bookings: fetchedBookings, loading, error } = useCurrentRoomBookings();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [bookingToEdit, setBookingToEdit] = useState<Booking | null>(null);
    const [modalMessage, setModalMessage] = useState<ModalMessage | null>(null);
    const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
    const { updateBooking } = useUpdateBooking(() => {}, (errorMessage: string) => setModalMessage({ text: errorMessage, type: 'error' }));
    const onDeleteError = useCallback((errorMessage: string) => {setModalMessage({ text: errorMessage, type: 'error' });}, []);


    useEffect(() => {
        if (fetchedBookings) {
            setBookings(fetchedBookings);
        }
    }, [fetchedBookings]);

    const displayedBookings = bookings.slice(0, 3);

    const handleEditClick = (booking: Booking) => {
        setBookingToEdit(booking);
        setIsModalOpen(false);
        setModalMessage(null);
    };

    const handleCloseEdit = () => {
        setBookingToEdit(null);
        setIsModalOpen(true);
    };

    const handleSaveEdit = async (updatedBooking: Booking) => {
        try {
            setModalMessage({ text: 'Boeking bijwerken…', type: 'success' });

            await updateBooking(updatedBooking);

            setBookings(prev =>
                prev.map(b => (b.id === updatedBooking.id ? updatedBooking : b))
            );

            setBookingToEdit(null);
            setIsModalOpen(true);
            showTemporaryMessage('Boeking succesvol bijgewerkt.', 'success' );
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Kon boeking niet bijwerken.';
            showTemporaryMessage(errorMessage, 'error' );
        }
    };

    const { deleteBooking } = useDeleteBooking(() => {}, onDeleteError);

    const handleDelete = useCallback(async (bookingId: number) => {
        try {
            await deleteBooking(bookingId);
            setBookings(prev => prev.filter(b => b.id !== bookingId));
            showTemporaryMessage('Boeking succesvol bijgewerkt.', 'success');
        } catch (error) {
            console.error("Delete failed:", error);
        }
    }, [deleteBooking]);

    const handleDeleteClick = (booking: Booking) => {
        setModalMessage(null);
        setBookingToDelete(booking);
    };

    const handleCancelDelete = () => {
        setBookingToDelete(null);
    };

    const handleConfirmDelete = async () => {
        if (bookingToDelete) {
            await handleDelete(bookingToDelete.id);
        }
        setBookingToDelete(null);
    };

    const showTemporaryMessage = (text: string | null, type: 'success' | 'error') => {
        setModalMessage({ text, type });
        if (text) {
            setTimeout(() => {
                setModalMessage(null);
            }, 5000);
        }
    };

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
                        {displayedBookings.map(b => (
                            <BookingItem key={b.id} booking={b} />
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
                    onClose={() => {
                        setIsModalOpen(false);
                        setModalMessage(null);
                    }}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                    message={modalMessage}
                />
            )}

            {bookingToEdit && (
                <EditRoomBookingModal
                    booking={bookingToEdit}
                    onClose={handleCloseEdit}
                    onSave={handleSaveEdit}
                />
            )}

            {bookingToDelete && (
                <ConfirmDialog
                    title="Verwijder Boeking"
                    message={`Weet je zeker dat je de boeking voor '${bookingToDelete.purpose}' op ${formatDate(bookingToDelete.bookingDate)} wilt verwijderen?`}
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                />
            )}
        </>
    );
};
