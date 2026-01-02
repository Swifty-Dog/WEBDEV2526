import React from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
    onConfirmLeave: () => void;
    onCancel: () => void;
}

export const UnsavedChangesDialog: React.FC<Props> = ({ onConfirmLeave, onCancel }) => {
    const { t } = useTranslation('common');

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h3 className="titling">{t('general.confirmTitle')}</h3>
                <p>{t('general.confirmMessage')}</p>
                <div className="form-actions">
                    <button className="btn-sm" onClick={onCancel}>{t('general.buttonStay')}</button>
                    <button className="btn-sm btn-danger" onClick={onConfirmLeave}>
                        {t('general.buttonLeaveAnyway')}
                    </button>
                </div>
            </div>
        </div>
    );
};
