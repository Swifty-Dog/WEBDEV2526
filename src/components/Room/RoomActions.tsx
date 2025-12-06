import React from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
    onAdd: () => void;
    onManage: () => void;
    onDelete: () => void;
}

export const RoomActions: React.FC<Props> = ({ onAdd, onManage, onDelete }) => {
    const { t } = useTranslation('rooms');

    return (
        <ul className="admin-actions-list">
            <li className="list-item">
                <div className="action-content-wrapper">
                    <p className="action-text">{t('roomActions.addRoom')}</p>
                    <button className="button-secondary" onClick={onAdd}>❯</button>
                </div>
            </li>
            <li className="list-item">
                <div className="action-content-wrapper">
                    <p className="action-text">{t('generalRooms.manageRoomsTitle')}</p>
                    <button className="button-secondary" onClick={onManage}>❯</button>
                </div>
            </li>
            <li className="list-item">
                <div className="action-content-wrapper">
                    <p className="action-text">{t('generalRooms.deleteRoomsTitle')}</p>
                    <button className="button-secondary" onClick={onDelete}>❯</button>
                </div>
            </li>
        </ul>
    );
};
