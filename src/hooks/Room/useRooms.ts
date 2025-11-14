import { useState, useEffect, useCallback } from 'react';
import { ApiGet, ApiPost, ApiPut, ApiDelete } from '../../components/ApiRequest.tsx';
import type { Room } from '../../utils/types.ts';

export const useRooms = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRooms = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data: Room[] = await ApiGet<Room[]>('/Room', { Authorization: `Bearer ${localStorage.getItem('authToken')}` });
            setRooms(data.map(r => ({
                id: r.id,
                roomName: r.roomName,
                capacity: r.capacity,
                location: r.location
            })));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Kon kamers niet ophalen.');
        } finally {
            setLoading(false);
        }
    }, []);

    const saveRoom = async (room: Room) => {
        setError(null);
        try {
            if (room.id) {
                const saved = await ApiPut<Room>(`/Room/${room.id}`, room, { Authorization: `Bearer ${localStorage.getItem('authToken')}` });
                setRooms(prev => prev.map(r => r.id === saved.id ? saved : r));
            } else {
                const saved = await ApiPost<Room>('/Room', room, { Authorization: `Bearer ${localStorage.getItem('authToken')}` });
                setRooms(prev => [...prev, saved]);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Kon kamer niet opslaan.');
        }
    };

    const deleteRoom = async (id: number) => {
        setError(null);
        try {
            await ApiDelete(`/Room/${id}`, { Authorization: `Bearer ${localStorage.getItem('authToken')}` });
            setRooms(prev => prev.filter(r => r.id !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Kon kamer niet verwijderen.');
        }
    };

    useEffect(() => { void fetchRooms(); }, [fetchRooms]);

    return { rooms, loading, error, fetchRooms, saveRoom, deleteRoom };
};
