import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sun,
  Flame,
  Bell,
  CheckCheck,
  AlertTriangle,
  Menu,
  X,
  Layers,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
  isSidebarOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  isSidebarOpen = false,
}) => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setCurrentPage,
    settings,
  } = useApp();

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header
        id="app-navbar"
        className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 lg:px-8 py-2.5 transition-all"
      >
        <div className="flex items-center justify-between gap-3">
          {/* Left: Mobile Sidebar Toggle + Solar Status */}
          <div className="flex items-center gap-3">
            <button
              id="sidebar-toggle-btn"
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
              aria-label="Toggle navigation menu"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Solar Extruder Status Pill */}
            <div className="hidden sm:flex items-center gap-3 bg-emerald-50/90 text-emerald-900 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-medium shadow-2xs">
              <div className="flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-500 animate-spin" style={{ animationDuration: '12s' }} />
                <span>Solar: <strong>{settings.solarPanelOutputKw} kW</strong></span>
              </div>
              <span className="text-emerald-300">•</span>
              <div className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                <span>Extruder: <strong>{settings.extruderTemperatureC}°C</strong></span>
              </div>
              <span className="text-emerald-300 hidden md:inline">•</span>
              <div className="hidden md:flex items-center gap-1 text-emerald-700">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>{settings.extrusionCapacityKgPerHour} kg/hr</span>
              </div>
            </div>
          </div>

          {/* Center: Prominent DEMO MODE Banner as required */}
          <div
            id="demo-mode-badge"
            className="flex items-center gap-2 bg-amber-50 border border-amber-300 text-amber-900 px-3 py-1 rounded-full text-xs font-semibold tracking-tight shadow-xs text-center"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="truncate">
              DEMO MODE — All data is simulated, not real field data.
            </span>
          </div>

          {/* Right: Notifications Bell */}
          <div className="flex items-center gap-2">
            {/* Notification Bell Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                id="navbar-notification-bell"
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span
                    id="unread-notifications-badge"
                    className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-rose-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center ring-2 ring-white"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              {showNotifMenu && (
                <div
                  id="notifications-dropdown-menu"
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2"
                >
                  <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Notifications
                      </h4>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-700">
                          {unreadCount} unread
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No notifications right now.
                      </div>
                    ) : (
                      notifications.slice(0, 6).map((notif) => (
                        <div
                          key={notif.id}
                          id={`dropdown-notif-${notif.id}`}
                          onClick={() => {
                            markNotificationAsRead(notif.id);
                            if (notif.linkPage) {
                              setCurrentPage(notif.linkPage as any);
                            }
                            setShowNotifMenu(false);
                          }}
                          className={`p-3 text-left transition-colors cursor-pointer hover:bg-slate-50 flex items-start gap-2.5 ${
                            !notif.read ? 'bg-sky-50/40' : ''
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {notif.type === 'bin_alert' ? (
                              <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                                <AlertTriangle className="w-3.5 h-3.5" />
                              </div>
                            ) : notif.type === 'order' ? (
                              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                <Sparkles className="w-3.5 h-3.5" />
                              </div>
                            ) : (
                              <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
                                <Sun className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-semibold text-slate-900 truncate">
                                {notif.title}
                              </p>
                              {!notif.read && (
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-600 shrink-0 ml-1"></span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">
                              {notif.message}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {notif.timestamp}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-2 bg-slate-50 border-t border-slate-200 text-center">
                    <button
                      onClick={() => {
                        setCurrentPage('notifications');
                        setShowNotifMenu(false);
                      }}
                      className="text-xs font-semibold text-sky-600 hover:text-sky-700 py-1"
                    >
                      View All Notifications &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
