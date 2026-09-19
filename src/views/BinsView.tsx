import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bin, PlasticCategory } from '../types';
import {
  Trash2,
  Calendar,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  ArrowDownToLine,
  X,
  Plus,
  Layers,
  MapPin,
} from 'lucide-react';

export const BinsView: React.FC = () => {
  const { bins, locations, schedulePickup, completePickup } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals
  const [schedulingBin, setSchedulingBin] = useState<Bin | null>(null);
  const [pickupDate, setPickupDate] = useState('2026-09-20');
  const [volunteerName, setVolunteerName] = useState('Anand Kumar (Eco Corps)');

  const [completingBin, setCompletingBin] = useState<Bin | null>(null);
  const [collectedWeight, setCollectedWeight] = useState<number>(0);
  const [plasticCategory, setPlasticCategory] = useState<PlasticCategory>('PET');
  const [collectorName, setCollectorName] = useState('Tamil Nadu Waste Recovery Team');
  const [notes, setNotes] = useState('');

  const openScheduleModal = (bin: Bin) => {
    setSchedulingBin(bin);
    setPickupDate('2026-09-20');
    setVolunteerName(bin.assignedVolunteer || 'R. Senthil (Volunteer Lead)');
  };

  const handleConfirmSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulingBin) return;
    schedulePickup(schedulingBin.id, pickupDate, volunteerName);
    setSchedulingBin(null);
  };

  const openCompleteModal = (bin: Bin) => {
    setCompletingBin(bin);
    setCollectedWeight(bin.currentWeight);
    setPlasticCategory('PET');
    setCollectorName('Green Tamil Nadu Logistics');
    setNotes(`Routine emptying of ${bin.id}`);
  };

  const handleConfirmComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingBin) return;
    completePickup(completingBin.id, collectedWeight, plasticCategory, collectorName, notes);
    setCompletingBin(null);
  };

  // Filtered Bins
  const filteredBins = bins.filter((bin) => {
    const matchesSearch =
      bin.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bin.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bin.cityName.toLowerCase().includes(searchQuery.toLowerCase());

    const fillPct = (bin.currentWeight / bin.maxCapacity) * 100;
    let matchesStatus = true;
    if (statusFilter === 'COLLECTION_REQUIRED') {
      matchesStatus = fillPct > 90 || bin.status === 'COLLECTION_REQUIRED';
    } else if (statusFilter === 'NEARLY_FULL') {
      matchesStatus = fillPct >= 70 && fillPct <= 90;
    } else if (statusFilter === 'AVAILABLE') {
      matchesStatus = fillPct < 70;
    }

    return matchesSearch && matchesStatus;
  });

  return (
    <div id="bins-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-emerald-600" />
            Bin Monitoring Matrix
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time fill levels, telemetry weights, and pickup dispatcher across 25+ deployed smart bins.
          </p>
        </div>

        {/* Legend pills */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
            Available (0–69%)
          </span>
          <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
            Nearly Full (70–89%)
          </span>
          <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold animate-pulse">
            Collection Required (&gt;90%)
          </span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="bins-search-input"
            type="text"
            placeholder="Search by Bin ID, Depot Name, or City..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            id="bins-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">All Bin Statuses ({bins.length})</option>
            <option value="COLLECTION_REQUIRED">Collection Required (&gt;90%)</option>
            <option value="NEARLY_FULL">Nearly Full (70–89%)</option>
            <option value="AVAILABLE">Available (0–69%)</option>
          </select>
        </div>
      </div>

      {/* Bins Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBins.map((bin) => {
          const fillPct = (bin.currentWeight / bin.maxCapacity) * 100;
          const remainingCap = Math.max(0, bin.maxCapacity - bin.currentWeight);
          const isUrgent = fillPct > 90 || bin.status === 'COLLECTION_REQUIRED';
          const isWarning = fillPct >= 70 && fillPct <= 90;

          return (
            <div
              key={bin.id}
              id={`bin-card-${bin.id}`}
              className={`p-5 rounded-2xl bg-white border transition-all shadow-xs flex flex-col justify-between space-y-4 ${
                isUrgent
                  ? 'border-rose-300 ring-1 ring-rose-200'
                  : isWarning
                  ? 'border-amber-300'
                  : 'border-slate-200'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {bin.id}
                    </span>
                    <span className="text-xs font-medium text-slate-500">{bin.cityName}</span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isUrgent
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : isWarning
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}
                  >
                    {isUrgent ? 'COLLECTION REQUIRED' : isWarning ? 'NEARLY FULL' : 'AVAILABLE'}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-800 truncate" title={bin.locationName}>
                  {bin.locationName}
                </h3>
              </div>

              {/* Progress and Fill Telemetry */}
              <div className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">Fill Level:</span>
                  <span className="font-bold text-slate-900">{fillPct.toFixed(1)}%</span>
                </div>

                <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isUrgent ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, fillPct)}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1">
                  <div>Weight: <strong>{bin.currentWeight} kg</strong></div>
                  <div>Max Cap: <strong>{bin.maxCapacity} kg</strong></div>
                  <div>Remaining: <strong className="text-emerald-700">{remainingCap} kg</strong></div>
                  <div>Last Pick: <strong>{bin.lastPickupDate || 'None'}</strong></div>
                </div>

                {bin.scheduledPickupDate && (
                  <div className="p-2 rounded-lg bg-sky-50 border border-sky-200 text-sky-900 text-[11px] flex items-center justify-between">
                    <span className="flex items-center gap-1 font-semibold">
                      <Calendar className="w-3 h-3 text-sky-600" />
                      Pickup: {bin.scheduledPickupDate}
                    </span>
                    <span className="text-[10px] text-sky-700 truncate max-w-[100px]">
                      {bin.assignedVolunteer}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  id={`schedule-pickup-btn-${bin.id}`}
                  onClick={() => openScheduleModal(bin)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Schedule</span>
                </button>

                <button
                  id={`complete-pickup-btn-${bin.id}`}
                  onClick={() => openCompleteModal(bin)}
                  disabled={bin.currentWeight <= 0}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 shadow-2xs transition-colors ${
                    bin.currentWeight <= 0
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : isUrgent
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <ArrowDownToLine className="w-3.5 h-3.5" />
                  <span>Empty Bin</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Schedule Pickup Modal */}
      {schedulingBin && (
        <div
          id="schedule-pickup-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Schedule Pickup for {schedulingBin.id}
              </h3>
              <button
                onClick={() => setSchedulingBin(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmSchedule} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="font-semibold text-slate-800">{schedulingBin.locationName}</div>
                <div className="text-slate-500">
                  Current Load: <strong>{schedulingBin.currentWeight} kg</strong> ({((schedulingBin.currentWeight / schedulingBin.maxCapacity) * 100).toFixed(1)}% full)
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Pickup Date *</label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Volunteer / Driver *</label>
                <input
                  type="text"
                  value={volunteerName}
                  onChange={(e) => setVolunteerName(e.target.value)}
                  placeholder="Volunteer name or collection vehicle ID"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSchedulingBin(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-xs"
                >
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Pickup Modal */}
      {completingBin && (
        <div
          id="complete-pickup-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-950 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Complete Pickup &amp; Empty Bin</h3>
                <p className="text-[11px] text-emerald-300">Empties bin and logs collection record</p>
              </div>
              <button
                onClick={() => setCompletingBin(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmComplete} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1 text-emerald-950">
                <div className="font-bold">{completingBin.id} — {completingBin.locationName}</div>
                <div className="text-[11px]">
                  Registered weight on bin: <strong>{completingBin.currentWeight} kg</strong>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Actual Reclaimed Weight (kg) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.1"
                  max={completingBin.maxCapacity}
                  value={collectedWeight}
                  onChange={(e) => setCollectedWeight(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Bin will be emptied and this weight transferred to collection records.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Plastic Type *</label>
                  <select
                    value={plasticCategory}
                    onChange={(e) => setPlasticCategory(e.target.value as PlasticCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="PET">PET (Bottles)</option>
                    <option value="HDPE">HDPE (Jugs/Caps)</option>
                    <option value="LDPE">LDPE (Bags/Wrap)</option>
                    <option value="PP">PP (Rigid Plastic)</option>
                    <option value="Mixed Plastic">Mixed Plastic</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Collector Team</label>
                  <input
                    type="text"
                    value={collectorName}
                    onChange={(e) => setCollectorName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pickup Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Cleared morning batch, transported to solar shredder"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCompletingBin(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-xs"
                >
                  Confirm &amp; Reset Bin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
