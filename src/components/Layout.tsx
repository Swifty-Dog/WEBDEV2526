import React, { useState, useCallback, type FC } from 'react';
import { handleLogout } from '../config/ApiRequest';
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
    setUserRole: React.Dispatch<React.SetStateAction<string | null>>;
}

export const Layout: FC<LayoutProps> = ({ children, isLoggedIn, setIsLoggedIn, userRole, setUserRole }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
    const activePath = useLocation().pathname;

    const toggleSidebar = useCallback(() => {
        setIsSidebarOpen(prev => !prev);
    }, []);

    const logout = useCallback(() =>{
        handleLogout();

        setIsLoggedIn(false);
        setUserRole(null);
    }, [setIsLoggedIn, setUserRole]);

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
                        onLogout={logout}
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
