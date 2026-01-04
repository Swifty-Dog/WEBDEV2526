import React from 'react';
import { useTranslation } from 'react-i18next';
import type { EventApiDto } from '../utils/types';

interface Props {
    eventItem: EventApiDto;
    onClose: () => void;
}

export const AttendeesModal: React.FC<Props> = ({ eventItem, onClose }) => {
    const { t } = useTranslation('events');
    const { t: tCommon } = useTranslation('common');
    const attendees = eventItem.attendees ?? [];

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h3>{t('attendeesModal.title', { title: eventItem.title })}</h3>
                {attendees.length === 0 ? (
                    <p className="muted">{t('attendeesModal.empty')}</p>
                ) : (
                    <ul>
                        {attendees.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button className="btn-sm" onClick={onClose}>{tCommon('general.buttonClose')}</button>
                </div>
            </div>
        </div>
    );
};
