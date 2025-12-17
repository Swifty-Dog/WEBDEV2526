import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { EventItem } from '../pages/AdminDashboard';

interface Props {
    existing?: EventItem;
    onClose: () => void;
    onSave: (payload: Omit<EventItem, 'id' | 'attendees'> & { id?: string }) => void | Promise<void>;
}

function toInputDateTime(iso?: string) {
    if (!iso) return '';
    const d = new Date(iso);
    const tzOffset = d.getTimezoneOffset() * 60000;
    const local = new Date(d.getTime() - tzOffset);
    return local.toISOString().slice(0, 16);
}

function fromInputDateTime(val: string) {
    if (!val) return new Date().toISOString();
    const d = new Date(val);
    return d.toISOString();
}

export const EventFormModal: React.FC<Props> = ({ existing, onClose, onSave }) => {
    const { t: tEvents } = useTranslation('events');
    const { t: tCommon } = useTranslation('common');

    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (existing) {
            setTitle(existing.title ?? '');
            setDate(toInputDateTime(existing.date));
            setLocation(existing.location ?? '');
            setDescription(existing.description ?? '');
        } else {
            setTitle('');
            setDate(toInputDateTime(new Date().toISOString()));
            setLocation('');
            setDescription('');
        }
    }, [existing]);

    const submit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const payload: Omit<EventItem, 'id' | 'attendees'> & { id?: string } = {
            id: existing?.id,
            title: title.trim(),
            date: fromInputDateTime(date),
            location: location.trim(),
            description: description.trim(),
        };
        await onSave(payload);
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h3 style={{ marginTop: 0 }}>{existing ? tEvents('eventForm.titleEdit') : tEvents('eventForm.titleNew')}</h3>
                <form onSubmit={submit}>
                    <div className="form-row">
                        <label>{tEvents('eventForm.labelTitle')}</label>
                        <input value={title} onChange={e => setTitle(e.target.value)} required />
                    </div>
                    <div className="form-row">
                        <label>{tEvents('eventForm.labelDateTime')}</label>
                        <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} required />
                    </div>
                    <div className="form-row">
                        <label>{tEvents('eventForm.labelLocation')}</label>
                        <input value={location} onChange={e => setLocation(e.target.value)} />
                    </div>
                    <div className="form-row">
                        <label>{tEvents('eventForm.labelDescription')}</label>
                        <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} />
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-sm" onClick={onClose}>{tCommon('general.buttonCancel')}</button>
                        <button type="submit" className="btn-sm" style={{ background: 'var(--color-brand-accent)', color: 'white' }}>
                            {existing ? tCommon('general.buttonSave') : tCommon('general.buttonCreate')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
