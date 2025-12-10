import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const TerminateNavButton: React.FC = () => {
    const { t } = useTranslation('admin');

    const navigate = useNavigate();
    return (
        <button
            type="button"
            className="header-button header-button-danger"
            id="extra-margins"
            onClick={() => navigate('/admin/terminate')}
        >
            {t('terminateEmployee.title')}
        </button>
    );
}
