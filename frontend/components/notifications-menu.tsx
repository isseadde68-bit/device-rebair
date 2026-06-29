'use client';

import { useState } from 'react';
import { Bell, Check, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useNotifications } from '@/hooks/useNotifications';

export function NotificationsMenu() {
  const { user } = useAuth();
  const { notifications, unreadCount, isLoading, refetch, markAsRead } = useNotifications(!!user);
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen((prev) => !prev);
    refetch();
  };

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="relative p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-300"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[10px] h-2.5 px-0.5 bg-red-500 rounded-full border-2 border-slate-800 text-[8px] font-bold text-white flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-slate-800 rounded-lg shadow-xl py-2 border border-slate-700 z-50">
            <div className="px-4 py-2 border-b border-slate-700 flex items-center justify-between">
              <h3 className="font-semibold text-white">Notifications</h3>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : null}
            </div>

            <div className="flex flex-col">
              {notifications.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-slate-400">
                  Ma jiraan notifications
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`px-4 py-3 border-b border-slate-700 last:border-b-0 hover:bg-slate-700/30 transition-colors ${notif.isRead ? 'opacity-60' : ''}`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="text-sm font-medium text-slate-200">{notif.title}</p>
                        <p className="text-xs text-slate-400 mt-1">{notif.message}</p>
                        <p className="text-[10px] text-slate-500 mt-2">
                          {new Date(notif.date).toLocaleString()}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="text-blue-400 hover:text-blue-300 p-1 shrink-0"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
