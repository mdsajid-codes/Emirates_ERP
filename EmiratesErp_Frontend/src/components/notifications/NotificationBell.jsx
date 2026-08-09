import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import useNotifications from '../../hooks/useNotifications';
import NotificationPanel from './NotificationPanel';

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  const {
    notifications,
    unreadCount,
    loading,
    hasMore,
    loadMore,
    markAsRead,
    markAllRead,
    deleteNotification
  } = useNotifications();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-foreground-muted hover:text-foreground hover:bg-black/5 rounded-full transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-0.5 right-0.5 h-4 w-4 flex items-center justify-center bg-red-500 text-white rounded-full text-[9px] font-bold border-2 border-white leading-none"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <NotificationPanel
            notifications={notifications}
            loading={loading}
            hasMore={hasMore}
            onLoadMore={loadMore}
            onMarkRead={markAsRead}
            onMarkAllRead={markAllRead}
            onDelete={deleteNotification}
            onClose={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
