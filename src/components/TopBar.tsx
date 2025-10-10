import { type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/_buttons.css';
import '../styles/TopBar.css';
import '../styles/Layout.css';
import '../styles/global.css';

interface TopBarProps {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    isLoggedIn: boolean;
}

const ThemeToggle: FC<Pick<TopBarProps, 'theme' | 'toggleTheme'>> = ({ theme, toggleTheme }) => (
    <button className="header-button" onClick={toggleTheme}>
        <span className="theme-toggle">{theme === 'dark' ? '☀️' : '🌙'}</span>
    </button>
);

export const TopBar: FC<TopBarProps> = ({ theme, toggleTheme, isLoggedIn }) => {
    const navigate = useNavigate();

    const handleLoginClick = () => {
        navigate('/login');
    };

    return (
        <div className="upper-border">
            <h1>Office Calendar</h1>

            <div className="top-bar-controls">
                {!isLoggedIn && (
                    <button
                        className="header-button"
                        onClick={handleLoginClick}
                    >
                        Login
                    </button>
                )}
                <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            </div>
        </div>
    );
};