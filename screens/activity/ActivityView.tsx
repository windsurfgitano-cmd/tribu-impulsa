import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Bell, X } from 'lucide-react';
import { useSurveyGuard } from '../../hooks/useSurveyGuard';
import {
  ActivityItem,
  getStoredActivities,
  persistActivities,
  getArchivedActivities,
  archiveActivity,
  restoreActivity
} from '../../services/activityStorage';

export const ActivityView = () => {
  useSurveyGuard();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<ActivityItem[]>(() => getStoredActivities());
  const [archivedActivities, setArchivedActivities] = useState<ActivityItem[]>(() => getArchivedActivities());
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [expandedItem, setExpandedItem] = useState<ActivityItem | null>(null);

  // Persistir cambios
  useEffect(() => {
    persistActivities(activities);
  }, [activities]);

  const filteredActivities = filter === 'unread'
    ? activities.filter(a => !a.isRead)
    : filter === 'archived'
      ? archivedActivities
      : activities;

  const unreadCount = activities.filter(a => !a.isRead).length;

  const markAsRead = (id: string) => {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
  };

  const markAllAsRead = () => {
    setActivities(prev => prev.map(a => ({ ...a, isRead: true })));
  };

  // Archivar en vez de borrar
  const handleArchive = (id: string) => {
    const activity = activities.find(a => a.id === id);
    if (activity) {
      archiveActivity(activity);
      setActivities(prev => prev.filter(a => a.id !== id));
      setArchivedActivities(getArchivedActivities());
    }
  };

  // Restaurar actividad archivada
  const handleRestore = (id: string) => {
    const activity = restoreActivity(id);
    if (activity) {
      setActivities(prev => [activity, ...prev]);
      setArchivedActivities(getArchivedActivities());
    }
  };

  return (
    <div className="pb-32 animate-fadeIn min-h-screen bg-[#F5F7FB]">
      <header className="px-6 pb-4 sticky top-0 z-30 backdrop-blur-xl bg-white/90 border-b border-[#E4E7EF] shadow-sm"
        style={{ paddingTop: 'max(16px, env(safe-area-inset-top, 16px))' }}
      >
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold flex items-center gap-2 text-[#181B34]">
            <Bell className="text-[#6161FF]" /> Actividad
            {unreadCount > 0 && (
              <span className="bg-[#FB275D] text-white text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>
            )}
          </h1>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-[#6161FF] hover:underline"
              >
                Marcar leído
              </button>
            )}
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${filter === 'all' ? 'bg-[#6161FF] text-white' : 'bg-[#F5F7FB] text-[#7C8193]'
              }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${filter === 'unread' ? 'bg-[#6161FF] text-white' : 'bg-[#F5F7FB] text-[#7C8193]'
              }`}
          >
            Sin leer ({unreadCount})
          </button>
          {archivedActivities.length > 0 && (
            <button
              onClick={() => setFilter('archived')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${filter === 'archived' ? 'bg-[#7C8193] text-white' : 'bg-[#F5F7FB] text-[#7C8193]'
                }`}
            >
              Archivadas ({archivedActivities.length})
            </button>
          )}
        </div>
      </header>

      <div className="px-4 py-4 space-y-3">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-[#7C8193]">No hay actividades {filter === 'unread' ? 'sin leer' : ''}</p>
          </div>
        ) : (
          filteredActivities.map((item) => (
            <div
              key={item.id}
              className={`bg-white p-4 rounded-2xl flex gap-4 items-start group hover:shadow-md transition-all border cursor-pointer ${item.isRead ? 'border-[#E4E7EF]' : 'border-[#6161FF]/30 bg-[#6161FF]/5'
                }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Abrir modal para ver completo
                setExpandedItem(item);
              }}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl ${item.color}`}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2 mb-1">
                  <h3 className={`font-semibold text-sm ${item.isRead ? 'text-[#434343]' : 'text-[#181B34]'}`}>
                    {item.title}
                  </h3>
                  <span className="text-[0.625rem] text-[#7C8193] whitespace-nowrap">{item.timestamp}</span>
                </div>
                <p className="text-xs text-[#7C8193] leading-relaxed line-clamp-2">{item.description}</p>
                <span className="text-[0.625rem] text-[#6161FF] mt-1 inline-block">Tocar para ver más →</span>
              </div>
              {filter === 'archived' ? (
                <button
                  onClick={(e) => { e.stopPropagation(); handleRestore(item.id); }}
                  className="text-[#00CA72] hover:text-[#008A4E] transition p-1 text-xs"
                >
                  Restaurar
                </button>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); handleArchive(item.id); }}
                  className="opacity-0 group-hover:opacity-100 text-[#7C8193] hover:text-[#FB275D] transition p-1"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal para ver actividad completa */}
      {expandedItem && createPortal(
        <div
          className="fixed inset-0 bg-black/50 z-[99999] flex items-end justify-center animate-fadeIn backdrop-blur-sm"
          onClick={() => {
            markAsRead(expandedItem.id);
            setExpandedItem(null);
          }}
        >
          <div
            className="bg-white w-full max-w-lg rounded-t-3xl p-6 animate-slideUp max-h-[80vh] overflow-y-auto"
            style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl ${expandedItem.color}`}>
                {expandedItem.icon}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-[#181B34]">{expandedItem.title}</h2>
                <p className="text-xs text-[#7C8193]">{expandedItem.timestamp}</p>
              </div>
              <button
                onClick={() => {
                  markAsRead(expandedItem.id);
                  setExpandedItem(null);
                }}
                className="text-[#7C8193] hover:text-[#181B34] p-1"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="text-sm text-[#434343] leading-relaxed whitespace-pre-wrap mb-6">
              {expandedItem.description}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {expandedItem.actionUrl && (
                <button
                  onClick={() => {
                    markAsRead(expandedItem.id);
                    navigate(expandedItem.actionUrl!);
                    setExpandedItem(null);
                  }}
                  className="flex-1 bg-[#6161FF] text-white py-3 rounded-xl font-medium hover:opacity-90 transition"
                >
                  Ir a ver →
                </button>
              )}
              <button
                onClick={() => {
                  markAsRead(expandedItem.id);
                  setExpandedItem(null);
                }}
                className={`${expandedItem.actionUrl ? '' : 'flex-1'} px-6 py-3 rounded-xl font-medium border border-[#E4E7EF] text-[#7C8193] hover:bg-[#F5F7FB] transition`}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

