import React from 'react';

interface Props {
    title?: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmDialog: React.FC<Props> = ({ title = 'Confirm', message, onConfirm, onCancel }) => {
    return (
        <div className="modal-overlay">
            <div className="modal">
                <h3 className="titling">{title}</h3>
                <p>{message}</p>
                <div className="form-actions">
                    <button className="btn-sm" onClick={onCancel}>Annuleer</button>
                    <button className="btn-sm btn-danger" onClick={onConfirm}>Bevestig</button>
                </div>
            </div>
        </div>
    );
};

