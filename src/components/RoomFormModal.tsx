import React, { useState, useEffect } from 'react';
import '../styles/_components.css';
import { ConfirmDialog } from './ConfirmDialog.tsx';

export type Room = {
    id?: string;
    name: string;
    capacity: number;
    location?: string;
};

type RoomFormModalProps = {
    existing?: Room;
    onSave: (room: Room) => void;
    onClose: () => void;
};

export const RoomFormModal: React.FC<RoomFormModalProps> = ({ existing, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [capacity, setCapacity] = useState<number>(0);
    const [location, setLocation] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);

    // Store initial values for dirty-check
    const initialState = {
        name: existing?.name ?? '',
        capacity: existing?.capacity ?? 0,
        location: existing?.location ?? ''
    };

    useEffect(() => {
        if (existing) {
            setName(initialState.name);
            setCapacity(initialState.capacity);
            setLocation(initialState.location);
        } else {
            setName('');
            setCapacity(0);
            setLocation('');
        }
    }, [existing]);

    const isDirty = () => {
        return (
            name !== initialState.name ||
            capacity !== initialState.capacity ||
            location !== initialState.location
        );
    };

    const handleClose = () => {
        if (isDirty()) {
            setShowConfirm(true); // show confirmation only for unsaved changes
        } else {
            onClose();
        }
    };

    const submit = (e?: React.FormEvent) => {
        e?.preventDefault();
        const payload: Omit<Room, 'id'> & { id?: string } = {
            id: existing?.id,
            name: name.trim(),
            capacity,
            location: location.trim(),
        };
        onSave(payload);
    };

    return (
        <>
            <div className="modal-overlay">
                <div className="modal">
                    <h3 className="titling">{existing ? 'Kamer bewerken' : 'Nieuwe kamer toevoegen'}</h3>
                    <form onSubmit={submit}>
                        <div className="form-row">
                            <label>Naam</label>
                            <input value={name} onChange={e => setName(e.target.value)} required />
                        </div>

                        <div className="form-row">
                            <label>Capaciteit</label>
                            <input
                                type="number"
                                value={capacity}
                                onChange={e => setCapacity(Number(e.target.value))}
                                min={0}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <label>Locatie</label>
                            <input value={location} onChange={e => setLocation(e.target.value)} />
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn-sm" onClick={handleClose}>Annuleren</button>
                            <button
                                type="submit"
                                className="btn-sm"
                                style={{ background: 'var(--color-brand-accent)', color: 'white' }}
                            >
                                {existing ? 'Opslaan' : 'Aanmaken'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {showConfirm && (
                <ConfirmDialog
                    title="Wijzigingen niet opgeslagen"
                    message="Je hebt nog niet opgeslagen wijzigingen. Weet je zeker dat je dit wilt verlaten?"
                    onCancel={() => setShowConfirm(false)}
                    onConfirm={() => onClose()}
                />
            )}
        </>
    );
};
