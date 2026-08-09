import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Calendar, Clock, FileText, DollarSign, Megaphone, User } from 'lucide-react';

const getTypeStyle = (type) => {
  if (!type) return { icon: Megaphone, color: 'text-gray-500', bg: 'bg-gray-100' };

  if (type.startsWith('LEAVE'))       return { icon: Calendar,    color: 'text-blue-600',   bg: 'bg-blue-50' };
  if (type.startsWith('ATTENDANCE') ||
      type.startsWith('MISSING') ||
      type.startsWith('SHIFT') ||
      type.startsWith('TIMESHEET'))   return { icon: Clock,        color: 'text-orange-600', bg: 'bg-orange-50' };
  if (type.startsWith('PAYSLIP') ||
      type.startsWith('PAYROLL') ||
      type.startsWith('EXPENSE') ||
      type.startsWith('BONUS') ||
      type.startsWith('LOAN') ||
      type.startsWith('WPS'))         return { icon: DollarSign,   color: 'text-green-600',  bg: 'bg-green-50' };
  if (type.startsWith('DOCUMENT'))    return { icon: FileText,     color: 'text-red-600',    bg: 'bg-red-50' };
  if (type.startsWith('END_OF_SERVICE') ||
      type.startsWith('NEW_EMPLOYEE') ||
      type.startsWith('EMPLOYEE') ||
      type.startsWith('PROBATION') ||
      type.startsWith('CONTRACT') ||
      type.startsWith('WORK_ANN') ||
      type.startsWith('BIRTHDAY'))    return { icon: User,         color: 'text-teal-600',   bg: 'bg-teal-50' };
  if (type.startsWith('HOLIDAY') ||
      type.startsWith('POLICY') ||
      type.startsWith('GENERAL'))     return { icon: Megaphone,    color: 'text-gray-600',   bg: 'bg-gray-100' };

  return { icon: Megaphone, color: 'text-gray-500', bg: 'bg-gray-100' };
};

const priorityBadge = {
  URGENT: 'bg-red-100 text-red-700',
  HIGH:   'bg-orange-100 text-orange-700',
  MEDIUM: 'bg-blue-100 text-blue-700',
  LOW:    'bg-gray-100 text-gray-500',
};

const NotificationItem = ({ notification, onMarkRead, onDelete, onClose }) => {
  const navigate = useNavigate();
  const { icon: Icon, color, bg } = getTypeStyle(notification.type);

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkRead(notification.id);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      onClose();
    }
  };

  const timeAgo = notification.createdAt
    ? new Date(notification.createdAt).toLocaleString()
    : '';

  return (
    <div
      onClick={handleClick}
      className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 transition-colors relative
        ${!notification.isRead ? 'bg-blue-50/40' : 'bg-white'}`}
    >
      {!notification.isRead && (
        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
      )}

      <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-semibold leading-tight ${notification.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
            {notification.title}
          </p>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
            className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0 mt-0.5"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
          {notification.message}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[10px] text-gray-400">{timeAgo}</span>
          {notification.priority && notification.priority !== 'LOW' && (
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${priorityBadge[notification.priority] || ''}`}>
              {notification.priority}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
