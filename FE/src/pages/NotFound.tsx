import {type FC, useEffect} from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const NotFound: FC = () => {
    const { t } = useTranslation('common');
    const navigate = useNavigate();

    useEffect(() => {
        document.title = t('notFound.title') + " | " + import.meta.env.VITE_APP_NAME;
    }, [t]);

    return (
        <div className="not-found">
            <h1>{t('notFound.title')}</h1>
            <p>{t('notFound.message')}</p>
            <button
                className="button-primary" id="button-error"
                onClick={() => navigate('/')}
            >
                {t('general.buttonHome')}
            </button>
        </div>
    );
};
