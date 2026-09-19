import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { CollectionRecord, PlasticCategory } from '../types';
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Calendar,
  Layers,
  MapPin,
  FileSpreadsheet,
} from 'lucide-react';

export const CollectionRecordsView: React.FC = () => {
  const {
    collectionRecords,
    locations,
    bins,
    addCollectionRecord,
    editCollectionRecord,
    deleteCollectionRecord,
  } = useApp();

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLocation, setFilterLocation] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterBin, setFilterBin] = useState<string>('ALL');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');

  // Pagination
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const pageSize = 10;

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CollectionRecord | null>(null);
  const [viewingRecord, setViewingRecord] = useState<CollectionRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<CollectionRecord | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    date: string;
    locationId: string;
    locationName: string;
    binId: string;
    plasticCategory: PlasticCategory;
    weightKg: number;
    collector: string;
    notes: string;
  }>({
    date: '2026-09-19',
    locationId: locations[0]?.id || '',
    locationName: locations[0]?.name || '',
    binId: bins[0]?.id || '',
    plasticCategory: 'PET',
    weightKg: 25,
    collector: '',
    notes: '',
  });

  const [formError, setFormError] = useState('');

  const openAddModal = () => {
    const defaultLoc = locations[0];
    const defaultBins = bins.filter((b) => b.locationId === defaultLoc?.id);
    setFormData({
      date: '2026-09-19',
      locationId: defaultLoc?.id || '',
      locationName: defaultLoc?.name || '',
      binId: defaultBins[0]?.id || bins[0]?.id || '',
      plasticCategory: 'PET',
      weightKg: 25,
      collector: 'Tamil Nadu Eco Volunteer',
      notes: '',
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleLocationChange = (locId: string) => {
    const loc = locations.find((l) => l.id === locId);
    const locBins = bins.filter((b) => b.locationId === locId);
    setFormData((prev) => ({
      ...prev,
      locationId: locId,
      locationName: loc ? loc.name : '',
      binId: locBins[0]?.id || '',
    }));
  };

  const openEditModal = (rec: CollectionRecord) => {
    setEditingRecord(rec);
    setFormData({
      date: rec.date,
      locationId: rec.locationId,
      locationName: rec.locationName,
      binId: rec.binId,
      plasticCategory: rec.plasticCategory,
      weightKg: rec.weightKg,
      collector: rec.collector,
      notes: rec.notes || '',
    });
    setFormError('');
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.weightKg <= 0) {
      setFormError('Plastic weight must be greater than 0 kg.');
      return;
    }

    const success = addCollectionRecord(formData);
    if (success) {
      setIsAddModalOpen(false);
    } else {
      setFormError('Could not add record. Bin capacity might be exceeded.');
    }
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    if (formData.weightKg <= 0) {
      setFormError('Plastic weight must be greater than 0 kg.');
      return;
    }

    editCollectionRecord(editingRecord.id, formData);
    setEditingRecord(null);
  };

  // Filter logic
  const filteredRecords = useMemo(() => {
    return collectionRecords.filter((rec) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        rec.id.toLowerCase().includes(q) ||
        rec.locationName.toLowerCase().includes(q) ||
        rec.collector.toLowerCase().includes(q) ||
        rec.binId.toLowerCase().includes(q) ||
        (rec.notes && rec.notes.toLowerCase().includes(q));

      const matchesLocation = filterLocation === 'ALL' || rec.locationId === filterLocation;
      const matchesCategory = filterCategory === 'ALL' || rec.plasticCategory === filterCategory;
      const matchesBin = filterBin === 'ALL' || rec.binId === filterBin;

      let matchesDate = true;
      if (filterDateFrom && rec.date < filterDateFrom) matchesDate = false;
      if (filterDateTo && rec.date > filterDateTo) matchesDate = false;

      return matchesSearch && matchesLocation && matchesCategory && matchesBin && matchesDate;
    });
  }, [collectionRecords, searchQuery, filterLocation, filterCategory, filterBin, filterDateFrom, filterDateTo]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPageNum - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPageNum]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Record ID', 'Date', 'Location', 'Bin ID', 'Category', 'Weight (kg)', 'Collector', 'Notes'];
    const rows = filteredRecords.map((r) => [
      r.id,
      r.date,
      `"${r.locationName.replace(/"/g, '""')}"`,
      r.binId,
      r.plasticCategory,
      r.weightKg,
      `"${r.collector.replace(/"/g, '""')}"`,
      `"${(r.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `plastic_collection_records_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryBadgeClass = (category: PlasticCategory) => {
    switch (category) {
      case 'PET':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'HDPE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'LDPE':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'PP':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Mixed Plastic':
        return 'bg-pink-100 text-pink-800 border-pink-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div id="collection-records-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-sky-600" />
            Plastic Collection Records
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Log and trace all raw plastic arrivals from Tamil Nadu drop-off bins destined for the solar extruder.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="export-collection-records-csv-btn"
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 border border-slate-200"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            id="log-collection-btn"
            onClick={openAddModal}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Log Collection</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search bar */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="records-search-input"
              type="text"
              placeholder="Search records, depot, collector..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPageNum(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Location filter */}
          <div>
            <select
              id="records-location-filter"
              value={filterLocation}
              onChange={(e) => {
                setFilterLocation(e.target.value);
                setCurrentPageNum(1);
              }}
              className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="ALL">All Depots</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.city} - {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category filter */}
          <div>
            <select
              id="records-category-filter"
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setCurrentPageNum(1);
              }}
              className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="ALL">All Plastic Types</option>
              <option value="PET">PET</option>
              <option value="HDPE">HDPE</option>
              <option value="LDPE">LDPE</option>
              <option value="PP">PP</option>
              <option value="Mixed Plastic">Mixed Plastic</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Bin filter */}
          <div>
            <select
              id="records-bin-filter"
              value={filterBin}
              onChange={(e) => {
                setFilterBin(e.target.value);
                setCurrentPageNum(1);
              }}
              className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="ALL">All Bins</option>
              {bins.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.id} ({b.cityName})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date range filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium">Date Range:</span>
          <input
            type="date"
            value={filterDateFrom}
            onChange={(e) => {
              setFilterDateFrom(e.target.value);
              setCurrentPageNum(1);
            }}
            className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700"
            placeholder="From Date"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={filterDateTo}
            onChange={(e) => {
              setFilterDateTo(e.target.value);
              setCurrentPageNum(1);
            }}
            className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700"
            placeholder="To Date"
          />
          {(filterDateFrom || filterDateTo || filterLocation !== 'ALL' || filterCategory !== 'ALL' || filterBin !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterLocation('ALL');
                setFilterCategory('ALL');
                setFilterBin('ALL');
                setFilterDateFrom('');
                setFilterDateTo('');
                setCurrentPageNum(1);
              }}
              className="text-xs text-sky-600 hover:text-sky-800 font-semibold ml-auto"
            >
              Reset All Filters
            </button>
          )}
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Depot Location</th>
                <th className="py-3.5 px-4">Bin ID</th>
                <th className="py-3.5 px-4">Plastic Category</th>
                <th className="py-3.5 px-4 text-right">Weight (kg)</th>
                <th className="py-3.5 px-4">Collector</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No collection records found matching your filters.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-900 font-medium whitespace-nowrap">
                      {record.date}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{record.locationName}</div>
                      <div className="text-[11px] text-slate-400">{record.id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px] font-semibold">
                        {record.binId}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryBadgeClass(
                          record.plasticCategory
                        )}`}
                      >
                        {record.plasticCategory}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                      {record.weightKg} kg
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {record.collector}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setViewingRecord(record)}
                          className="p-1 text-slate-400 hover:text-sky-600 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(record)}
                          className="p-1 text-slate-400 hover:text-amber-600 rounded transition-colors"
                          title="Edit Record"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingRecord(record)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Showing{' '}
            <span className="font-semibold text-slate-900">
              {filteredRecords.length > 0 ? (currentPageNum - 1) * pageSize + 1 : 0}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-slate-900">
              {Math.min(currentPageNum * pageSize, filteredRecords.length)}
            </span>{' '}
            of <span className="font-semibold text-slate-900">{filteredRecords.length}</span> records
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPageNum((p) => Math.max(1, p - 1))}
              disabled={currentPageNum === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-semibold text-slate-800">
              Page {currentPageNum} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPageNum((p) => Math.min(totalPages, p + 1))}
              disabled={currentPageNum === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Record Modal */}
      {(isAddModalOpen || editingRecord) && (
        <div
          id="collection-record-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                {editingRecord ? 'Edit Plastic Collection Record' : 'Log New Plastic Arrival'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingRecord(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={editingRecord ? handleSubmitEdit : handleSubmitAdd}
              className="p-6 space-y-4 text-xs"
            >
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Collection Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Weight (kg) *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="1000"
                    value={formData.weightKg}
                    onChange={(e) => setFormData({ ...formData, weightKg: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Collection Depot *</label>
                <select
                  value={formData.locationId}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.city} — {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Bin *</label>
                  <select
                    value={formData.binId}
                    onChange={(e) => setFormData({ ...formData, binId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {bins
                      .filter((b) => !formData.locationId || b.locationId === formData.locationId)
                      .map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.id} ({b.currentWeight}/{b.maxCapacity} kg)
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Plastic Category *</label>
                  <select
                    value={formData.plasticCategory}
                    onChange={(e) => setFormData({ ...formData, plasticCategory: e.target.value as PlasticCategory })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="PET">PET (Bottles)</option>
                    <option value="HDPE">HDPE (Containers/Caps)</option>
                    <option value="LDPE">LDPE (Bags/Films)</option>
                    <option value="PP">PP (Molded/Straps)</option>
                    <option value="Mixed Plastic">Mixed Plastic</option>
                    <option value="Other">Other Polymers</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Collector / Volunteer Name *</label>
                <input
                  type="text"
                  value={formData.collector}
                  onChange={(e) => setFormData({ ...formData, collector: e.target.value })}
                  placeholder="e.g. S. Muthuvel / Corporation Segregation Unit"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Origin</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Cleared from weekend market collection"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingRecord(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl shadow-xs"
                >
                  {editingRecord ? 'Save Changes' : 'Log Collection Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Record Details Modal */}
      {viewingRecord && (
        <div
          id="view-record-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-sky-400 uppercase">{viewingRecord.id}</span>
                <h3 className="text-base font-bold">Plastic Collection Details</h3>
              </div>
              <button
                onClick={() => setViewingRecord(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 bg-sky-50/50 rounded-xl border border-sky-100 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block text-[11px]">Weight Collected</span>
                  <span className="text-2xl font-bold text-sky-900">{viewingRecord.weightKg} kg</span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full font-bold text-xs border ${getCategoryBadgeClass(
                    viewingRecord.plasticCategory
                  )}`}
                >
                  {viewingRecord.plasticCategory}
                </span>
              </div>

              <div className="space-y-2 text-slate-700">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Date Logged:</span>
                  <span className="font-semibold">{viewingRecord.date}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Depot:</span>
                  <span className="font-semibold text-right">{viewingRecord.locationName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Bin Target:</span>
                  <span className="font-mono font-semibold">{viewingRecord.binId}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Collector:</span>
                  <span className="font-semibold">{viewingRecord.collector}</span>
                </div>
                {viewingRecord.notes && (
                  <div className="pt-1">
                    <span className="text-slate-400 block mb-1">Notes:</span>
                    <p className="p-2.5 bg-slate-50 rounded-lg text-slate-600 text-[11px] leading-relaxed">
                      {viewingRecord.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setViewingRecord(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Record Confirmation Modal */}
      {deletingRecord && (
        <div
          id="delete-record-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full border border-slate-200 p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Collection Record?</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Remove record <strong>{deletingRecord.id}</strong> ({deletingRecord.weightKg} kg of {deletingRecord.plasticCategory}) from history?
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingRecord(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteCollectionRecord(deletingRecord.id);
                  setDeletingRecord(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs shadow-xs"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
