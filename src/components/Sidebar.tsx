import React from 'react';
import { useApp } from '../context/AppContext';
import { PageId } from '../types';
import {
  LayoutDashboard,
  Recycle,
  MapPin,
  ClipboardList,
  Trash2,
  AlertTriangle,
  Boxes,
  Calculator,
  ShoppingCart,
  TrendingUp,
  FileText,
  Bell,
  Settings,
  Sun,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentPage, setCurrentPage, stats, notifications } = useApp();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navigate = (page: PageId) => {
    setCurrentPage(page);
    onClose();
  };

  const navGroups = [
    {
      label: 'Main',
      items: [
        {
          id: 'dashboard' as PageId,
          label: 'Dashboard',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      label: 'Plastic Collection',
      items: [
        {
          id: 'collection-overview' as PageId,
          label: 'Collection Hub',
          icon: Recycle,
        },
        {
          id: 'locations' as PageId,
          label: 'Locations',
          icon: MapPin,
          badge: `${stats.totalLocations}`,
        },
        {
          id: 'collection-records' as PageId,
          label: 'Collection Records',
          icon: ClipboardList,
        },
        {
          id: 'bins' as PageId,
          label: 'Bin Monitoring',
          icon: Trash2,
          badge: `${stats.totalBins}`,
        },
        {
          id: 'pickup-alerts' as PageId,
          label: 'Pickup Alerts',
          icon: AlertTriangle,
          badge: stats.binsRequiringPickupCount > 0 ? `${stats.binsRequiringPickupCount}` : undefined,
          badgeColor: 'bg-rose-500 text-white',
        },
      ],
    },
    {
      label: 'Production & Sales',
      items: [
        {
          id: 'inventory' as PageId,
          label: 'Paving Block Inventory',
          icon: Boxes,
          badge: `${stats.currentStock.toLocaleString()}`,
          badgeColor: stats.isLowStock ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-700',
        },
        {
          id: 'order-calculator' as PageId,
          label: 'Order Calculator',
          icon: Calculator,
        },
        {
          id: 'orders' as PageId,
          label: 'Orders',
          icon: ShoppingCart,
          badge: `${stats.totalOrdersCount}`,
        },
        {
          id: 'sales-analytics' as PageId,
          label: 'Sales Analytics',
          icon: TrendingUp,
        },
      ],
    },
    {
      label: 'Management',
      items: [
        {
          id: 'reports' as PageId,
          label: 'Reports & Export',
          icon: FileText,
        },
        {
          id: 'notifications' as PageId,
          label: 'Notifications',
          icon: Bell,
          badge: unreadCount > 0 ? `${unreadCount}` : undefined,
          badgeColor: 'bg-rose-500 text-white',
        },
        {
          id: 'settings' as PageId,
          label: 'Settings',
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          id="sidebar-backdrop"
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar element */}
      <aside
        id="main-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-amber-400 p-0.5 shadow-md flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-amber-400">
              <Sun className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-400/90 flex items-center gap-1">
              <span>Solar Eco Pave</span>
            </div>
            <h1 className="text-sm font-bold text-white truncate" title="Solar-Powered Plastic Extruder for Paving Blocks">
              Plastic Extruder
            </h1>
            <p className="text-[11px] text-slate-400 truncate">Tamil Nadu Recycling Node</p>
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {group.label}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;

                  return (
                    <button
                      key={item.id}
                      id={`nav-link-${item.id}`}
                      onClick={() => navigate(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                        isActive
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.badge && (
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                              item.badgeColor || (isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300')
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight
                          className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${
                            isActive ? 'opacity-100 text-white' : 'text-slate-500'
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Node status info */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium">Extruder Node Active</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Tamil Nadu Recycling Node &bull; 100% Solar</p>
          </div>
        </div>
      </aside>
    </>
  );
};
