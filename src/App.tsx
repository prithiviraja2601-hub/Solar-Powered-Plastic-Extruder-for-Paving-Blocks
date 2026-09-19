/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/ToastContainer';

// Views
import { DashboardView } from './views/DashboardView';
import { PlasticCollectionOverview } from './views/PlasticCollectionOverview';
import { LocationsView } from './views/LocationsView';
import { CollectionRecordsView } from './views/CollectionRecordsView';
import { BinsView } from './views/BinsView';
import { PickupAlertsView } from './views/PickupAlertsView';
import { InventoryView } from './views/InventoryView';
import { OrderCalculatorView } from './views/OrderCalculatorView';
import { OrdersView } from './views/OrdersView';
import { SalesAnalyticsView } from './views/SalesAnalyticsView';
import { ReportsView } from './views/ReportsView';
import { NotificationsView } from './views/NotificationsView';
import { SettingsView } from './views/SettingsView';

const MainLayout: React.FC = () => {
  const { currentPage } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderCurrentView = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardView />;
      case 'collection-overview':
        return <PlasticCollectionOverview />;
      case 'locations':
        return <LocationsView />;
      case 'collection-records':
        return <CollectionRecordsView />;
      case 'bins':
        return <BinsView />;
      case 'pickup-alerts':
        return <PickupAlertsView />;
      case 'inventory':
        return <InventoryView />;
      case 'order-calculator':
        return <OrderCalculatorView />;
      case 'orders':
        return <OrdersView />;
      case 'sales-analytics':
        return <SalesAnalyticsView />;
      case 'reports':
        return <ReportsView />;
      case 'notifications':
        return <NotificationsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Toast notifications */}
      <ToastContainer />

      {/* Collapsible Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        {/* Fixed / Top Navbar */}
        <Navbar
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderCurrentView()}
        </main>

        {/* Subtle Footer */}
        <footer className="py-4 px-6 border-t border-slate-200/80 bg-white/50 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">
              Solar-Powered Plastic Extruder for Paving Blocks
            </span>
            <span>&bull;</span>
            <span>Zero-Emissions Recycling Infrastructure</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-amber-600 font-medium">Tamil Nadu Demo Network (12 Cities)</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
