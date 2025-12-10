import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const RegisterButton: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
    const { t } = useTranslation('common');

    const navigate = useNavigate();
	return (
		<button
			type="button"
			className="header-button"
			style={style}
			onClick={() => navigate('/admin/register')}
		>
            {t('general.buttonRegister')}
		</button>
	);
};
