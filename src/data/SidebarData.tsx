export interface MenuItem {
    id: string;
    label: string;
    icon: string;
    path: string;
}

export const sidebarMenuItems: MenuItem[] = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: '🏠',
        path: '/dashboard',
    },
    {
        id: 'calendar',
        label: 'Kalender',
        icon: '📅',
        path: '/calendar',
    },
    {
        id: 'events',
        label: 'Evenementen',
        icon: '🔔',
        path: '/events',
    },
    {
        id: 'settings',
        label: 'Instellingen',
        icon: '⚙️',
        path: '/settings',
    },
];