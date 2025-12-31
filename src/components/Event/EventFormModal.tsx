import React, { useEffect, useState } from 'react';
import type { EventApiDto, Room } from '../../utils/types';
import { allTimes, timeToMinutes } from '../../utils/time';
import { useTranslation } from 'react-i18next';

interface Props {
    existing?: EventApiDto;
    onClose: () => void;
    rooms: Room[];
    onSave: (payload: EventApiDto & { id?: number }) => void | Promise<void>;
}

export const CreateNewEvent: React.FC<Props> = ({ existing, onClose, onSave, rooms }) => {
    const { t: tEvents } = useTranslation('events');
    const { t: tCommon } = useTranslation('common');

    const [title, setTitle] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [eventStartTime, setEventStartTime] = useState('');
    const [eventEndTime, setEventEndTime] = useState('');
    const [room, setRoom] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (existing) {
            setTitle(existing.title ?? '');
            // eventDate is ISO (YYYY-MM-DD or full ISO) — take date portion
            setEventDate(existing.eventDate ? existing.eventDate.slice(0, 10) : '');
            // startTime/endTime might be ISO or 'HH:MM' — derive time portion
            setEventStartTime(existing.startTime ? (existing.startTime.includes('T') ? existing.startTime.slice(existing.startTime.indexOf('T') + 1, existing.startTime.indexOf('T') + 6) : existing.startTime.slice(0, 5)) : '');
            setEventEndTime(existing.endTime ? (existing.endTime.includes('T') ? existing.endTime.slice(existing.endTime.indexOf('T') + 1, existing.endTime.indexOf('T') + 6) : existing.endTime.slice(0, 5)) : '');
            setRoom(existing.room?.id?.toString() ?? '');
            setDescription(existing.description ?? '');
        } else {
            setTitle('');
            setEventDate('');
            setEventStartTime('');
            setEventEndTime('');
            setRoom('');
            setDescription('');
        }
    }, [existing]);

    const submit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const startIso = eventStartTime.includes('T') ? eventStartTime : `${eventDate}T${eventStartTime}${eventStartTime.length === 5 ? ':00' : ''}`;
        const endIso = eventEndTime.includes('T') ? eventEndTime : `${eventDate}T${eventEndTime}${eventEndTime.length === 5 ? ':00' : ''}`;

        const selectedRoom = rooms.find(r => r.id === Number(room));

        const basePayload: EventApiDto = {
            id: existing?.id ?? 0,
            title: title.trim(),
            eventDate: eventDate,
            startTime: startIso,
            endTime: endIso,
            description: description.trim(),
            room: selectedRoom ? { id: selectedRoom.id, roomName: selectedRoom.roomName } : undefined,
            attendees: existing?.attendees ?? [],
            attending: existing?.attending ?? false
        };

        const payload = existing?.id !== undefined
            ? { ...basePayload, id: existing.id } as EventApiDto & { id?: number }
            : { ...basePayload, id: 0 } as EventApiDto & { id?: number };

        await onSave(payload);
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h3 style={{ marginTop: 0 }}>
                    {existing ? tEvents('eventForm.titleEdit') : tEvents('eventForm.titleNew')}
                </h3>

                <form onSubmit={submit}>
                    <div className="form-row">
                        <label>{tEvents('eventForm.labelTitle')}</label>
                        <input value={title} onChange={e => setTitle(e.target.value)}
                            required />
                    </div>

                    <div className="form-row">
                        <label>{tEvents('eventForm.labelDate')}</label>
                        <input
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            value={eventDate}
                            onChange={e => setEventDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <label>{tEvents('eventForm.labelStartTime')}</label>
                        <select
                            value={eventStartTime}
                            onChange={e => setEventStartTime(e.target.value)}
                            required
                        >
                            <option value="" disabled>
                                -- Choose StartTime --
                            </option>
                            {allTimes.map(time => (
                                <option key={time} value={time}>
                                    {time}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-row">
                        <label>{tEvents('eventForm.labelEndTime')}</label>
                        <select
                            value={eventEndTime}
                            onChange={e => setEventEndTime(e.target.value)}
                            required
                        >
                            <option value="" disabled>
                                -- Choose EndTime --
                            </option>
                            {allTimes
                                .filter(time =>
                                    !eventStartTime ||
                                    timeToMinutes(time) > timeToMinutes(eventStartTime)
                                )
                                .map(time => (
                                    <option key={time} value={time}>
                                        {time}
                                    </option>
                                ))
                            }
                        </select>
                    </div>

                    <div className="form-row">
                        <label>{tEvents('eventForm.labelRoom')}</label>
                        <select
                            value={room ?? ''}
                            onChange={e => {
                                const selectedRoom = rooms.find(r => r.id === Number(e.target.value));
                                if (selectedRoom)
                                    setRoom(selectedRoom.id.toString());
                            }}
                            required
                        >
                            <option value="" disabled>
                                {tEvents('eventForm.labelSelectRoom')}
                            </option>
                            {rooms.map(r => (
                                <option key={r.id} value={r.id?.toString()}>
                                    {r.roomName} ({r.location})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-row">
                        <label>{tEvents('eventForm.labelDescription')}</label>
                        <textarea
                            rows={3}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-sm" onClick={onClose}>
                            {tCommon('general.buttonCancel')}
                        </button>

                        <button
                            type="submit"
                            className="btn-sm"
                            style={{ background: 'var(--color-brand-accent)', color: 'white' }}
                        >
                            {existing ? tCommon('general.buttonSave') : tCommon('general.buttonCreate')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};