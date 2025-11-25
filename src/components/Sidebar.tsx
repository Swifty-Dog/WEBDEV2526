import React from 'react';
import { sidebarMenuItems, type MenuItem } from '../data/SidebarData.ts';
import { Link } from 'react-router-dom';
import { useTheme } from '../config/ThemeContext';
import '../styles/_layout.css';

interface SidebarProps {
    isVisible: boolean;
    activePath: string;
    onLogout: () => void;
    userRole: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ isVisible, activePath, onLogout, userRole }) => {
    const { setTheme } = useTheme();
    const sidebarClass = `sidebar ${isVisible ? 'visible' : ''}`;

    const handleLogoutClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setTheme('Light');

        onLogout();
    };

    return (
        <nav className={sidebarClass}>
            <ul className="sidebar-menu">
                {userRole && (userRole.toLowerCase() === 'admin' || userRole.toLowerCase() === 'manager') && (
                    <li>
                        <Link
                            to="/admin-dashboard"
                            className={`menu-item ${activePath === '/admin-dashboard' ? 'active' : ''}`}
                        >
                            <span className="icon">🛠️</span>
                            Admin Dashboard
                        </Link>
                    </li>
                )}

                {sidebarMenuItems.map((item: MenuItem) => {
                    const isActive = activePath === item.path;
                    return (
                        <li key={item.id}>
                            <Link
                                to={item.path}
                                className={`menu-item ${isActive ? 'active' : ''}`}
                            >
                                <span className="icon">{item.icon}</span>
                                {item.label}
                            </Link>
                        </li>
                    );
                })}

                <li className="logout-item">
                    <a href="/"
                       className="menu-item"
                       onClick={handleLogoutClick}
                    >
                        <span className="icon">🚪</span>
                        Uitloggen
                    </a>
                </li>

            </ul>
        </nav>
    );
};
