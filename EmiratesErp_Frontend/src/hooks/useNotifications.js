import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]             = useState(true);
  const [hasMore, setHasMore]             = useState(false);
  const pageRef = useRef(0);
  const eventSourceRef = useRef(null);

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }

    fetch(`${API_BASE}/notifications/unread-count`, { headers: getHeaders() })
      .then(r => r.json())
      .then(count => setUnreadCount(Number(count)))
      .catch(() => {});

    fetch(`${API_BASE}/notifications?page=0&size=20`, { headers: getHeaders() })
      .then(r => r.json())
      .then(data => {
        setNotifications(data.content || []);
        setHasMore(!data.last);
        pageRef.current = 1;
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    const es = new EventSource(
      `${API_BASE}/notifications/stream?token=${token}`
    );

    es.addEventListener('notification', (event) => {
      try {
        const notification = JSON.parse(event.data);
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        toast.info(`🔔 ${notification.title}`, {
          position: 'top-right',
          autoClose: 4000,
          onClick: () => {
            if (notification.actionUrl) {
              window.location.href = notification.actionUrl;
            }
          }
        });
      } catch (e) {
        // ignore
      }
    });

    es.onerror = () => {
      // Browser auto-reconnects
    };

    eventSourceRef.current = es;

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, []);

  const loadMore = useCallback(() => {
    if (!hasMore) return;
    fetch(
      `${API_BASE}/notifications?page=${pageRef.current}&size=20`,
      { headers: getHeaders() }
    )
      .then(r => r.json())
      .then(data => {
        setNotifications(prev => [...prev, ...(data.content || [])]);
        setHasMore(!data.last);
        pageRef.current += 1;
      })
      .catch(() => {});
  }, [hasMore]);

  const markAsRead = useCallback((notificationId) => {
    fetch(`${API_BASE}/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers: getHeaders()
    }).catch(() => {});

    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllRead = useCallback(() => {
    fetch(`${API_BASE}/notifications/mark-all-read`, {
      method: 'PATCH',
      headers: getHeaders()
    }).catch(() => {});

    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);

  const deleteNotification = useCallback((notificationId) => {
    fetch(`${API_BASE}/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: getHeaders()
    }).catch(() => {});

    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    hasMore,
    loadMore,
    markAsRead,
    markAllRead,
    deleteNotification
  };
};

export default useNotifications;
