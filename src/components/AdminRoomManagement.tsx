import React, {useEffect, useState} from 'react';
import { RoomListModal } from './RoomListModal';
import { RoomFormModal, type Room } from './RoomFormModal';

export const AdminRoomManagement: React.FC = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const token = localStorage.getItem('authToken');

    useEffect(() => {
        (async () => {
            try {
                const response = await fetch('http://localhost:5222/api/Room', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const dataFromApi = await response.json();

                    const rooms: Room[] = dataFromApi.map((room:
                         { id: number; roomName: string; capacity: number; location: string; }) => ({
                        id: room.id,
                        name: room.roomName,
                        capacity: room.capacity,
                        location: room.location
                    }));

                    setRooms(rooms);

                } else {
                    console.error('Kamers konden niet worden opgehaald.');
                }
            } catch (error) {
                console.error('Kamers ophalen mislukt', error);
            }
        })();
    }, []);

    const [showRoomList, setShowRoomList] = useState<{ open: boolean; mode: 'manage' | 'delete' }>({ open: false, mode: 'manage' });
    const [showRoomForm, setShowRoomForm] = useState(false);

    const fetchRooms = async () => {
        try {
            const response = await fetch('http://localhost:5222/api/Room');
            if (response.ok) {
                const dataFromApi = await response.json();
                const rooms: Room[] = dataFromApi.map((room: { id: number; roomName: string; capacity: number; location: string }) => ({
                    id: room.id,
                    name: room.roomName,
                    capacity: room.capacity,
                    location: room.location
                }));
                setRooms(rooms);
            }
        } catch (error) {
            console.error('Kamers ophalen mislukt', error);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    const handleSaveRoom = async (room: Room) => {
        try {
            let savedRoom: Room;

            if (room.id) {
                const response = await fetch(`http://localhost:5222/api/Room/${room.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        id: room.id,
                        roomName: room.name,
                        capacity: room.capacity,
                        location: room.location
                    })
                });
                if (!response.ok) throw new Error('Failed to update room');
                savedRoom = await response.json();
            } else {
                const response = await fetch(`http://localhost:5222/api/Room`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        roomName: room.name,
                        capacity: room.capacity,
                        location: room.location
                    })
                });
                if (!response.ok)
                    throw new Error('Failed to create room');
                savedRoom = await response.json();
            }

            setRooms(prev => {
                if (room.id) return prev.map(r => r.id === savedRoom.id ? savedRoom : r);
                return [...prev, savedRoom];
            });
            await fetchRooms();
        } catch (error) {
            console.error('Error saving room', error);
            alert('Er is iets misgegaan bij het opslaan van de kamer.');
        }
    };

    const handleDeleteRoom = async (id: number) => {
        try {
            const response = await fetch(`http://localhost:5222/api/Room/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setRooms(prev => prev.filter(r => r.id !== id));
            } else {
                const errorData = await response.json();
                console.error('Delete error:', errorData);
                alert(errorData.message || 'Fout bij het verwijderen van de kamer.');
            }
        } catch (error) {
            console.error('Error deleting room', error);
            alert('Er is iets misgegaan bij het verwijderen van de kamer.');
        }
    };

    return (
        <div className="section-card">
            <h1 className="titling">Kamerbeheer</h1>
            <ul className="admin-actions-list">
                <li className="list-item">
                    <div className="action-content-wrapper">
                        <p className="action-text">Voeg nieuwe kamer toe</p>
                        <button className="button-secondary" onClick={() => setShowRoomForm(true)}>
                            ❯
                        </button>
                    </div>
                </li>

                <li className="list-item">
                    <div className="action-content-wrapper">
                        <p className="action-text">Beheer kamers</p>
                        <button className="button-secondary" onClick={() => setShowRoomList({ open: true, mode: 'manage' })}>
                            ❯
                        </button>
                    </div>
                </li>

                <li className="list-item">
                    <div className="action-content-wrapper">
                        <p className="action-text">Verwijder kamers</p>
                        <button className="button-secondary" onClick={() => setShowRoomList({ open: true, mode: 'delete' })}>
                            ❯
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
