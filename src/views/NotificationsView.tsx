import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AppNotification } from '../types';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Boxes,
  ShoppingCart,
  Trash2,
  Eye,
  CheckCheck,
  Filter,
  Search,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
    setCurrentPage,
  } = useApp();

  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'bin_alert':
        return <Trash2 className="w-4 h-4 text-rose-600" />;
      case 'pickup':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'stock':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'order':
        return <ShoppingCart className="w-4 h-4 text-indigo-600" />;
      case 'system':
      default:
        return <Bell className="w-4 h-4 text-sky-600" />;
    }
  };

  const getBadgeColor = (type: AppNotification['type']) => {
    switch (type) {
      case 'bin_alert':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'pickup':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'stock':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'order':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'system':
      default:
        return 'bg-sky-100 text-sky-800 border-sky-200';
    }
  };

  const handleNotificationClick = (n: AppNotification) => {
    markNotificationAsRead(n.id);
    if (n.linkPage) {
      setCurrentPage(n.linkPage as any);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (typeFilter === 'ALL') return true;
    if (typeFilter === 'UNREAD') return !n.read;
    return n.type === typeFilter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div id="notifications-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-rose-600" />
            System Notifications &amp; Alerts Dispatch
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated alerts for collection bin thresholds, paving block stock limits, and commercial orders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsAsRead}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 border border-slate-200"
            >
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              <span>Mark All as Read ({unreadCount})</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={clearNotifications}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 border border-slate-200"
            >
              <Trash2 className="w-4 h-4 text-slate-500" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-700">Filter:</span>
          <div className="flex flex-wrap gap-1.5">
            {['ALL', 'UNREAD', 'bin_alert', 'pickup', 'stock', 'order', 'system'].map((cat) => (
              <button
                key={cat}
                onClick={() => setTypeFilter(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
                  typeFilter === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'bin_alert'
                  ? 'Bin Alerts'
                  : cat === 'pickup'
                  ? 'Pickups'
                  : cat === 'stock'
                  ? 'Low Stock'
                  : cat === 'order'
                  ? 'Orders'
                  : cat === 'system'
                  ? 'System'
                  : cat === 'ALL'
                  ? 'All Alerts'
                  : `Unread (${unreadCount})`}
              </button>
            ))}
          </div>
        </div>

        <span className="text-slate-400 text-xs hidden sm:inline">
          {filteredNotifications.length} items
        </span>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-800">No Notifications</h4>
            <p className="text-xs text-slate-500">
              There are no alerts matching your active filter.
            </p>
          </div>
        ) : (
          filteredNotifications.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                item.read
                  ? 'bg-white border-slate-200'
                  : 'bg-slate-50/80 border-slate-300 ring-1 ring-slate-200'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs shrink-0 mt-0.5">
                  {getIcon(item.type)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getBadgeColor(
                        item.type
                      )}`}
                    >
                      {item.type.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{item.title}</span>
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>

                  <div className="text-[11px] text-slate-400 pt-1">{item.timestamp}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-center">
                {item.linkPage && (
                  <button
                    onClick={() => handleNotificationClick(item)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                  >
                    <span>View</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
