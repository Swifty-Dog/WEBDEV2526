import React from 'react';

interface Props {
    onAdd: () => void;
    onManage: () => void;
    onDelete: () => void;
}

export const RoomActions: React.FC<Props> = ({ onAdd, onManage, onDelete }) => (
    <ul className="admin-actions-list">
        <li className="list-item">
            <div className="action-content-wrapper">
                <p className="action-text">Voeg nieuwe kamer toe</p>
                <button className="button-secondary" onClick={onAdd}>❯</button>
            </div>
        </li>
        <li className="list-item">
            <div className="action-content-wrapper">
                <p className="action-text">Beheer kamers</p>
                <button className="button-secondary" onClick={onManage}>❯</button>
            </div>
        </li>
        <li className="list-item">
            <div className="action-content-wrapper">
                <p className="action-text">Verwijder kamers</p>
                <button className="button-secondary" onClick={onDelete}>❯</button>
            </div>
        </li>
    </ul>
);
