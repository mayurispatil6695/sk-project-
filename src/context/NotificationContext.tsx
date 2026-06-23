// src/context/NotificationContext.tsx
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import NotificationService, { NotificationItem } from '@/lib/notificationService';
import { useRole } from './RoleContext';
import axios from 'axios';

export type { NotificationItem as Notification };

// ─── Define the shape of the API response ──────────────────────────
interface ApiNotification {
  _id?: string;
  id?: string;
  title?: string;
  message?: string;
  type?: string;
  read?: boolean;
  createdAt?: string;
  metadata?: Record<string, unknown>;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { role } = useRole();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const service = NotificationService;
  const pollInterval = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);

  // Axios client for API calls
  const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  });
  apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('sk_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  // Function to fetch latest notifications from backend and merge with local cache
  const refreshNotifications = useCallback(async () => {
    try {
      const response = await apiClient.get('/notifications');
      const apiNotifs: ApiNotification[] = response.data?.data || response.data || [];
      
      if (Array.isArray(apiNotifs) && apiNotifs.length > 0) {
        const currentIds = new Set(notifications.map(n => n.id));
        let newCount = 0;

        apiNotifs.forEach((notif: ApiNotification) => {
          // Convert backend schema to frontend NotificationItem
          const item: NotificationItem = {
            id: notif._id || notif.id || `api_${Date.now()}_${Math.random()}`,
            title: notif.title || 'New Notification',
            message: notif.message || '',
            type: (notif.type as NotificationItem['type']) || 'system',
            isRead: notif.read || false,
            timestamp: notif.createdAt || new Date().toISOString(),
            metadata: notif.metadata || {},
          };

          // Check if this is a new notification we haven't seen before
          if (!currentIds.has(item.id)) {
            newCount++;
            // Add to local service
            service.addNotification({
              title: item.title,
              message: item.message,
              type: item.type,
              metadata: item.metadata,
            });
            
            // Trigger system notification (OS & Sound)
            service.showSystemNotification(item.title, {
              body: item.message,
              icon: '/favicon.ico',
            });

            // Show toast alert for new items
            toast.info(item.title, {
              description: item.message,
              duration: 5000,
            });
          }
        });

        if (newCount > 0) {
          console.log(`🔔 Added ${newCount} new notifications`);
        }
      }
    } catch (error) {
      console.error('Failed to refresh notifications:', error);
    }
  }, [notifications, service, apiClient]);

  // Load initial notifications and start polling
  useEffect(() => {
    isMounted.current = true;
    // Load from service
    setNotifications(service.getNotifications());

    // Subscribe to service changes
    const unsubscribe = service.subscribe((updated) => {
      if (isMounted.current) {
        setNotifications([...updated]);
      }
    });

    // Immediate fetch on mount
    refreshNotifications();

    // Poll every 10 seconds for new data (REAL-TIME WITHOUT REFRESH)
    if (pollInterval.current) clearInterval(pollInterval.current);
    pollInterval.current = setInterval(() => {
      refreshNotifications();
    }, 300000); // 10 seconds

    return () => {
      isMounted.current = false;
      unsubscribe();
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
        pollInterval.current = null;
      }
    };
  }, [service, refreshNotifications]);

  // Wrappers for service methods
  const addNotification = useCallback((notif: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>) => {
    service.addNotification(notif);
  }, [service]);

  const markAsRead = useCallback((id: string) => {
    service.markAsRead(id);
    // Also call backend to mark read (optional but good)
    apiClient.patch(`/notifications/${id}/read`).catch(() => {});
  }, [service, apiClient]);

  const markAllAsRead = useCallback(() => {
    service.markAllAsRead();
    apiClient.patch('/notifications/read-all').catch(() => {});
  }, [service, apiClient]);

  const removeNotification = useCallback((id: string) => {
    service.deleteNotification(id);
    apiClient.delete(`/notifications/${id}`).catch(() => {});
  }, [service, apiClient]);

  const clearAll = useCallback(() => {
    service.clearAllNotifications();
  }, [service]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
        refresh: refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};