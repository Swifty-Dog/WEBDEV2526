import { useState, useEffect, useCallback } from 'react';
import i18n from '../../utils/locales/i18n';
import { translateFetchError } from '../../utils/locales/translateFetchError';
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
            setError(i18n.t('general.errorNotLoggedIn'));
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
            const errorMessage = translateFetchError(err as Error, 'rooms:roomError.errorFetch');
            setError(errorMessage);
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
            const errorMessage = translateFetchError(err as Error, 'rooms:roomError.errorSave');
            setError(errorMessage);
        }
    }, [token]);

    const deleteRoom = useCallback(async (id: number) => {
        if (!token) return;

        try {
            await ApiDelete(`/Room/${id}`, {Authorization: `Bearer ${token}`});
            setRooms(prev => prev.filter(r => r.id !== id));
        } catch (err) {
            const errorMessage = translateFetchError(err as Error, 'rooms:roomError.errorDelete');
            setError(errorMessage);
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
