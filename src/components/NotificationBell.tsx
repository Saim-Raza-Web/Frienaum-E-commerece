'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, X, Check, Package, Store, CheckCircle, XCircle, Trash2 } from 'lucide-react';

interface Notification {
  id: string;
  type:
    | 'PRODUCT_SUBMITTED'
    | 'PRODUCT_APPROVED'
    | 'PRODUCT_REJECTED'
    | 'MERCHANT_REGISTERED'
    | 'ORDER_PLACED';
  title: string;
  message: string;
  data?: {
    productId?: string;
    productTitle?: string;
    merchantId?: string;
    merchantName?: string;
    storeName?: string;
    orderId?: string;
    customerName?: string;
    currency?: string;
    totalAmount?: string;
  };
  isRead: boolean;
  createdAt: string;
}

interface NotificationBellProps {
  userRole: 'ADMIN' | 'MERCHANT';
}

export default function NotificationBell({ userRole }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedNotificationId, setExpandedNotificationId] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);
  const [popupNotification, setPopupNotification] = useState<Notification | null>(null);
  const previousNotificationIdsRef = useRef<Set<string>>(new Set());
  const lastFetchTimeRef = useRef<number>(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const popupTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchNotifications = useCallback(async (showLoading: boolean = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      const response = await fetch('/api/notifications?limit=20', {
        credentials: 'include',
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch notifications (${response.status})`);
      }

      const data = await response.json();
      const newNotifications = data.notifications || [];
      const currentTime = Date.now();
      
      // Detect new notifications by comparing with previous set
      // Check for notifications that are:
      // 1. Not in previous set (newly created)
      // 2. Unread
      // 3. Created recently (within last 2 minutes to catch notifications created between polls)
      const newNotification = newNotifications.find((n: Notification) => {
        const isNew = !previousNotificationIdsRef.current.has(n.id);
        const isUnread = !n.isRead;
        const notificationTime = new Date(n.createdAt).getTime();
        // Check if notification was created after last fetch time, or within last 2 minutes
        const isRecent = notificationTime > (lastFetchTimeRef.current - 120000); // Within last 2 minutes
        
        // Show popup if: it's new AND unread AND (recent OR this is first load)
        if (isNew && isUnread) {
          if (previousNotificationIdsRef.current.size === 0) {
            // First load - only show the most recent unread notification
            return n === newNotifications.find((nn: Notification) => !nn.isRead);
          }
          return isRecent;
        }
        return false;
      });
      
      if (newNotification) {
        console.log('New notification detected for popup:', newNotification);
        // Show popup for new notification
        setPopupNotification(newNotification);
        
        // Auto-hide popup after 5 seconds
        if (popupTimeoutRef.current) {
          clearTimeout(popupTimeoutRef.current);
        }
        popupTimeoutRef.current = setTimeout(() => {
          setPopupNotification(null);
        }, 5000);
      }
      
      // Update previous notification IDs and last fetch time
      previousNotificationIdsRef.current = new Set(newNotifications.map((n: Notification) => n.id));
      lastFetchTimeRef.current = currentTime;
      setNotifications(newNotifications);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Poll for new notifications every 15 seconds (reduced for faster detection)
    pollIntervalRef.current = setInterval(fetchNotifications, 15000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      if (popupTimeoutRef.current) {
        clearTimeout(popupTimeoutRef.current);
      }
    };
  }, [fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (notificationIds: string[]) => {
    if (!notificationIds.length) return;
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ notificationIds })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        console.error('Failed to mark notifications as read:', data);
        return;
      }

      setNotifications(prev =>
        prev.map(n =>
          notificationIds.includes(n.id) ? { ...n, isRead: true } : n
        )
      );
      if (typeof data.unreadCount === 'number') {
        setUnreadCount(data.unreadCount);
      } else {
        setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
      }
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ markAllRead: true })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        console.error('Failed to mark all as read:', data);
        return;
      }

      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(typeof data.unreadCount === 'number' ? data.unreadCount : 0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const deleteNotifications = async (notificationIds: string[], deleteAll: boolean = false) => {
    if (!deleteAll && !notificationIds.length) return;
    setDeletingIds(prev => deleteAll ? [...prev, ...notifications.map(n => n.id)] : [...prev, ...notificationIds]);
    try {
      const response = await fetch('/api/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(deleteAll ? { deleteAll: true } : { notificationIds })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        console.error('Failed to delete notifications:', data);
        setDeletingIds(prev => prev.filter(id => !notificationIds.includes(id)));
        return;
      }

      // Clear notifications immediately
      if (deleteAll) {
        setNotifications([]);
        previousNotificationIdsRef.current = new Set();
      } else {
        setNotifications(prev => prev.filter(n => !notificationIds.includes(n.id)));
      }
      
      // Update unread count
      if (typeof data.unreadCount === 'number') {
        setUnreadCount(data.unreadCount);
      } else {
        setUnreadCount(0);
      }

      // Refresh notifications after deletion to ensure sync (without showing loading)
      await fetchNotifications(false);
    } catch (error) {
      console.error('Failed to delete notifications:', error);
    } finally {
      setDeletingIds([]);
    }
  };

  const deleteAllNotifications = async () => {
    if (!notifications.length) return;
    await deleteNotifications([], true);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'PRODUCT_SUBMITTED':
        return <Package className="w-4 h-4 text-blue-500" />;
      case 'PRODUCT_APPROVED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'PRODUCT_REJECTED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'MERCHANT_REGISTERED':
        return <Store className="w-4 h-4 text-purple-500" />;
      case 'ORDER_PLACED':
        return <Package className="w-4 h-4 text-amber-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Gerade eben';
    if (diffMins < 60) return `vor ${diffMins} Min.`;
    if (diffHours < 24) return `vor ${diffHours} Std.`;
    if (diffDays < 7) return `vor ${diffDays} Tag${diffDays > 1 ? 'en' : ''}`;
    return date.toLocaleDateString('de-DE');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Popup Notification */}
      {popupNotification && (
        <div className="fixed top-20 right-4 sm:right-6 z-[60] w-80 sm:w-96 bg-white rounded-lg shadow-2xl border border-gray-200 animate-in slide-in-from-top-5 duration-300">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getNotificationIcon(popupNotification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {popupNotification.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {popupNotification.message}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setPopupNotification(null);
                      if (popupTimeoutRef.current) {
                        clearTimeout(popupTimeoutRef.current);
                      }
                    }}
                    className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Schließen"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => {
                    setPopupNotification(null);
                    setIsOpen(true);
                    if (popupTimeoutRef.current) {
                      clearTimeout(popupTimeoutRef.current);
                    }
                  }}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Alle Benachrichtigungen anzeigen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Benachrichtigungen"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/10 backdrop-blur-[1px] z-40 sm:hidden"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="fixed inset-x-4 top-24 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 w-[calc(100%-2rem)] sm:w-[28rem] md:w-[32rem] max-w-md sm:max-w-none bg-white rounded-2xl sm:rounded-lg shadow-2xl sm:shadow-xl border border-gray-200 z-50 max-h-[75vh] sm:max-h-[80vh] overflow-hidden min-w-[380px]">
            {/* Header */}
            <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 border-b border-gray-200 bg-gray-50 min-h-[48px] gap-3">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 flex-shrink-0 truncate max-w-[140px] sm:max-w-none">Benachrichtigungen</h3>
              <div className="flex items-center gap-2 flex-shrink-0 justify-end">
                {notifications.length > 0 && (
                  <button
                    onClick={deleteAllNotifications}
                    className="text-xs sm:text-sm text-white bg-red-600 hover:bg-red-700 font-semibold whitespace-nowrap px-2.5 py-1.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow flex-shrink-0"
                    disabled={deletingIds.length > 0}
                    title="Alle Benachrichtigungen löschen"
                  >
                    Alle löschen
                  </button>
                )}
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs sm:text-sm text-white bg-blue-600 hover:bg-blue-700 font-semibold whitespace-nowrap px-2.5 py-1.5 rounded-md transition-colors shadow-sm hover:shadow flex-shrink-0"
                    title="Alle als gelesen markieren"
                  >
                    Alle gelesen
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-[60vh]">
              {isLoading && notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
                  <p>Lade Benachrichtigungen...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Keine Benachrichtigungen</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {notifications.map((notification) => {
                    const isExpanded = expandedNotificationId === notification.id;
                    return (
                      <li
                        key={notification.id}
                        className={`px-3 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer ${
                          !notification.isRead ? 'bg-blue-50' : ''
                        } ${isExpanded ? 'bg-gray-100' : ''}`}
                        onClick={() => {
                          // Toggle expand/collapse
                          setExpandedNotificationId(isExpanded ? null : notification.id);
                          // Mark as read when clicked
                          if (!notification.isRead) {
                            markAsRead([notification.id]);
                          }
                        }}
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <p className={`text-xs ${!notification.isRead ? 'font-semibold' : 'font-medium'} text-gray-900 ${isExpanded ? '' : 'truncate'}`}>
                              {notification.title}
                            </p>
                            <p className={`text-xs text-gray-600 mt-0.5 break-words ${isExpanded ? '' : 'line-clamp-2'}`}>
                              {notification.message}
                            </p>
                            {isExpanded && notification.data && (
                              <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-700">
                                {notification.data.productTitle && (
                                  <p><span className="font-medium">Produkt:</span> {notification.data.productTitle}</p>
                                )}
                                {notification.data.storeName && (
                                  <p><span className="font-medium">Shop:</span> {notification.data.storeName}</p>
                                )}
                                {notification.data.merchantName && (
                                  <p><span className="font-medium">Händler:</span> {notification.data.merchantName}</p>
                                )}
                              </div>
                            )}
                            <p className="text-[10px] text-gray-400 mt-1">
                              {formatTime(notification.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 pl-2">
                            {!notification.isRead && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full block"></span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotifications([notification.id]);
                              }}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                              title="Benachrichtigung löschen"
                              disabled={deletingIds.includes(notification.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
