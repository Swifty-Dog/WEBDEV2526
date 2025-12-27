import React, { useEffect, useState } from 'react';
import type { Room } from '../../utils/types';
import type { Event } from '../../utils/types';
import { useTranslation } from 'react-i18next';



interface Props {
    existing?: Event;
    onClose: () => void;
    rooms: Room[];
    onSave: (payload: Omit<Event, 'attendeesCount'> & { id?: number }) => void | Promise<void>;
}

function toInputDateTime(iso?: string | Date) {
    if (!iso) return '';
    const d = new Date(iso);
    const tzOffset = d.getTimezoneOffset() * 60000;
    const local = new Date(d.getTime() - tzOffset);
    return local.toISOString().slice(0, 16);
}

function fromInputDateTime(val: string) {
    if (!val) return new Date().toISOString();
    return new Date(val).toISOString();
}

export const CreateNewEvent: React.FC<Props> = ({ existing, onClose, onSave, rooms }) => {
    const { t: tEvents } = useTranslation('events');
    const { t: tCommon } = useTranslation('common');

    // STATE
    const [title, setTitle] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [room, setRoom] = useState<Room | undefined>(undefined);
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (existing) {
            setTitle(existing.title ?? '');
            setEventDate(toInputDateTime(existing.eventDate));
            setRoom(existing.room);
            setDescription(existing.description ?? '');
        } else {
            setTitle('');
            setEventDate(toInputDateTime(new Date().toISOString()));
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
                eventDate: fromInputDateTime(eventDate),
                description: description.trim(),
                room: room,
            } as Omit<Event, 'attendeesCount'> & { id?: number })
            : ({
                title: title.trim(),
                eventDate: fromInputDateTime(eventDate),
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
                        <input value={title} onChange={e => setTitle(e.target.value)} required />
                    </div>

                    <div className="form-row">
                        <label>{tEvents('eventForm.labelDateTime')}</label>
                        <input
                            type="datetime-local"
                            value={eventDate}
                            onChange={e => setEventDate(e.target.value)}
                            required
                        />
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
