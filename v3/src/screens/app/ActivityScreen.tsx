
import React, { useEffect, useState } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Heart, Star, Bell, BookOpen, X, CheckCheck } from 'lucide-react';
import { NotificationService } from '../../services/api/notifications';
import type { Notification } from '../../services/api/notifications';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const ActivityScreen: React.FC = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [activities, setActivities] = useState<Notification[]>([]);
    const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadActivities();
    }, [currentUser]);

    const loadActivities = async () => {
        if (currentUser) {
            const data = await NotificationService.getNotifications(currentUser.uid);
            const sorted = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setActivities(sorted);
        }
        setLoading(false);
    };

    // Filter Logic
    const filteredActivities = activities.filter(a => {
        if (filter === 'unread') return !a.read;
        if (filter === 'archived') return a.category === 'archived'; // Using category as archive flag or similar
        // For V3, we might need a dedicated 'archived' field if it doesn't exist, 
        // or repurpose 'read' + filter.
        // Assuming V2 logic: Archive is a separate state.
        // If Notification interface doesn't have 'archived', we will mock it locally or add it.
        // For now, let's assume 'read' = basic history, and we need a way to 'hide'/archive.
        return filter === 'all' ? true : true;
    });

    // Better filter implementation if we modify the type later. 
    // For now, let's simulate Archive with local state or just filter by 'read' vs 'unread' 
    // to strictly match the "All / Unread" parity first, and add "Archive" visuals.

    const handleMarkAllRead = async () => {
        if (!currentUser) return;
        // In a real app, batch update. For now, optimize UI optimism.
        const unreadIds = activities.filter(a => !a.read).map(a => a.id);
        unreadIds.forEach(id => NotificationService.markAsRead(currentUser.uid, id));
        setActivities(prev => prev.map(n => ({ ...n, read: true })));
    };

    const handleArchive = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        // Mock archiving by removing from view or updating a flag
        // NotificationService might not support 'archive' yet.
        // V2 parity requirement implies we should have it.
        // For this step, we'll just hide it from the main list.
        setActivities(prev => prev.filter(n => n.id !== id));
    };

    const handleClick = async (notification: Notification) => {
        if (!currentUser) return;
        if (!notification.read) {
            await NotificationService.markAsRead(currentUser.uid, notification.id);
            setActivities(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
        }
        if (notification.actionUrl) navigate(notification.actionUrl);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'tribe': return <Heart size={18} />;
            case 'academy': return <BookOpen size={18} />;
            case 'system': return <Star size={18} />;
            default: return <Bell size={18} />;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'tribe': return 'bg-pink-50 text-pink-600';
            case 'academy': return 'bg-blue-50 text-blue-600';
            case 'system': return 'bg-yellow-50 text-yellow-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Cargando actividad...</div>;

    const unreadCount = activities.filter(n => !n.read).length;

    return (
        <div className="p-4 pb-24 min-h-screen bg-[#F5F7FB]">
            {/* Header V2 Style */}
            <div className="sticky top-0 z-10 bg-[#F5F7FB]/90 backdrop-blur-sm pb-2">
                <div className="flex justify-between items-center mb-4 pt-2">
                    <h1 className="text-xl font-bold flex items-center gap-2 text-[#181B34]">
                        <Bell className="text-[#6161FF]" size={20} /> Actividad
                        {unreadCount > 0 && (
                            <span className="bg-[#FB275D] text-white text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>
                        )}
                    </h1>
                    {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} className="text-xs text-[#6161FF] font-medium flex items-center gap-1">
                            <CheckCheck size={14} /> Marcar todo leído
                        </button>
                    )}
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-2 overflow-x-auto">
                    {(['all', 'unread', 'archived'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`
                                px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap
                                ${filter === f
                                    ? 'bg-[#6161FF] text-white shadow-md shadow-blue-500/20'
                                    : 'bg-white text-[#7C8193] border border-[#E4E7EF]'}
                            `}
                        >
                            {f === 'all' ? 'Todas' : f === 'unread' ? 'Sin leer' : 'Archivadas'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                {filteredActivities.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-4xl mb-3 grayscale opacity-50">📭</div>
                        <p className="text-[#7C8193] text-sm">No hay actividades en esta vista</p>
                    </div>
                ) : (
                    filteredActivities.map(notification => (
                        <GlassCard
                            key={notification.id}
                            onClick={() => handleClick(notification)}
                            className={`
                                relative group flex items-start gap-4 p-4 cursor-pointer transition-all border
                                ${notification.read
                                    ? 'bg-white border-[#E4E7EF]'
                                    : 'bg-[#6161FF]/5 border-[#6161FF]/30'}
                                hover:shadow-md
                            `}
                        >
                            <div className={`p-3 rounded-xl ${getColor(notification.type)} flex-shrink-0`}>
                                {getIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className={`font-semibold text-sm truncate pr-6 ${notification.read ? 'text-[#434343]' : 'text-[#181B34]'}`}>
                                        {notification.title}
                                    </h4>
                                    <span className="text-[10px] text-[#7C8193] whitespace-nowrap flex-shrink-0">
                                        {new Date(notification.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-xs text-[#7C8193] leading-relaxed line-clamp-2">{notification.body}</p>
                            </div>

                            {/* Archive Action (V2 Style) */}
                            <button
                                onClick={(e) => handleArchive(e, notification.id)}
                                className="absolute right-2 bottom-2 p-1.5 text-[#7C8193] hover:text-[#FB275D] opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Archivar"
                            >
                                <X size={14} />
                            </button>
                        </GlassCard>
                    ))
                )}
            </div>
        </div>
    );
};
