import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Room } from '../../utils/types.ts';
import { RoomFormModal } from './RoomFormModal.tsx';
import { ConfirmDialog } from '../ConfirmDialog.tsx';

interface RoomListModalProps {
    rooms: Room[];
    mode: 'manage' | 'delete';
    onClose: () => void;
    onSaveRoom: (room: Room) => void;
    onDeleteRoom: (id: number) => void;
}

export const RoomListModal: React.FC<RoomListModalProps> = ({rooms, mode, onClose, onSaveRoom, onDeleteRoom}) => {
    const { t: tRooms } = useTranslation('rooms');
    const { t: tCommon } = useTranslation('common');

    const [editing, setEditing] = useState<Room | undefined>(undefined);
    const [creating, setCreating] = useState(false);
    const [confirmDeleteRoom, setConfirmDeleteRoom] = useState<Room | undefined>(undefined);

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h3 className="titling">
                    {mode === 'manage'
                        ? tRooms('generalRooms.manageRoomsTitle')
                        : tRooms('generalRooms.deleteRoomsTitle')
                    }
                </h3>

                <table className="events-table">
                    <thead>
                    <tr>
                        <th>{tCommon('general.labelName')}</th>
                        <th>{tRooms('roomForm.labelCapacity')}</th>
                        <th>{tRooms('roomForm.labelLocation')}</th>
                        <th>{tRooms('roomListModal.headerAction')}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {rooms.length === 0 && (
                        <tr>
                            <td colSpan={4} className="muted">{tRooms('roomListModal.empty')}</td>
                        </tr>
                    )}
                    {rooms.map(room => (
                        <tr key={room.id}>
                            <td>{room.roomName}</td>
                            <td>{room.capacity}</td>
                            <td>{room.location || '-'}</td>
                            <td className="table-actions">
                                {mode === 'manage' && (
                                    <button className="btn-sm" onClick={() => setEditing(room)}>
                                        {tCommon('general.buttonEdit')}
                                    </button>
                                )}
                                {mode === 'delete' && (
                                    <button
                                        className="btn-sm btn-danger"
                                        onClick={() => setConfirmDeleteRoom(room)}
                                    >
                                        {tCommon('general.buttonDelete')}
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                <div className="form-actions">
                    <button className="btn-sm" onClick={onClose}>
                        {tCommon('general.buttonClose')}
                    </button>
                    {mode === 'manage' && (
                        <button
                            className="btn-sm btn-primary-accent"
                            onClick={() => setCreating(true)}
                        >
                            {tCommon('general.buttonCreate')}
                        </button>
                    )}
                </div>

                {editing && (
                    <RoomFormModal
                        existing={editing}
                        onClose={() => setEditing(undefined)}
                        onSave={(room) => {
                            onSaveRoom(room);
                            setEditing(undefined);
                        }}
                    />
                )}

                {creating && (
                    <RoomFormModal
                        onClose={() => setCreating(false)}
                        onSave={(room) => {
                            onSaveRoom(room);
                            setCreating(false);
                        }}
                    />
                )}

                {confirmDeleteRoom && (
                    <ConfirmDialog
                        title={tRooms('roomListModal.confirmDeleteTitle')}
                        message={tRooms('roomListModal.confirmDeleteMessage', { roomName: confirmDeleteRoom.roomName })}
                        onCancel={() => setConfirmDeleteRoom(undefined)}
                        onConfirm={() => {
                            if (confirmDeleteRoom.id) {
                                onDeleteRoom(confirmDeleteRoom.id);
                            }
                            setConfirmDeleteRoom(undefined);
                        }}
                    />
                )}
            </div>
        </div>
    );
};
