
export interface Notification {
    id: string;
    userId: string;
    title: string;
    body: string;
    type: 'system' | 'tribe' | 'academy' | 'social';
    read: boolean;
    createdAt: string;
    actionUrl?: string;
    category?: 'archived' | 'normal' | string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        userId: 'current',
        title: '¡Bienvenido a V3!',
        body: 'Has migrado exitosamente a la nueva arquitectura. Disfruta de una experiencia más rápida.',
        type: 'system',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(), // 2 mins ago
    },
    {
        id: '2',
        userId: 'current',
        title: 'Tu Tribu está lista',
        body: 'Hemos seleccionado 10 cuentas nuevas para ti este mes. ¡Conéctate ahora!',
        type: 'tribe',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
        actionUrl: '/dashboard'
    },
    {
        id: '3',
        userId: 'current',
        title: 'Nuevo curso disponible',
        body: 'Aprende a dominar el algoritmo de Instagram en nuestra nueva Masterclass.',
        type: 'academy',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        actionUrl: '/academy'
    }
];

export const NotificationService = {
    getNotifications: async (userId: string): Promise<Notification[]> => {
        // TODO: Connect to Firestore 'notifications' collection
        // For now, return mock data + persistent local storage
        const key = `v3_notifications_${userId}`;
        const stored = localStorage.getItem(key);

        if (stored) {
            return JSON.parse(stored);
        }

        return MOCK_NOTIFICATIONS;
    },

    markAsRead: async (userId: string, notificationId: string): Promise<boolean> => {
        const notifications = await NotificationService.getNotifications(userId);
        const updated = notifications.map(n =>
            n.id === notificationId ? { ...n, read: true } : n
        );

        const key = `v3_notifications_${userId}`;
        localStorage.setItem(key, JSON.stringify(updated));

        return true;
    },

    getUnreadCount: async (userId: string): Promise<number> => {
        const notifications = await NotificationService.getNotifications(userId);
        return notifications.filter(n => !n.read).length;
    },

    markAsArchived: async (userId: string, notificationId: string): Promise<boolean> => {
        const notifications = await NotificationService.getNotifications(userId);
        const updated = notifications.map(n =>
            n.id === notificationId ? { ...n, category: 'archived' } : n
        );

        const key = `v3_notifications_${userId}`;
        localStorage.setItem(key, JSON.stringify(updated));

        return true;
    }
};
