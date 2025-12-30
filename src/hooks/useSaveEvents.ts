import { ApiPut, ApiPost } from '../config/ApiRequest';
import { isTokenValid } from '../utils/auth';
import type {
    EventApiDto,
    CreateEventApiDto,
    UpdateEventApiDto,
    Event,
    Room
} from '../utils/types';

type SaveEventPayload = Omit<Event, 'attendeesCount'>;


export function useSaveEvents(rooms: Room[]) {
    const saveEvent = async (event: SaveEventPayload): Promise<Event> => {
        if (!event.room?.id) {
            throw new Error('Selecteer een room');
        }
        const token = localStorage.getItem('authToken');
        if (!token || !isTokenValid(token)) {
            throw new Error('Niet geautoriseerd');
        }

        const startIso = new Date(`${event.eventDate}T${event.eventStartTime}:00`);
        const endIso = new Date(`${event.eventDate}T${event.eventEndTime}:00`);

        if (event.id) {
            return update(event, startIso, endIso, token);
        }

        return create(event, startIso, endIso, token);
    };

    const update = async (
        event: SaveEventPayload,
        startIso: Date,
        endIso: Date,
        token: string | null
    ): Promise<Event> => {
        const dto: UpdateEventApiDto = {
            title: event.title,
            description: event.description,
            eventDate: event.eventDate,
            startTime: startIso,
            endTime: endIso,
            roomId: event.room!.id!
        };

        const updated = await ApiPut<EventApiDto>(`/Event/${event.id}`, dto,
            token ? { Authorization: `Bearer ${token}` } : undefined);
        return mapApiToEvent(updated, event.room!);
    };

    const create = async (
        event: SaveEventPayload,
        startIso: Date,
        endIso: Date,
        token: string | null

    ): Promise<Event> => {
        const dto: CreateEventApiDto = {
            title: event.title,
            description: event.description,
            eventDate: event.eventDate,
            startTime: startIso,
            endTime: endIso,
            roomId: event.room!.id!
        };

        const created = await ApiPost<EventApiDto>('/Event', dto,
            token ? { Authorization: `Bearer ${token}` } : undefined);
        return mapApiToEvent(created, event.room!);
    };

    const mapApiToEvent = (
        dto: EventApiDto,
        fallbackRoom: Room
    ): Event => ({
        id: dto.id,
        title: dto.title,
        description: dto.description,
        eventDate: dto.eventDate,
        eventStartTime: dto.StartTime,
        eventEndTime: dto.EndTime,
        room: rooms.find(r => r.id === dto.room?.id) ?? fallbackRoom,
        attendeesCount: dto.attendees?.length ?? 0
    });

    return { saveEvent };
}
