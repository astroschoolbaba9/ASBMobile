// mobile-app/src/context/NotificationContext.tsx
// Real-Time Notification Gateway (In-App Center + Web Browser Notification API + Native Push Service)

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { crystalApi, getStoredToken } from '../api/client';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'cosmic' | 'course' | 'system';
  read: boolean;
  timestamp: string;
  link?: string;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  drawerOpen: boolean;
  pushToken: string;
  setDrawerOpen: (open: boolean) => void;
  addNotification: (item: Omit<AppNotification, 'id' | 'read' | 'timestamp'>) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotifications: () => Promise<void>;
  requestPushPermission: () => Promise<boolean>;
}

const STORAGE_KEY = 'asb_user_notifications';

async function getStoredNotifications(): Promise<AppNotification[]> {
  try {
    if (Platform.OS === 'web') {
      const val = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      return val ? JSON.parse(val) : [];
    } else {
      const val = await SecureStore.getItemAsync(STORAGE_KEY);
      return val ? JSON.parse(val) : [];
    }
  } catch (e) {
    return [];
  }
}

async function saveStoredNotifications(items: AppNotification[]): Promise<void> {
  try {
    const val = JSON.stringify(items);
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, val);
    } else {
      await SecureStore.setItemAsync(STORAGE_KEY, val);
    }
  } catch (e) {
    console.warn('Failed to save notifications:', e);
  }
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Fetch backend notifications for authenticated users
  const syncBackendNotifications = useCallback(async () => {
    try {
      const token = await getStoredToken();
      if (!token) return; // Only fetch if user is logged in

      const res = await crystalApi.get('/api/notifications');
      if (res.data?.success && Array.isArray(res.data.notifications)) {
        const mapped: AppNotification[] = res.data.notifications.map((n: any) => ({
          id: n._id || n.id,
          title: n.title,
          message: n.message,
          type: n.type || 'system',
          read: !!n.read,
          timestamp: n.createdAt || new Date().toISOString(),
          link: n.link || '',
        }));
        setNotifications(mapped);
        saveStoredNotifications(mapped);
      }
    } catch (e) {
      // Fallback silently to local storage
    }
  }, []);

  useEffect(() => {
    getStoredNotifications().then((initial) => {
      if (initial && initial.length > 0) {
        setNotifications(initial);
      } else {
        const welcome: AppNotification = {
          id: 'welcome-1',
          title: '✨ Welcome to ASB Numerology',
          message: 'Your personal cosmic journey begins. Explore high-vibration crystals and daily numerology reports.',
          type: 'system',
          read: false,
          timestamp: new Date().toISOString(),
        };
        setNotifications([welcome]);
        saveStoredNotifications([welcome]);
      }
    });

    // Prompt notification permission on app launch
    requestPushPermission();

    syncBackendNotifications();
    const interval = setInterval(syncBackendNotifications, 30000); // 30s live sync interval
    return () => clearInterval(interval);
  }, [syncBackendNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const triggerSystemNotification = async (title: string, message: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification(title, { body: message });
        } catch (e) {}
      }
    } else {
      try {
        const ExpoNotifications = require('expo-notifications');
        if (ExpoNotifications && typeof ExpoNotifications.scheduleNotificationAsync === 'function') {
          ExpoNotifications.setNotificationHandler({
            handleNotification: async () => ({
              shouldShowAlert: true,
              shouldPlaySound: true,
              shouldSetBadge: true,
            }),
          });
          await ExpoNotifications.scheduleNotificationAsync({
            content: {
              title,
              body: message,
              sound: true,
              priority: 'high',
            },
            trigger: null,
          });
        }
      } catch (e) {
        // Fallback for environment without expo-notifications
      }
    }
  };

  const [pushToken, setPushToken] = useState<string>('');

  const requestPushPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      return perm === 'granted';
    } else {
      try {
        const ExpoNotifications = require('expo-notifications');
        const ExpoConstants = require('expo-constants');

        if (ExpoNotifications && typeof ExpoNotifications.requestPermissionsAsync === 'function') {
          const { status } = await ExpoNotifications.requestPermissionsAsync();
          if (status === 'granted' && typeof ExpoNotifications.getExpoPushTokenAsync === 'function') {
            try {
              const projectId =
                ExpoConstants?.default?.expoConfig?.extra?.eas?.projectId ||
                ExpoConstants?.expoConfig?.extra?.eas?.projectId ||
                'c36eca41-6b5d-431d-8339-f174e4e0c6d7';
              const tokenRes = await ExpoNotifications.getExpoPushTokenAsync({ projectId });
              if (tokenRes?.data) {
                setPushToken(tokenRes.data);
                console.log('📱 EXPO PUSH TOKEN REGISTERED:', tokenRes.data);
                try {
                  await crystalApi.post('/api/auth/push-token', {
                    pushToken: tokenRes.data,
                    platform: Platform.OS,
                  });
                } catch (e) {
                  console.warn('Failed to sync push token with backend:', e);
                }
              }
            } catch (err) {}
          }
          return status === 'granted';
        }
      } catch (e) {}
    }
    return true;
  };

  const addNotification = useCallback(async (item: Omit<AppNotification, 'id' | 'read' | 'timestamp'>) => {
    const newItem: AppNotification = {
      ...item,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      read: false,
      timestamp: new Date().toISOString(),
    };

    setNotifications((prev) => {
      const updated = [newItem, ...prev];
      saveStoredNotifications(updated);
      return updated;
    });

    triggerSystemNotification(item.title, item.message);
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      saveStoredNotifications(updated);
      return updated;
    });

    try {
      await crystalApi.patch(`/api/notifications/${id}/read`);
    } catch (e) {}
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      saveStoredNotifications(updated);
      return updated;
    });

    try {
      await crystalApi.patch('/api/notifications/read-all');
    } catch (e) {}
  }, []);

  const clearNotifications = useCallback(async () => {
    setNotifications([]);
    saveStoredNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        drawerOpen,
        pushToken,
        setDrawerOpen,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        requestPushPermission,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return ctx;
};
