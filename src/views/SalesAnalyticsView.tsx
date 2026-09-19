import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  IndianRupee,
  Boxes,
  ShoppingCart,
  Recycle,
  Calendar,
  Building,
  ArrowUpRight,
  PieChart as PieIcon,
  BarChart as BarIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from 'recharts';

export const SalesAnalyticsView: React.FC = () => {
  const { orders, stats, settings, setCurrentPage } = useApp();

  // 1. Sales by City
  const salesByCity = useMemo(() => {
    const cityMap: Record<string, { revenue: number; quantity: number }> = {};
    orders.forEach((o) => {
      if (o.status === 'Cancelled') return;
      if (!cityMap[o.city]) {
        cityMap[o.city] = { revenue: 0, quantity: 0 };
      }
      cityMap[o.city].revenue += o.finalTotal;
      cityMap[o.city].quantity += o.quantity;
    });

    return Object.entries(cityMap)
      .map(([city, data]) => ({
        city,
        revenue: data.revenue,
        quantity: data.quantity,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [orders]);

  // 2. Order Status distribution
  const orderStatusBreakdown = useMemo(() => {
    const counts: Record<string, number> = {
      Delivered: 0,
      Confirmed: 0,
      Preparing: 0,
      Dispatched: 0,
      Pending: 0,
      Cancelled: 0,
    };
    orders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });

    return [
      { name: 'Delivered', count: counts.Delivered, color: '#10b981' },
      { name: 'Confirmed', count: counts.Confirmed, color: '#0284c7' },
      { name: 'Preparing', count: counts.Preparing, color: '#6366f1' },
      { name: 'Dispatched', count: counts.Dispatched, color: '#8b5cf6' },
      { name: 'Pending', count: counts.Pending, color: '#f59e0b' },
      { name: 'Cancelled', count: counts.Cancelled, color: '#94a3b8' },
    ].filter((item) => item.count > 0);
  }, [orders]);

  // 3. Orders Chronological Trend
  const timelineData = useMemo(() => {
    const dateMap: Record<string, number> = {};
    orders.forEach((o) => {
      if (o.status === 'Cancelled') return;
      dateMap[o.orderDate] = (dateMap[o.orderDate] || 0) + o.finalTotal;
    });

    return Object.entries(dateMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, rev]) => ({
        date: date.slice(5), // MM-DD
        revenue: rev,
      }));
  }, [orders]);

  const nonCancelledOrders = orders.filter((o) => o.status !== 'Cancelled');
  const totalBlocksSold = nonCancelledOrders.reduce((acc, o) => acc + o.quantity, 0);
  const avgOrderValue = nonCancelledOrders.length > 0 ? Math.round(stats.totalRevenue / nonCancelledOrders.length) : 0;
  const plasticDivertedForSalesKg = Math.round(totalBlocksSold * (settings.kgPlasticPerBlock || 2.2));

  return (
    <div id="sales-analytics-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            Commercial Sales Analytics &amp; Revenue Metrics
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Financial and environmental yield tracking of recycled paving block procurement across Tamil Nadu.
          </p>
        </div>

        <button
          onClick={() => setCurrentPage('orders')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start md:self-auto"
        >
          View All Sales Orders &rarr;
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Total Revenue
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            ₹{stats.totalRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-2 flex items-center gap-1">
            <span>{nonCancelledOrders.length} active contracts fulfilled</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Total Blocks Sold
          </div>
          <div className="text-2xl font-extrabold text-indigo-600">
            {totalBlocksSold.toLocaleString()} units
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Avg Rate: ₹{settings.pricePerBlock}/block
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Average Order Value
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            ₹{avgOrderValue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Across Municipal &amp; Private Tenders
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Plastic Embodied in Sales
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">
            {plasticDivertedForSalesKg.toLocaleString()} kg
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Diverted from Tamil Nadu waterways
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by City Bar Chart */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-600" />
              Revenue by Tamil Nadu City (₹)
            </h3>
            <span className="text-xs text-slate-400">Delivered &amp; Confirmed</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByCity} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="city" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '10px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Distribution Pie */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-600" />
              Order Status Breakdown
            </h3>
            <span className="text-xs text-slate-400">Total volume</span>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {orderStatusBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [`${val} orders`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {orderStatusBreakdown.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-700 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Revenue Trend */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-600" />
              Order Procurement Chronology (₹)
            </h3>
            <span className="text-xs text-slate-400">Chronological Batches</span>
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Order Amount']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '10px', color: '#fff', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0284c7"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#0284c7' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
