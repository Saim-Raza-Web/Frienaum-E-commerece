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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/notifications?limit=20', {
        credentials: 'include',
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch notifications (${response.status})`);
      }

      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Poll for new notifications every 30 seconds
    pollIntervalRef.current = setInterval(fetchNotifications, 30000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
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

  const deleteNotifications = async (notificationIds: string[]) => {
    if (!notificationIds.length) return;
    setDeletingIds(prev => [...prev, ...notificationIds]);
    try {
      const response = await fetch('/api/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ notificationIds })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        console.error('Failed to delete notifications:', data);
        return;
      }

      setNotifications(prev => prev.filter(n => !notificationIds.includes(n.id)));
      setDeletingIds(prev => prev.filter(id => !notificationIds.includes(id)));

      if (typeof data.unreadCount === 'number') {
        setUnreadCount(data.unreadCount);
      } else {
        setUnreadCount(prev => {
          const unreadRemoved = notifications.filter(
            n => notificationIds.includes(n.id) && !n.isRead
          ).length;
          return Math.max(0, prev - unreadRemoved);
        });
      }
    } catch (error) {
      console.error('Failed to delete notifications:', error);
    } finally {
      setDeletingIds(prev => prev.filter(id => !notificationIds.includes(id)));
    }
  };

  const deleteAllNotifications = () => {
    if (!notifications.length) return;
    deleteNotifications(notifications.map(n => n.id));
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
          <div className="fixed inset-x-4 top-24 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-72 md:w-80 max-w-md sm:max-w-none bg-white rounded-2xl sm:rounded-lg shadow-2xl sm:shadow-xl border border-gray-200 z-50 max-h-[75vh] sm:max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-900">Benachrichtigungen</h3>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <button
                    onClick={deleteAllNotifications}
                    className="text-xs text-red-600 hover:text-red-800 font-medium whitespace-nowrap"
                    disabled={deletingIds.length > 0}
                  >
                    Alle löschen
                  </button>
                )}
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
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
