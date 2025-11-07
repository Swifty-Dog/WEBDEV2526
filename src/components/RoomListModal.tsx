import React, { useState } from 'react';
import type { Room } from './RoomFormModal';
import { RoomFormModal } from './RoomFormModal';
import { ConfirmDialog } from './ConfirmDialog';

interface RoomListModalProps {
    rooms: Room[];
    mode: 'manage' | 'delete';
    onClose: () => void;
    onSaveRoom: (room: Room) => void;
    onDeleteRoom: (id: string) => void;
}

export const RoomListModal: React.FC<RoomListModalProps> = ({rooms, mode, onClose, onSaveRoom, onDeleteRoom}) => {
    const [editing, setEditing] = useState<Room | undefined>(undefined);
    const [creating, setCreating] = useState(false);
    const [confirmDeleteRoom, setConfirmDeleteRoom] = useState<Room | undefined>(undefined);

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h3 className="titling">
                    {mode === 'manage' ? 'Kamers beheren' : 'Kamers verwijderen'}
                </h3>

                <table className="events-table">
                    <thead>
                    <tr>
                        <th>Naam</th>
                        <th>Capaciteit</th>
                        <th>Locatie</th>
                        <th>Actie</th>
                    </tr>
                    </thead>
                    <tbody>
                    {rooms.length === 0 && (
                        <tr>
                            <td colSpan={5} className="muted">Geen kamers gevonden</td>
                        </tr>
                    )}
                    {rooms.map(room => (
                        <tr key={room.id}>
                            <td>{room.name}</td>
                            <td>{room.capacity}</td>
                            <td>{room.location || '-'}</td>
                            <td className="table-actions">
                                {mode === 'manage' && (
                                    <button className="btn-sm" onClick={() => setEditing(room)}>
                                        Bewerk
                                    </button>
                                )}
                                {mode === 'delete' && (
                                    <button
                                        className="btn-sm btn-danger"
                                        onClick={() => setConfirmDeleteRoom(room)}
                                    >
                                        Verwijder
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                <div className="form-actions">
                    <button className="btn-sm" onClick={onClose}>Sluiten</button>
                    {mode === 'manage' && (
                        <button
                            className="btn-sm btn-primary-accent"
                            onClick={() => setCreating(true)}
                        >
                            Nieuwe kamer
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
                        title="Verwijder kamer"
                        message={`Weet je zeker dat je "${confirmDeleteRoom.name}" wilt verwijderen? Dit kan niet ongedaan worden.`}
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
