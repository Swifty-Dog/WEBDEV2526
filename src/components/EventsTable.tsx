import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Event } from '../utils/types';
import { formatEventDateTime } from '../utils/time';

interface Props {
    events: Event[];
    onEdit: (ev: Event) => void;
    onDelete: (ev: Event) => void;
    onViewAttendees: (ev: Event) => void;
}

export const EventsTable: React.FC<Props> = ({ events, onEdit, onDelete, onViewAttendees }) => {
    const { t: tEvents } = useTranslation('events');
    const { t: tCommon } = useTranslation('common');

    return (
        <div>
            <table className="events-table">
                <thead>
                    <tr>
                        <th>{tEvents('eventsTable.headerTitle')}</th>
                        <th>{tEvents('eventsTable.headerDate')}</th>
                        <th>{tEvents('eventsTable.headerLocation')}</th>
                        <th>{tEvents('eventsTable.headerAttendees')}</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {events.length === 0 && (
                        <tr>
                            <td colSpan={5} style={{ textAlign: 'center', padding: '1.25rem' }}>
                                {tEvents('eventsTable.empty')}
                            </td>
                        </tr>
                    )}
                    {events.map(ev => (
                        <tr key={ev.id}>
                            <td>
                                <div style={{ fontWeight: 600 }}>{ev.title}</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>{ev.description}</div>
                            </td>
                            <td>{formatEventDateTime(ev.eventDate, ev.eventStartTime, ev.eventEndTime)}</td>
                            <td>{ev.room?.roomName ?? '-'}</td>
                            <td>{(ev.attendeesCount ?? [])}</td>
                            <td>
                                <div className="table-actions">
                                    <button className="btn-sm" onClick={() => onEdit(ev)}>{tCommon('general.buttonEdit')}</button>
                                    <button className="btn-sm" onClick={() => onViewAttendees(ev)}>{tEvents('eventsTable.buttonAttendees')}</button>
                                    <button className="btn-sm btn-danger" onClick={() => onDelete(ev)}>{tCommon('general.buttonDelete')}</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default EventsTable;
