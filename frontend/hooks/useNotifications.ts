'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  date: string;
}

export function useNotifications(enabled = true) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = useCallback(() => {
    if (!enabled) return Promise.resolve([]);
    setIsLoading(true);
    return apiFetch('/api/notifications', { method: 'GET' })
      .then((data) => {
        setNotifications(data.notifications || []);
        return data.notifications as AppNotification[];
      })
      .catch(() => {
        setNotifications([]);
        return [];
      })
      .finally(() => setIsLoading(false));
  }, [enabled]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = (id: string) => {
    return apiFetch(`/api/notifications/${id}/read`, { method: 'POST' }).then(() => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    });
  };

  return {
    notifications,
    isLoading,
    unreadCount: notifications.filter((n) => !n.isRead).length,
    refetch: fetchNotifications,
    markAsRead,
  };
}
