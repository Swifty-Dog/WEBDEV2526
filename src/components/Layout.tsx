import React, { useState, useCallback, type FC } from 'react';
import { useLocation } from 'react-router-dom';
import { Topbar } from './Topbar';
import { Sidebar } from './Sidebar';
import '../styles/_layout.css';
import '../styles/global.css';

interface LayoutProps {
    children: React.ReactNode;
    isLoggedIn: boolean;
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
    userRole: string | null;
}

export const Layout: FC<LayoutProps> = ({ children, isLoggedIn, setIsLoggedIn, userRole }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
    const activePath = useLocation().pathname;

    const toggleSidebar = useCallback(() => {
        setIsSidebarOpen(prev => !prev);
    }, []);

    const handleLogout = useCallback(() => {
        setIsLoggedIn(false);
    }, [setIsLoggedIn]);

    const containerClass = `container`;
    const isSidebarAvailable = isLoggedIn;

    return (
        <>
            <Topbar
                isLoggedIn={isLoggedIn}
                toggleSidebar={isSidebarAvailable ? toggleSidebar : undefined}
            />

            <div className={containerClass}>
                {isSidebarAvailable && (
                    <Sidebar
                        isVisible={isSidebarOpen && isSidebarAvailable}
                        activePath={activePath}
                        onLogout={handleLogout}
                        userRole={userRole}
                    />
                )}

                <main className="main-content">
                    {children}
                </main>
            </div>
        </>
    );
};
