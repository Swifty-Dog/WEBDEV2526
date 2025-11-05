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
                <h3 style={{ marginTop: 0 }}>{title}</h3>
                <p>{message}</p>
                <div className="form-actions">
                    <button className="btn-sm" onClick={onCancel}>Cancel</button>
                    <button className="btn-sm btn-danger" onClick={onConfirm}>Delete</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
