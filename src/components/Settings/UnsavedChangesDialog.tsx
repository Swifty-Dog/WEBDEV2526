import React from 'react';

interface Props {
    onConfirmLeave: () => void;
    onCancel: () => void;
}

export const UnsavedChangesDialog: React.FC<Props> = ({ onConfirmLeave, onCancel }) => {
    return (
        <div className="modal-overlay">
            <div className="modal">
                <h3 className="titling">Unsaved Changes</h3>
                <p>You have unsaved changes. Are you sure you want to leave this page?</p>
                <div className="form-actions">
                    <button className="btn-sm" onClick={onCancel}>Stay</button>
                    <button className="btn-sm btn-danger" onClick={onConfirmLeave}>
                        Leave Anyway
                    </button>
                </div>
            </div>
        </div>
    );
};
