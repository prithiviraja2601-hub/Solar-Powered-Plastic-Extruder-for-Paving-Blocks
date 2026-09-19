import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Recycle,
  MapPin,
  ClipboardList,
  Trash2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Boxes,
  Plus,
  Calendar,
} from 'lucide-react';
import { MapComponent } from '../components/MapComponent';

export const PlasticCollectionOverview: React.FC = () => {
  const { stats, locations, bins, collectionRecords, setCurrentPage } = useApp();

  const urgentBins = bins.filter(
    (b) => b.status === 'COLLECTION_REQUIRED' || (b.currentWeight / b.maxCapacity) * 100 > 90
  );

  return (
    <div id="plastic-collection-overview" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Recycle className="w-5 h-5 text-emerald-600" />
            Plastic Collection &amp; Aggregation Hub
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Decentralized Tamil Nadu plastic recovery network powering zero-emission solar paving blocks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage('locations')}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span>Locations ({locations.length})</span>
          </button>
          <button
            onClick={() => setCurrentPage('collection-records')}
            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>View All Records ({collectionRecords.length})</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setCurrentPage('collection-records')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-400 transition-all cursor-pointer group"
        >
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Total Reclaimed
          </div>
          <div className="text-2xl font-bold text-emerald-600">
            {stats.totalPlasticCollectedKg.toLocaleString()} kg
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
            <span>50+ recorded batches</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div
          onClick={() => setCurrentPage('locations')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-sky-400 transition-all cursor-pointer group"
        >
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Regional Depots
          </div>
          <div className="text-2xl font-bold text-sky-600">{stats.totalLocations} Cities</div>
          <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
            <span>Chennai to Kanyakumari</span>
            <ArrowRight className="w-3.5 h-3.5 text-sky-600 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div
          onClick={() => setCurrentPage('bins')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-amber-400 transition-all cursor-pointer group"
        >
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Smart Bins Network
          </div>
          <div className="text-2xl font-bold text-amber-600">{stats.totalBins} Bins</div>
          <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
            <span>{stats.availableCapacityKg.toLocaleString()} kg free cap</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-600 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div
          onClick={() => setCurrentPage('pickup-alerts')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-rose-400 transition-all cursor-pointer group"
        >
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Urgent Pickup Alerts
          </div>
          <div className="text-2xl font-bold text-rose-600">{stats.binsRequiringPickupCount} Bins</div>
          <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
            <span>{stats.binsNearlyFullCount} nearly full</span>
            <ArrowRight className="w-3.5 h-3.5 text-rose-600 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            Active Collection Depots Across Tamil Nadu
          </h3>
          <span className="text-xs text-slate-500">Live Leaflet Map View</span>
        </div>
        <MapComponent height="380px" />
      </div>

      {/* Urgent Bins Quick Queue */}
      {urgentBins.length > 0 && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Bins Requiring Action Immediately (&gt;90% Capacity)
            </h3>
            <button
              onClick={() => setCurrentPage('pickup-alerts')}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
            >
              Dispatch Volunteers &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {urgentBins.map((bin) => {
              const fillPct = (bin.currentWeight / bin.maxCapacity) * 100;
              return (
                <div
                  key={bin.id}
                  className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-200 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                      <span className="font-mono">{bin.id}</span>
                      <span className="text-slate-500 font-normal">&bull; {bin.cityName}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 truncate max-w-[180px] mt-0.5">
                      {bin.locationName}
                    </div>
                    <div className="text-[11px] text-rose-700 font-semibold mt-1">
                      {bin.currentWeight} kg / {bin.maxCapacity} kg ({fillPct.toFixed(1)}%)
                    </div>
                  </div>

                  <button
                    onClick={() => setCurrentPage('pickup-alerts')}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-2xs"
                  >
                    Action
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
