import { ApiPut, ApiPost } from '../config/ApiRequest';
import { isTokenValid } from '../utils/auth';
import type {
    EventApiDto,
    CreateEventApiDto,
    UpdateEventApiDto,
} from '../utils/types';
import { useTranslation } from 'react-i18next';


export function useSaveEvents() {
    const { t } = useTranslation('events');

    const normalizeToIso = (dateStr: string, timeOrIso: string): string => {
        if (!timeOrIso) return `${dateStr}T00:00:00`;
        if (timeOrIso.includes('T')) return timeOrIso;
        return `${dateStr}T${timeOrIso}${timeOrIso.length === 5 ? ':00' : ''}`;
    };

    const saveEvent = async (event: EventApiDto): Promise<EventApiDto> => {
        if (!event.room?.id) {
            throw new Error(t('useSaveEvents.errors.roomRequired'));
        }

        const token = localStorage.getItem('authToken');
        if (!token || !isTokenValid(token)) {
            throw new Error(t('useSaveEvents.errors.notAuthorized'));
        }

        const startIso = normalizeToIso(event.eventDate, event.startTime);
        const endIso = normalizeToIso(event.eventDate, event.endTime);

        if (event.id) {
            return update(event, startIso, endIso, token);
        }

        return create(event, startIso, endIso, token);
    };


    const update = async (
        event: EventApiDto,
        startIso: string,
        endIso: string,
        token: string | null
    ): Promise<EventApiDto> => {
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
        return mapApiToEvent(updated);
    };

    const create = async (
        event: EventApiDto,
        startIso: string,
        endIso: string,
        token: string | null
    ): Promise<EventApiDto> => {
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
        return mapApiToEvent(created);
    };

    const mapApiToEvent = (
        dto: EventApiDto,
    ): EventApiDto => ({
        id: dto.id,
        title: dto.title,
        description: dto.description,
        eventDate: dto.eventDate,
        startTime: dto.startTime,
        endTime: dto.endTime,
        room: dto.room ? { id: dto.room.id, roomName: dto.room.roomName || '' } : undefined,
        attendees: dto.attendees,
        attending: dto.attending
    });

    return { saveEvent };
}