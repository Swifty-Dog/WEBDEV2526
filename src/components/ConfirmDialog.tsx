import React from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
    title?: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmDialog: React.FC<Props> = ({ title = 'Confirm', message, onConfirm, onCancel }) => {
    const { t: tCommon } = useTranslation('common');
    return (
        <div className="modal-overlay">
            <div className="modal">
                <h3 className="titling">{title}</h3>
                <p>{message}</p>
                <div className="form-actions">
                    <button className="btn-sm" onClick={onCancel}>{tCommon('general.buttonCancel')}</button>
                    <button className="btn-sm btn-danger" onClick={onConfirm}>{tCommon('general.buttonConfirm')}</button>
                </div>
            </div>
        </div>
    );
};
