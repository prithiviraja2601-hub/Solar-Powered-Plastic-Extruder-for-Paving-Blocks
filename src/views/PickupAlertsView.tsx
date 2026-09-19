import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bin, PlasticCategory } from '../types';
import {
  AlertTriangle,
  Calendar,
  UserCheck,
  CheckCircle2,
  ArrowDownToLine,
  Search,
  Filter,
  X,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';

export const PickupAlertsView: React.FC = () => {
  const { bins, schedulePickup, completePickup, setCurrentPage } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'SCHEDULED'>('ALL');

  // Modals
  const [schedulingBin, setSchedulingBin] = useState<Bin | null>(null);
  const [pickupDate, setPickupDate] = useState('2026-09-20');
  const [volunteerName, setVolunteerName] = useState('Eco Logistics Team A');

  const [completingBin, setCompletingBin] = useState<Bin | null>(null);
  const [collectedWeight, setCollectedWeight] = useState<number>(0);
  const [plasticCategory, setPlasticCategory] = useState<PlasticCategory>('PET');
  const [collectorName, setCollectorName] = useState('Tamil Nadu Waste Recovery Team');
  const [notes, setNotes] = useState('');

  // Alerts logic: Bins with fill% >= 70%
  const alertBins = bins
    .filter((b) => {
      const fillPct = (b.currentWeight / b.maxCapacity) * 100;
      return fillPct >= 70 || b.status === 'COLLECTION_REQUIRED' || b.status === 'FULL';
    })
    .sort((a, b) => {
      const pctA = (a.currentWeight / a.maxCapacity) * 100;
      const pctB = (b.currentWeight / b.maxCapacity) * 100;
      return pctB - pctA; // highest fill first
    });

  const filteredAlerts = alertBins.filter((b) => {
    const matchesSearch =
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.cityName.toLowerCase().includes(searchQuery.toLowerCase());

    const fillPct = (b.currentWeight / b.maxCapacity) * 100;
    const isCritical = fillPct > 90 || b.status === 'COLLECTION_REQUIRED';
    const isScheduled = !!b.scheduledPickupDate;

    if (urgencyFilter === 'CRITICAL') return matchesSearch && isCritical;
    if (urgencyFilter === 'WARNING') return matchesSearch && !isCritical && fillPct >= 70;
    if (urgencyFilter === 'SCHEDULED') return matchesSearch && isScheduled;
    return matchesSearch;
  });

  const openSchedule = (bin: Bin) => {
    setSchedulingBin(bin);
    setPickupDate('2026-09-20');
    setVolunteerName(bin.assignedVolunteer || 'R. Senthil (Volunteer Lead)');
  };

  const confirmSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulingBin) return;
    schedulePickup(schedulingBin.id, pickupDate, volunteerName);
    setSchedulingBin(null);
  };

  const openComplete = (bin: Bin) => {
    setCompletingBin(bin);
    setCollectedWeight(bin.currentWeight);
    setPlasticCategory('PET');
    setCollectorName(bin.assignedVolunteer || 'Tamil Nadu Recycling Unit');
    setNotes(`Completed pickup from alert dispatcher`);
  };

  const confirmComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingBin) return;
    completePickup(completingBin.id, collectedWeight, plasticCategory, collectorName, notes);
    setCompletingBin(null);
  };

  return (
    <div id="pickup-alerts-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            Active Bin Pickup Alerts &amp; Dispatcher
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated alerts triggered when bins cross 70% (Nearly Full) and 90% (Collection Required).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
            {alertBins.length} Active Alerts Requiring Action
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="alerts-search-input"
            type="text"
            placeholder="Search alerts by Bin ID or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            id="alerts-urgency-filter"
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value as any)}
            className="text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="ALL">All Alerts ({alertBins.length})</option>
            <option value="CRITICAL">Critical (&gt;90% Fill)</option>
            <option value="WARNING">Warning (70–89% Fill)</option>
            <option value="SCHEDULED">Scheduled Pickups</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-800">All Bins Below Alert Thresholds</h4>
            <p className="text-xs text-slate-500">
              No bins are currently above 70% capacity matching your filter criteria.
            </p>
          </div>
        ) : (
          filteredAlerts.map((bin) => {
            const fillPct = (bin.currentWeight / bin.maxCapacity) * 100;
            const isCritical = fillPct > 90 || bin.status === 'COLLECTION_REQUIRED';
            const remainingCap = Math.max(0, bin.maxCapacity - bin.currentWeight);

            return (
              <div
                key={bin.id}
                id={`alert-card-${bin.id}`}
                className={`p-4 rounded-2xl bg-white border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs ${
                  isCritical ? 'border-rose-300 ring-1 ring-rose-200' : 'border-amber-300'
                }`}
              >
                {/* Left details */}
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isCritical
                        ? 'bg-rose-100 text-rose-600 animate-pulse'
                        : 'bg-amber-100 text-amber-600'
                    }`}
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {bin.id}
                      </span>
                      <span className="text-xs font-semibold text-slate-700">{bin.cityName}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isCritical
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        {isCritical ? 'COLLECTION REQUIRED (>90%)' : 'NEARLY FULL (70–89%)'}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 mt-1">{bin.locationName}</h4>

                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-1 flex-wrap">
                      <span>
                        Weight: <strong className="text-slate-900">{bin.currentWeight} kg</strong> / {bin.maxCapacity} kg
                      </span>
                      <span>
                        Remaining Space: <strong className="text-emerald-700">{remainingCap} kg</strong>
                      </span>
                      {bin.scheduledPickupDate && (
                        <span className="text-sky-700 font-medium flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-sky-600" />
                          Scheduled for {bin.scheduledPickupDate} ({bin.assignedVolunteer})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Progress & Action Buttons */}
                <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                  <div className="w-36 hidden lg:block">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                      <span>Fill</span>
                      <span className="font-bold text-slate-900">{fillPct.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full ${isCritical ? 'bg-rose-500' : 'bg-amber-500'}`}
                        style={{ width: `${Math.min(100, fillPct)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openSchedule(bin)}
                      className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
                    >
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{bin.scheduledPickupDate ? 'Reschedule' : 'Schedule Pickup'}</span>
                    </button>

                    <button
                      onClick={() => openComplete(bin)}
                      className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                    >
                      <ArrowDownToLine className="w-3.5 h-3.5" />
                      <span>Empty &amp; Log Record</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Schedule Modal */}
      {schedulingBin && (
        <div
          id="alert-schedule-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Dispatch Pickup for {schedulingBin.id}
              </h3>
              <button onClick={() => setSchedulingBin(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={confirmSchedule} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pickup Date *</label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Volunteer / Driver *</label>
                <input
                  type="text"
                  value={volunteerName}
                  onChange={(e) => setVolunteerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  required
                />
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSchedulingBin(null)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-semibold shadow-xs"
                >
                  Save Dispatch Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Modal */}
      {completingBin && (
        <div
          id="alert-complete-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-950 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Complete Pickup: {completingBin.id}</h3>
                <p className="text-[11px] text-emerald-300">Empties bin and moves weight to extruder records</p>
              </div>
              <button onClick={() => setCompletingBin(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={confirmComplete} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reclaimed Weight (kg) *</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max={completingBin.maxCapacity}
                  value={collectedWeight}
                  onChange={(e) => setCollectedWeight(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Plastic Type *</label>
                  <select
                    value={plasticCategory}
                    onChange={(e) => setPlasticCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    <option value="PET">PET</option>
                    <option value="HDPE">HDPE</option>
                    <option value="LDPE">LDPE</option>
                    <option value="PP">PP</option>
                    <option value="Mixed Plastic">Mixed Plastic</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Collector</label>
                  <input
                    type="text"
                    value={collectorName}
                    onChange={(e) => setCollectorName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes about pickup run"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCompletingBin(null)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-xs"
                >
                  Confirm Pickup &amp; Empty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
