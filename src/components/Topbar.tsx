// src/components/Topbar.tsx

import { type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/_components.css';
import '../styles/_layout.css';
import '../styles/global.css';

interface TopBarProps {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    isLoggedIn: boolean;
    toggleSidebar: (() => void) | undefined;
}

const ThemeToggle: FC<Pick<TopBarProps, 'theme' | 'toggleTheme'>> = ({ theme, toggleTheme }) => (
    <button className="header-button" onClick={toggleTheme}>
        <span className="theme-toggle">{theme === 'dark' ? '☀️' : '🌙'}</span>
    </button>
);

export const Topbar: FC<TopBarProps> = ({ theme, toggleTheme, isLoggedIn, toggleSidebar }) => {
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