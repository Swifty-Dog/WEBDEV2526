import React from 'react';
import { useTranslation } from 'react-i18next';
import { SidebarMenuItems, type MenuItem } from '../data/SidebarMenuItems.ts';
import { Link } from 'react-router-dom';
import { useSettings } from '../config/SettingsContext.ts';
import '../styles/_layout.css';

interface SidebarProps {
    isVisible: boolean;
    activePath: string;
    onLogout: () => void;
    userRole: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ isVisible, activePath, onLogout, userRole }) => {
    const { t } = useTranslation('common');
    const sidebarMenuItems = SidebarMenuItems();
    const { updateSettings } = useSettings();
    const sidebarClass = `sidebar ${isVisible ? 'visible' : ''}`;

    const handleLogoutClick = (e: React.MouseEvent) => {
        e.preventDefault();
        updateSettings({
            theme: 'Light',
            fontSize: 'Medium',
            accentColor: 'Blue',
            defaultCalendarView: 'Week',
            language: 'English'
        });
        onLogout();
    }

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
                            {t('menu.adminDashboard')}
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
                        {t('menu.logout')}
                    </a>
                </li>
            </ul>
        </nav>
    );
};
