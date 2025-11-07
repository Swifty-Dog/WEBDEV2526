import React, { useState } from 'react';
import { RoomListModal } from './RoomListModal';
import { RoomFormModal, type Room } from './RoomFormModal';

export const AdminRoomManagement: React.FC = () => {
    const [rooms, setRooms] = useState<Room[]>([
        { id: '1', name: 'Kamer A', capacity: 20, location: '1e verdieping' },
        { id: '2', name: 'Kamer B', capacity: 10, location: '2e verdieping' },
    ]);

    const [showRoomList, setShowRoomList] = useState<{ open: boolean; mode: 'manage' | 'delete' }>({ open: false, mode: 'manage' });
    const [showRoomForm, setShowRoomForm] = useState(false);

    const handleSaveRoom = (room: Room) => {
        setRooms(prev => {
            if (room.id) return prev.map(r => r.id === room.id ? room : r);
            return [...prev, { ...room, id: Date.now().toString() }];
        });
    };

    const handleDeleteRoom = (id: string) => {
        setRooms(prev => prev.filter(r => r.id !== id));
    };

    return (
        <div className="section-card">
            <h1 className="titling">Kamerbeheer</h1>
            <ul className="admin-actions-list">
                <li className="list-item">
                    <div className="action-content-wrapper">
                        <p className="action-text">Voeg nieuwe kamer toe</p>
                        <button className="button-primary" id="button-smaller" onClick={() => setShowRoomForm(true)}>
                            &gt;
                        </button>
                    </div>
                </li>

                <li className="list-item">
                    <div className="action-content-wrapper">
                        <p className="action-text">Beheer kamers</p>
                        <button className="button-primary" id="button-smaller" onClick={() => setShowRoomList({ open: true, mode: 'manage' })}>
                            &gt;
                        </button>
                    </div>
                </li>

                <li className="list-item">
                    <div className="action-content-wrapper">
                        <p className="action-text">Verwijder kamers</p>
                        <button className="button-primary" id="button-smaller" onClick={() => setShowRoomList({ open: true, mode: 'delete' })}>
                            &gt;
                        </button>
                    </div>
                </li>
            </ul>

            {showRoomList.open && (
                <RoomListModal
                    rooms={rooms}
                    mode={showRoomList.mode}
                    onClose={() => setShowRoomList({ open: false, mode: 'manage' })}
                    onSaveRoom={handleSaveRoom}
                    onDeleteRoom={handleDeleteRoom}
                />
            )}

            {showRoomForm && (
                <RoomFormModal
                    onClose={() => setShowRoomForm(false)}
                    onSave={(room) => {
                        handleSaveRoom(room);
                        setShowRoomForm(false);
                    }}
                />
            )}
        </div>
    );
};
