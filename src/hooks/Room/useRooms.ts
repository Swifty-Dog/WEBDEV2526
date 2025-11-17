import { useState, useEffect, useCallback } from 'react';
import { ApiGet, ApiPost, ApiPut, ApiDelete } from '../../components/ApiRequest.tsx';
import type { Room } from '../../utils/types.ts';
import { startGenericHub, onEvent, stopGenericHub } from '../../utils/signalR/genericHub';

export const useRooms = () => {
    const token = localStorage.getItem('authToken');
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRooms = useCallback(async () => {
        if (!token) {
            setError('Je bent niet ingelogd.');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data: Room[] = await ApiGet<Room[]>('/Room', {
                Authorization: `Bearer ${token}`
            });

            setRooms(data.map(r => ({
                id: r.id || null,
                roomName: r.roomName,
                capacity: r.capacity,
                location: r.location
            })));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Kon kamers niet ophalen.');
        } finally {
            setLoading(false);
        }
    }, [token]);

    const saveRoom = useCallback(async (room: Room) => {
        if (!token) return;

        try {
            if (room.id) {
                const saved = await ApiPut<Room>(`/Room/${room.id}`, room, {
                    Authorization: `Bearer ${token}`,
                });
                setRooms(prev => prev.map(r => r.id === saved.id ? saved : r));
            } else {
                const dto = {
                    roomName: room.roomName,
                    capacity: room.capacity,
                    location: room.location,
                };
                const saved = await ApiPost<Room>('/Room', dto, {
                    Authorization: `Bearer ${token}`,
                });
                setRooms(prev => [...prev, saved]);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Kon kamer niet opslaan.');
        }
    }, [token]);

    const deleteRoom = useCallback(async (id: number) => {
        if (!token) return;

        try {
            await ApiDelete(`/Room/${id}`, {Authorization: `Bearer ${token}`});
            setRooms(prev => prev.filter(r => r.id !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Kon kamer niet verwijderen.');
        }
    }, [token]);

    useEffect(() => {
        void fetchRooms();

        if (!token) return;

        startGenericHub();

        const unsubscribe = onEvent("RoomChanged", () => {
            void fetchRooms();
        });

        return () => {
            unsubscribe();
            stopGenericHub();
        };
    }, [token, fetchRooms]);

    return {rooms, loading, error, fetchRooms, saveRoom, deleteRoom};
};
