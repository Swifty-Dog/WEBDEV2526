import { useTranslation } from 'react-i18next';

export interface MenuItem {
    id: string;
    label: string;
    icon: string;
    path: string;
}

export const SidebarMenuItems = (): MenuItem[] => {
    const { t } = useTranslation('common');

    return [
        {
            id: 'dashboard',
            label: t('menu.dashboard'),
            icon: '🏠',
            path: '/dashboard',
        },
        {
            id: 'calendar',
            label: t('menu.calendar'),
            icon: '📅',
            path: '/calendar',
        },
        {
            id: 'events',
            label: t('menu.events'),
            icon: '🔔',
            path: '/events',
        },
        {
            id: 'rooms',
            label: t('menu.rooms'),
            icon: '🗄️',
            path: '/rooms'
        },
        {
            id: 'settings',
            label: t('menu.settings'),
            icon: '⚙️',
            path: '/settings',
        },
    ];
};
