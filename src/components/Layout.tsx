import { type FC, type ReactNode } from 'react';
import { TopBar } from './TopBar';

interface LayoutProps {
    children: ReactNode;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    isLoggedIn: boolean;
}

export const Layout: FC<LayoutProps> = ({ children, theme, toggleTheme, isLoggedIn }) => {
    return (
        <div className="app-container">
            <TopBar theme={theme} toggleTheme={toggleTheme} isLoggedIn={isLoggedIn} />
            <main className="content">
                {children}
            </main>
        </div>
    );
};