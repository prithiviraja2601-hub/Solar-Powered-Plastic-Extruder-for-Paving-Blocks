import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { InventoryTransaction } from '../types';
import {
  FileText,
  Download,
  Calendar,
  Layers,
  Recycle,
  Boxes,
  ShoppingCart,
  Trash2,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const {
    stats,
    locations,
    bins,
    collectionRecords,
    orders,
    transactions,
    settings,
  } = useApp();

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [lastExported, setLastExported] = useState<string | null>(null);

  // Helper for CSV trigger
  const triggerCSVDownload = (filename: string, headers: string[], rows: any[][]) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setLastExported(filename);
  };

  // 1. Collection Records CSV
  const exportCollectionRecords = () => {
    const records = collectionRecords.filter((r) => {
      if (dateFrom && r.date < dateFrom) return false;
      if (dateTo && r.date > dateTo) return false;
      return true;
    });

    const headers = ['Record ID', 'Date', 'Location Depot', 'Bin ID', 'Plastic Category', 'Weight (kg)', 'Collector', 'Notes'];
    const rows = records.map((r) => [
      r.id,
      r.date,
      `"${r.locationName.replace(/"/g, '""')}"`,
      r.binId,
      r.plasticCategory,
      r.weightKg,
      `"${r.collector.replace(/"/g, '""')}"`,
      `"${(r.notes || '').replace(/"/g, '""')}"`,
    ]);
    triggerCSVDownload('plastic_collection_report', headers, rows);
  };

  // 2. Bins Status CSV
  const exportBinsStatus = () => {
    const headers = ['Bin ID', 'Location Name', 'City', 'Current Weight (kg)', 'Max Capacity (kg)', 'Fill %', 'Status', 'Scheduled Pickup', 'Assigned Volunteer'];
    const rows = bins.map((b) => [
      b.id,
      `"${b.locationName.replace(/"/g, '""')}"`,
      b.cityName,
      b.currentWeight,
      b.maxCapacity,
      ((b.currentWeight / b.maxCapacity) * 100).toFixed(1),
      b.status,
      b.scheduledPickupDate || 'None',
      `"${(b.assignedVolunteer || 'Unassigned').replace(/"/g, '""')}"`,
    ]);
    triggerCSVDownload('bins_monitoring_status_report', headers, rows);
  };

  // 3. Sales Orders CSV
  const exportSalesOrders = () => {
    const ords = orders.filter((o) => {
      if (dateFrom && o.orderDate < dateFrom) return false;
      if (dateTo && o.orderDate > dateTo) return false;
      return true;
    });

    const headers = ['Order ID', 'Order Date', 'Customer Name', 'Phone', 'City', 'Delivery Address', 'Block Quantity', 'Price Per Block (₹)', 'Final Total (₹)', 'Status'];
    const rows = ords.map((o) => [
      o.id,
      o.orderDate,
      `"${o.customerName.replace(/"/g, '""')}"`,
      o.phone,
      o.city,
      `"${o.deliveryAddress.replace(/"/g, '""')}"`,
      o.quantity,
      o.pricePerBlock,
      o.finalTotal,
      o.status,
    ]);
    triggerCSVDownload('sales_procurement_report', headers, rows);
  };

  // 4. Warehouse Stock Movements CSV
  const exportStockMovements = () => {
    const headers = ['Log ID', 'Date', 'Movement Type', 'Quantity (units)', 'Stock After (units)', 'Reason / Reference'];
    const rows = transactions.map((m: InventoryTransaction) => [
      m.id,
      m.date,
      m.type,
      m.quantity,
      m.stockAfter,
      `"${m.reason.replace(/"/g, '""')}"`,
    ]);
    triggerCSVDownload('warehouse_stock_audit_report', headers, rows);
  };

  return (
    <div id="reports-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-600" />
            Executive Reports &amp; Data Export Central
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Download verified operational CSV logs and audit ledgers for compliance and stakeholders.
          </p>
        </div>

        {lastExported && (
          <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 self-start md:self-auto">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Successfully generated: {lastExported}.csv</span>
          </div>
        )}
      </div>

      {/* Date Range Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            Optional Date Range Filter:
          </span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-700"
            placeholder="From"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-700"
            placeholder="To"
          />

          {(dateFrom || dateTo) && (
            <button
              onClick={() => {
                setDateFrom('');
                setDateTo('');
              }}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
            >
              Clear Dates
            </button>
          )}
        </div>

        <span className="text-xs text-slate-400">Exports all records by default</span>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Collection Records */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Recycle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Plastic Collection Records CSV</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Complete chronological registry of raw plastic collections, including weights, polymer categories (PET, HDPE, LDPE, PP), depot locations, and collectors.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              <strong>{collectionRecords.length}</strong> total records
            </span>
            <button
              onClick={exportCollectionRecords}
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV</span>
            </button>
          </div>
        </div>

        {/* Card 2: Bins Status Report */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Smart Bins Telemetry &amp; Status CSV</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Snapshot of all 25+ deployed collection bins across Tamil Nadu cities, their fill percentages, remaining capacities, and scheduled volunteer pickups.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              <strong>{bins.length}</strong> bins tracked
            </span>
            <button
              onClick={exportBinsStatus}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV</span>
            </button>
          </div>
        </div>

        {/* Card 3: Sales Orders */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Paving Block Sales &amp; Orders CSV</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Procurement ledger listing municipal tenders, commercial contracts, quantities, revenues (₹), delivery addresses, and fulfillment statuses.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              <strong>{orders.length}</strong> orders logged
            </span>
            <button
              onClick={exportSalesOrders}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV</span>
            </button>
          </div>
        </div>

        {/* Card 4: Inventory Movements */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Warehouse Inventory Audit Trail CSV</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Complete stock movement log tracing additions from solar extruder production runs, deductions for customer orders, and write-offs.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              <strong>{transactions.length}</strong> movement logs
            </span>
            <button
              onClick={exportStockMovements}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Executive Operational Summary Table */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Program Performance Overview</h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-500 block">Total Plastic Extruded</span>
            <span className="text-lg font-bold text-slate-900 mt-0.5 block">
              {stats.totalPlasticCollectedKg.toLocaleString()} kg
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-500 block">Current Block Stock</span>
            <span className="text-lg font-bold text-amber-600 mt-0.5 block">
              {stats.currentStock.toLocaleString()} units
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-500 block">Total Sales Revenue</span>
            <span className="text-lg font-bold text-emerald-600 mt-0.5 block">
              ₹{stats.totalRevenue.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-500 block">Estimated Carbon Saved</span>
            <span className="text-lg font-bold text-sky-600 mt-0.5 block">
              {Math.round(stats.totalPlasticCollectedKg * 1.75).toLocaleString()} kg CO₂
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
