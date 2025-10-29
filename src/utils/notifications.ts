/**
 * Notifications Utility
 * Handles toast notifications, alerts, and user feedback
 */

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Notification manager
 */
class NotificationManager {
  private notifications: Map<string, Notification> = new Map();
  private listeners: Set<(notifications: Notification[]) => void> = new Set();

  /**
   * Subscribe to notification changes
   */
  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners
   */
  private notify(): void {
    const notifications = Array.from(this.notifications.values());
    this.listeners.forEach(listener => listener(notifications));
  }

  /**
   * Add notification
   */
  add(notification: Omit<Notification, 'id'>): string {
    const id = `notification-${Date.now()}-${Math.random()}`;
    const fullNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000,
    };

    this.notifications.set(id, fullNotification);
    this.notify();

    // Auto-remove after duration
    if (fullNotification.duration && fullNotification.duration > 0) {
      setTimeout(() => this.remove(id), fullNotification.duration);
    }

    return id;
  }

  /**
   * Remove notification
   */
  remove(id: string): void {
    this.notifications.delete(id);
    this.notify();
  }

  /**
   * Clear all notifications
   */
  clear(): void {
    this.notifications.clear();
    this.notify();
  }

  /**
   * Get all notifications
   */
  getAll(): Notification[] {
    return Array.from(this.notifications.values());
  }

  /**
   * Show success notification
   */
  success(title: string, message?: string, duration?: number): string {
    return this.add({
      type: 'success',
      title,
      message,
      duration,
    });
  }

  /**
   * Show error notification
   */
  error(title: string, message?: string, duration?: number): string {
    return this.add({
      type: 'error',
      title,
      message,
      duration: duration ?? 7000, // Longer duration for errors
    });
  }

  /**
   * Show warning notification
   */
  warning(title: string, message?: string, duration?: number): string {
    return this.add({
      type: 'warning',
      title,
      message,
      duration,
    });
  }

  /**
   * Show info notification
   */
  info(title: string, message?: string, duration?: number): string {
    return this.add({
      type: 'info',
      title,
      message,
      duration,
    });
  }
}

// Export singleton instance
export const notificationManager = new NotificationManager();

/**
 * Hook for using notifications in React
 */
export function useNotifications() {
  return {
    success: (title: string, message?: string) => notificationManager.success(title, message),
    error: (title: string, message?: string) => notificationManager.error(title, message),
    warning: (title: string, message?: string) => notificationManager.warning(title, message),
    info: (title: string, message?: string) => notificationManager.info(title, message),
    remove: (id: string) => notificationManager.remove(id),
    clear: () => notificationManager.clear(),
  };
}

/**
 * Browser notification helper
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('Browser does not support notifications');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    return await Notification.requestPermission();
  }

  return 'denied';
}

/**
 * Send browser notification
 */
export function sendBrowserNotification(
  title: string,
  options?: NotificationOptions
): globalThis.Notification | null {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return null;
  }

  return new Notification(title, options);
}

/**
 * Send article notification
 */
export function notifyNewArticle(
  title: string,
  source: string,
  _articleUrl: string
): globalThis.Notification | null {
  return sendBrowserNotification(`New article from ${source}`, {
    body: title,
    icon: '/logo.png',
    badge: '/badge.png',
    tag: 'article-notification',
    requireInteraction: false,
  });
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  enabled: boolean;
  frequency: 'realtime' | 'daily' | 'weekly';
  categories: {
    regulatory: boolean;
    market: boolean;
    technology: boolean;
    claims: boolean;
    underwriting: boolean;
  };
  quiet_hours?: {
    enabled: boolean;
    start: string; // HH:MM
    end: string; // HH:MM
  };
}

/**
 * Check if in quiet hours
 */
export function isInQuietHours(preferences: NotificationPreferences): boolean {
  if (!preferences.quiet_hours?.enabled) {
    return false;
  }

  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const start = preferences.quiet_hours.start;
  const end = preferences.quiet_hours.end;

  if (start < end) {
    return currentTime >= start && currentTime < end;
  } else {
    // Quiet hours span midnight
    return currentTime >= start || currentTime < end;
  }
}

/**
 * Should send notification based on preferences
 */
export function shouldSendNotification(
  preferences: NotificationPreferences,
  category: keyof NotificationPreferences['categories']
): boolean {
  if (!preferences.enabled) {
    return false;
  }

  if (!preferences.categories[category]) {
    return false;
  }

  if (isInQuietHours(preferences)) {
    return false;
  }

  return true;
}

