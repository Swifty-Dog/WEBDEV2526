import React, { useEffect, useState } from 'react';
import type { Room } from '../../utils/types';
import type { Event } from '../../utils/types';
import { allTimes, timeToMinutes } from '../../utils/time';
import { useTranslation } from 'react-i18next';



interface Props {
    existing?: Event;
    onClose: () => void;
    rooms: Room[];
    onSave: (payload: Omit<Event, 'attendeesCount'> & { id?: number }) => void | Promise<void>;
}


export const CreateNewEvent: React.FC<Props> = ({ existing, onClose, onSave, rooms }) => {
    const { t: tEvents } = useTranslation('events');
    const { t: tCommon } = useTranslation('common');

    // STATE
    const [title, setTitle] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [eventStartTime, setEventStartTime] = useState('');
    const [eventEndTime, setEventEndTime] = useState('');
    const [room, setRoom] = useState<Room | undefined>(undefined);
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (existing) {
            setTitle(existing.title ?? '');
            setEventDate(existing.eventDate?.toDateString().slice(0, 10));
            setEventStartTime(existing.eventStartTime.toTimeString().slice(0, 5));
            setEventEndTime(existing.eventEndTime.toTimeString().slice(0, 5));
            setRoom(existing.room);
            setDescription(existing.description ?? '');
        } else {
            setTitle('');
            setEventDate('');
            setEventStartTime('');
            setEventEndTime('');
            setRoom(undefined);
            setDescription('');
        }
    }, [existing]);

    const submit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const payload = existing?.id !== undefined
            ? ({
                id: existing.id,
                title: title.trim(),
                eventDate: new Date(eventDate),
                eventStartTime: new Date(eventStartTime),
                eventEndTime: new Date(eventEndTime),
                description: description.trim(),
                room: room,
            } as Omit<Event, 'attendeesCount'> & { id?: number })
            : ({
                title: title.trim(),
                eventDate: new Date(eventDate),
                eventStartTime: new Date(eventStartTime),
                eventEndTime: new Date(eventEndTime),
                description: description.trim(),
                room: room,
            } as Omit<Event, 'attendeesCount'> & { id?: number });

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
                            value={room?.id ?? ''}
                            onChange={e => {
                                const selectedRoom = rooms.find(r => r.id === Number(e.target.value));
                                setRoom(selectedRoom);
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
