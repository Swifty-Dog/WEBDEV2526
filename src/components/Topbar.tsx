import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import '../styles/_components.css';
import '../styles/_layout.css';
import '../styles/global.css';

interface TopBarProps {
    isLoggedIn: boolean;
    toggleSidebar: (() => void) | undefined;
}

export const Topbar: FC<TopBarProps> = ({ isLoggedIn, toggleSidebar }) => {
    const { t } = useTranslation('common');
    const navigate = useNavigate();

    const handleLoginClick = () => {
        navigate('/');
    };

    return (
        <div className="upper-border">
            {toggleSidebar ? (
                <button
                    className="header-button menu-toggle"
                    onClick={toggleSidebar}
                >
                    ☰
                </button>
            ) : (
                <div style={{ width: '4rem', height: '1rem' }} />
            )}

            <h1>Calendify</h1>

            <div className="top-bar-controls">
                {!isLoggedIn && (
                    <button
                        className="header-button"
                        onClick={handleLoginClick}
                    >
                        {t('general.buttonLogin')}
                    </button>
                )}
            </div>
        </div>
    );
};
