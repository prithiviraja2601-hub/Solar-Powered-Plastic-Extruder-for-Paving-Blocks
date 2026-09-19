import React from 'react';
import { useApp } from '../context/AppContext';
import { MapComponent } from '../components/MapComponent';
import {
  Recycle,
  Trash2,
  Boxes,
  IndianRupee,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Sun,
  Flame,
  CheckCircle2,
  Calendar,
  Layers,
  MapPin,
  Clock,
  Sparkles,
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
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
} from 'recharts';

export const DashboardView: React.FC = () => {
  const {
    stats,
    setCurrentPage,
    locations,
    bins,
    collectionRecords,
    orders,
    settings,
  } = useApp();

  // 1. Prepare Daily Collection Trend (last 7 days)
  const collectionTrendData = React.useMemo(() => {
    const datesMap: Record<string, number> = {};
    // Last 7 days backwards from 2026-09-19
    for (let i = 6; i >= 0; i--) {
      const d = new Date(2026, 8, 19 - i);
      const dateStr = d.toISOString().split('T')[0];
      datesMap[dateStr] = 0;
    }

    collectionRecords.forEach((r) => {
      if (datesMap[r.date] !== undefined) {
        datesMap[r.date] += r.weightKg;
      }
    });

    return Object.entries(datesMap).map(([date, weight]) => ({
      date: date.slice(5), // MM-DD
      weightKg: Math.round(weight * 10) / 10,
    }));
  }, [collectionRecords]);

  // 2. Collection by City
  const cityCollectionData = React.useMemo(() => {
    const cityWeights: Record<string, number> = {};
    collectionRecords.forEach((r) => {
      const loc = locations.find((l) => l.id === r.locationId);
      const city = loc ? loc.city : 'Other';
      cityWeights[city] = (cityWeights[city] || 0) + r.weightKg;
    });

    return Object.entries(cityWeights)
      .map(([city, weight]) => ({ city, weight: Math.round(weight) }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 8); // top 8 cities
  }, [collectionRecords, locations]);

  // 3. Plastic Category Donut Data
  const categoryData = React.useMemo(() => {
    const catMap: Record<string, number> = {
      PET: 0,
      HDPE: 0,
      LDPE: 0,
      PP: 0,
      'Mixed Plastic': 0,
      Other: 0,
    };
    collectionRecords.forEach((r) => {
      catMap[r.plasticCategory] = (catMap[r.plasticCategory] || 0) + r.weightKg;
    });

    const colors = ['#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

    return Object.entries(catMap)
      .filter(([_, val]) => val > 0)
      .map(([name, value], i) => ({
        name,
        value: Math.round(value),
        color: colors[i % colors.length],
      }));
  }, [collectionRecords]);

  // 4. Bin Status Breakdown
  const binStatusData = React.useMemo(() => {
    const counts = {
      AVAILABLE: 0,
      NEARLY_FULL: 0,
      FULL: 0,
      COLLECTION_REQUIRED: 0,
    };

    bins.forEach((b) => {
      const pct = (b.currentWeight / b.maxCapacity) * 100;
      if (pct > 90 || b.status === 'COLLECTION_REQUIRED') counts.COLLECTION_REQUIRED++;
      else if (pct >= 90 || b.status === 'FULL') counts.FULL++;
      else if (pct >= 70 || b.status === 'NEARLY_FULL') counts.NEARLY_FULL++;
      else counts.AVAILABLE++;
    });

    return [
      { name: 'Available (<70%)', count: counts.AVAILABLE, color: '#10b981' },
      { name: 'Nearly Full (70-89%)', count: counts.NEARLY_FULL, color: '#f59e0b' },
      { name: 'Req. Pickup (>=90%)', count: counts.COLLECTION_REQUIRED + counts.FULL, color: '#ef4444' },
    ];
  }, [bins]);

  // Calculated Solar Extruder Impact
  const estimatedBlocksFromCollected = Math.floor(
    stats.totalPlasticCollectedKg / (settings.kgPlasticPerBlock || 2.2)
  );
  const carbonOffsetKg = Math.round(stats.totalPlasticCollectedKg * 1.75);

  return (
    <div id="dashboard-view" className="space-y-6">
      {/* Low-Stock Warning Banner if triggered */}
      {stats.isLowStock && (
        <div
          id="dashboard-low-stock-alert"
          className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Paving Block Stock Warning</h3>
              <p className="text-xs text-amber-800">
                Available inventory is currently <strong>{stats.currentStock} blocks</strong>, which is below the configured low-stock safety threshold of {settings.lowStockThreshold} blocks.
              </p>
            </div>
          </div>
          <button
            id="dash-add-stock-btn"
            onClick={() => setCurrentPage('inventory')}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shrink-0 transition-colors shadow-xs"
          >
            Add Extruded Stock &rarr;
          </button>
        </div>
      )}

      {/* Urgent Bins Alert Banner */}
      {stats.binsRequiringPickupCount > 0 && (
        <div
          id="dashboard-urgent-pickup-banner"
          className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-600 text-white shrink-0 animate-pulse">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold">
                {stats.binsRequiringPickupCount} Bin{stats.binsRequiringPickupCount > 1 ? 's' : ''} Require Urgent Pickup!
              </h3>
              <p className="text-xs text-rose-700">
                Bins have reached or exceeded 90% capacity across Tamil Nadu recovery depots. Schedule volunteer collection teams.
              </p>
            </div>
          </div>
          <button
            id="dash-schedule-pickup-btn"
            onClick={() => setCurrentPage('pickup-alerts')}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shrink-0 transition-colors shadow-xs"
          >
            View Pickup Alerts &rarr;
          </button>
        </div>
      )}

      {/* Stat Cards Grid - All clickable navigation shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Plastic Collected */}
        <div
          id="stat-card-total-plastic"
          onClick={() => setCurrentPage('collection-records')}
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-sky-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Plastic Collected</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition-colors">
              <Recycle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {stats.totalPlasticCollectedKg.toLocaleString()} <span className="text-sm font-medium text-slate-500">kg</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Today: <strong>{stats.collectedTodayKg} kg</strong></span>
            <span className="text-sky-600 flex items-center gap-0.5 font-medium group-hover:translate-x-0.5 transition-transform">
              Records <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Card 2: Bins & Capacity */}
        <div
          id="stat-card-bins-capacity"
          onClick={() => setCurrentPage('bins')}
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Bins &amp; Cap</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Trash2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {stats.totalBins} <span className="text-sm font-medium text-slate-500">bins</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Free: <strong>{stats.availableCapacityKg.toLocaleString()} kg</strong></span>
            <span className="text-emerald-600 flex items-center gap-0.5 font-medium group-hover:translate-x-0.5 transition-transform">
              Monitoring <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Card 3: Paving Block Stock */}
        <div
          id="stat-card-paving-stock"
          onClick={() => setCurrentPage('inventory')}
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Paving Block Stock</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 flex items-baseline gap-2">
            <span>{stats.currentStock.toLocaleString()}</span>
            <span className="text-sm font-medium text-slate-500">units</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>₹{settings.pricePerBlock}/block</span>
            <span className="text-amber-600 flex items-center gap-0.5 font-medium group-hover:translate-x-0.5 transition-transform">
              Inventory <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Card 4: Orders & Revenue */}
        <div
          id="stat-card-orders-revenue"
          onClick={() => setCurrentPage('orders')}
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Sales &amp; Revenue</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            ₹{stats.totalRevenue.toLocaleString('en-IN')}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>{stats.totalOrdersCount} orders placed</span>
            <span className="text-indigo-600 flex items-center gap-0.5 font-medium group-hover:translate-x-0.5 transition-transform">
              Orders <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Solar Extrusion Operational Highlights Bar */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white border border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold">Solar-Powered Extrusion Technology</h4>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
                Active PV Array
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Zero-carbon direct thermal melting of recycled polymer mixes for standard paving blocks.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center w-full md:w-auto shrink-0 border-t md:border-t-0 md:border-l border-slate-700/80 pt-3 md:pt-0 md:pl-6">
          <div>
            <div className="text-xs text-slate-400">Yield Potential</div>
            <div className="text-sm font-bold text-amber-400">{estimatedBlocksFromCollected.toLocaleString()} Blocks</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">CO₂ Avoided</div>
            <div className="text-sm font-bold text-emerald-400">{carbonOffsetKg.toLocaleString()} kg</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Melting Temp</div>
            <div className="text-sm font-bold text-orange-400">{settings.extruderTemperatureC}°C</div>
          </div>
        </div>
      </div>

      {/* Main Content: Map + Bins Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tamil Nadu Interactive Leaflet Map (2 columns) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-600" />
              <h3 className="text-sm font-bold text-slate-900">Tamil Nadu Collection Map (12 Cities)</h3>
            </div>
            <button
              onClick={() => setCurrentPage('locations')}
              className="text-xs text-sky-600 hover:text-sky-700 font-semibold"
            >
              Manage Locations &rarr;
            </button>
          </div>
          <MapComponent height="420px" />
        </div>

        {/* Right column: Bin Monitoring Summary */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Bin Status Distribution</h3>
              <span className="text-xs text-slate-400">{bins.length} total bins</span>
            </div>

            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={binStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {binStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 text-xs">
              {binStatusData.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-700 font-medium">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">{item.count}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage('bins')}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors"
            >
              Open Bin Monitoring Matrix &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Collection Trend Chart */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-600" />
              <h3 className="text-sm font-bold text-slate-900">Daily Plastic Collection Trend (kg)</h3>
            </div>
            <span className="text-xs text-slate-400">Last 7 Days</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={collectionTrendData}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  formatter={(val: any) => [`${val} kg`, 'Plastic Collected']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '10px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="weightKg" stroke="#0284c7" strokeWidth={2.5} fillOpacity={1} fill="url(#colorWeight)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plastic Category Breakdown */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Plastic Polymer Distribution</h3>
            </div>
            <span className="text-xs text-slate-400">Total Volume</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => [`${v} kg`, 'Collected']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Cities by Collection */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Top Tamil Nadu Cities by Reclaimed Plastic (kg)</h3>
            </div>
            <button
              onClick={() => setCurrentPage('reports')}
              className="text-xs text-sky-600 hover:text-sky-700 font-semibold"
            >
              Export CSV Report &rarr;
            </button>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cityCollectionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="city" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  formatter={(val: any) => [`${val} kg`, 'Total Collected']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '10px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="weight" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
