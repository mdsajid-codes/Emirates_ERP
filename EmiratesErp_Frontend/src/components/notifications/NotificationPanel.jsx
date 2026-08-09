import React from 'react';
import { motion } from 'framer-motion';
import { CheckCheck, Bell } from 'lucide-react';
import NotificationItem from './NotificationItem';

const NotificationPanel = ({
  notifications,
  loading,
  hasMore,
  onLoadMore,
  onMarkRead,
  onMarkAllRead,
  onDelete,
  onClose
}) => {
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-full mt-2 w-[380px] max-h-[520px] bg-white border border-gray-200 rounded-2xl shadow-xl z-50 flex flex-col overflow-hidden text-left"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-gray-500" />
          <span className="font-semibold text-gray-800 text-sm">Notifications</span>
          {unreadCount > 0 && (
            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Bell className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">No notifications yet</p>
            <p className="text-xs mt-1">You're all caught up!</p>
          </div>
        ) : (
          <>
            {notifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkRead={onMarkRead}
                onDelete={onDelete}
                onClose={onClose}
              />
            ))}
            {hasMore && (
              <button
                onClick={onLoadMore}
                className="w-full py-3 text-xs text-blue-600 hover:bg-blue-50 transition-colors font-medium"
              >
                Load more
              </button>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default NotificationPanel;
