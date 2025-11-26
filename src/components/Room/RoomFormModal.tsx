import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../../styles/_components.css';
import { ConfirmDialog } from '../ConfirmDialog.tsx';
import { type Room } from '../../utils/types.ts';

type RoomFormModalProps = {
    existing?: Room;
    onSave: (room: Room) => void;
    onClose: () => void;
};

export const RoomFormModal: React.FC<RoomFormModalProps> = ({ existing, onClose, onSave }) => {
    const { t: tRooms } = useTranslation('rooms');
    const { t: tCommon } = useTranslation('common');

    const [name, setName] = useState('');
    const [capacity, setCapacity] = useState<number>(0);
    const [location, setLocation] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);

    const initialState = {
        name: existing?.roomName ?? '',
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
    }, [existing, initialState.capacity, initialState.location, initialState.name]);

    const isDirty = () => {
        return (
            name !== initialState.name ||
            capacity !== initialState.capacity ||
            location !== initialState.location
        );
    };

    const handleClose = () => {
        if (isDirty()) {
            setShowConfirm(true);
        } else {
            onClose();
        }
    };

    const submit = (e?: React.FormEvent) => {
        e?.preventDefault();
        const payload: Room = {
            id: existing?.id || null,
            roomName: name.trim(),
            capacity,
            location: location.trim(),
        };
        onSave(payload);
    };

    return (
        <>
            <div className="modal-overlay">
                <div className="modal">
                    <h3 className="titling">
                        {existing ? tRooms('roomForm.titleEdit') : tRooms('roomForm.titleAdd')}
                    </h3>
                    <form onSubmit={submit}>
                        <div className="form-row">
                            <label>{tCommon('general.labelName')}</label>
                            <input value={name} onChange={e => setName(e.target.value)} required />
                        </div>

                        <div className="form-row">
                            <label>{tRooms('roomForm.labelCapacity')}</label>
                            <input
                                type="number"
                                value={capacity}
                                onChange={e => setCapacity(Number(e.target.value))}
                                min={0}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <label>{tRooms('roomForm.labelLocation')}</label>
                            <input value={location} onChange={e => setLocation(e.target.value)} />
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn-sm" onClick={handleClose}>
                                {tCommon('general.buttonCancel')}
                            </button>
                            <button
                                type="submit"
                                className="btn-sm btn-primary-accent"
                            >
                                {existing ? tCommon('general.buttonSave') : tCommon('general.buttonCreate')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {showConfirm && (
                <ConfirmDialog
                    title={tCommon('general.confirmTitle')}
                    message={tCommon('general.confirmMessage')}
                    onCancel={() => setShowConfirm(false)}
                    onConfirm={() => onClose()}
                />
            )}
        </>
    );
};
