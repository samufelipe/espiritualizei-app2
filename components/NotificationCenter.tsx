
import React, { useState, useEffect } from 'react';
import { X, Bell, Heart, MessageCircle, Flame, Info } from 'lucide-react';
import { Notification } from '../types';
import { fetchNotifications, markNotificationAsRead } from '../services/databaseService';
import { getSession } from '../services/authService';

interface NotificationCenterProps {
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const session = getSession();
      if (session?.user?.id) {
        const data = await fetchNotifications(session.user.id);
        setNotifications(data);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    await markNotificationAsRead(id);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'pray': return <Flame size={16} className="text-orange-500" />;
      case 'like': return <Heart size={16} className="text-red-500" />;
      case 'comment': return <MessageCircle size={16} className="text-blue-500" />;
      default: return <Info size={16} className="text-brand-violet" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white dark:bg-brand-dark rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[70vh] animate-slide-up border border-white/10">
        <div className="p-5 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-white/95 dark:bg-brand-dark/95">
          <h3 className="font-bold text-brand-dark dark:text-white flex items-center gap-2">
            <Bell size={18} /> Notificações
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500">
            <X size={16} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <p className="text-center text-xs text-slate-400 py-8">Carregando...</p>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
               <p className="text-sm text-slate-500">Nenhuma notificação nova.</p>
            </div>
          ) : (
            notifications.map(n => (
              <div 
                key={n.id} 
                onClick={() => handleRead(n.id)}
                className={`p-4 rounded-2xl flex gap-3 transition-colors cursor-pointer border ${n.isRead ? 'bg-transparent border-transparent opacity-60' : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 shadow-sm'}`}
              >
                 <div className="mt-1">{getIcon(n.type)}</div>
                 <div>
                    <p className="text-sm text-slate-700 dark:text-slate-200 font-medium leading-tight">{n.content}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                 </div>
                 {!n.isRead && <div className="w-2 h-2 rounded-full bg-brand-violet mt-2 shrink-0" />}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
