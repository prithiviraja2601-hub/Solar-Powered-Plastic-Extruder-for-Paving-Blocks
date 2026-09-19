import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Location } from '../types';
import { TN_CITIES } from '../data/initialData';
import {
  MapPin,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Eye,
  X,
  Check,
  Building,
  User,
  Phone,
  Layers,
  AlertCircle,
  Calendar,
} from 'lucide-react';

export const LocationsView: React.FC = () => {
  const {
    locations,
    bins,
    collectionRecords,
    addLocation,
    editLocation,
    deleteLocation,
    selectedLocationIdFilter,
    setSelectedLocationIdFilter,
    setCurrentPage,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [viewingLocation, setViewingLocation] = useState<Location | null>(null);
  const [deletingLocation, setDeletingLocation] = useState<Location | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    city: 'Chennai',
    district: 'Chennai',
    address: '',
    latitude: 13.0827,
    longitude: 80.2707,
    contactPerson: '',
    contactNumber: '',
    numberOfBins: 2,
    binCapacity: 200,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleCityChange = (city: string) => {
    const matched = TN_CITIES.find((c) => c.city === city);
    if (matched) {
      setFormData((prev) => ({
        ...prev,
        city: matched.city,
        district: matched.district,
        latitude: matched.lat,
        longitude: matched.lng,
      }));
    } else {
      setFormData((prev) => ({ ...prev, city }));
    }
  };

  const openAddModal = () => {
    setFormData({
      name: '',
      city: 'Chennai',
      district: 'Chennai',
      address: '',
      latitude: 13.0827,
      longitude: 80.2707,
      contactPerson: '',
      contactNumber: '',
      numberOfBins: 2,
      binCapacity: 200,
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const openEditModal = (loc: Location) => {
    setEditingLocation(loc);
    setFormData({
      name: loc.name,
      city: loc.city,
      district: loc.district,
      address: loc.address,
      latitude: loc.latitude,
      longitude: loc.longitude,
      contactPerson: loc.contactPerson,
      contactNumber: loc.contactNumber,
      numberOfBins: loc.numberOfBins || 2,
      binCapacity: loc.binCapacity || 200,
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Location name is required';
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.contactPerson.trim()) errors.contactPerson = 'Contact person is required';
    if (!formData.contactNumber.trim()) errors.contactNumber = 'Contact number is required';
    if (formData.numberOfBins < 1) errors.numberOfBins = 'Must have at least 1 bin';
    if (formData.binCapacity <= 0) errors.binCapacity = 'Bin capacity must be greater than 0';
    if (!formData.latitude || isNaN(formData.latitude)) errors.latitude = 'Valid latitude required';
    if (!formData.longitude || isNaN(formData.longitude)) errors.longitude = 'Valid longitude required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    addLocation(formData);
    setIsAddModalOpen(false);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLocation || !validateForm()) return;

    editLocation(editingLocation.id, formData);
    setEditingLocation(null);
  };

  const confirmDelete = () => {
    if (!deletingLocation) return;
    deleteLocation(deletingLocation.id);
    setDeletingLocation(null);
    if (viewingLocation?.id === deletingLocation.id) {
      setViewingLocation(null);
    }
  };

  // Filtered Locations
  const filteredLocations = locations.filter((loc) => {
    const matchesSearch =
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCity = selectedCity === 'ALL' || loc.city === selectedCity;
    const matchesLocationId = !selectedLocationIdFilter || loc.id === selectedLocationIdFilter;

    return matchesSearch && matchesCity && matchesLocationId;
  });

  const uniqueCities = Array.from(new Set(locations.map((l) => l.city))).sort();

  return (
    <div id="locations-view" className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-sky-600" />
            Collection Locations Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered regional plastic aggregation depots and drop-off hubs across Tamil Nadu.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {selectedLocationIdFilter && (
            <button
              onClick={() => setSelectedLocationIdFilter(null)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
            >
              <span>Clear Filter</span>
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            id="add-location-btn"
            onClick={openAddModal}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Location</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="locations-search-input"
            type="text"
            placeholder="Search by name, city, district, or contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            id="locations-city-filter"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="ALL">All Tamil Nadu Cities ({locations.length})</option>
            {uniqueCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Locations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLocations.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
            <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-700">No locations matched your criteria</h4>
            <p className="text-xs text-slate-500">Try modifying your search or city filter.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCity('ALL');
                setSelectedLocationIdFilter(null);
              }}
              className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-semibold rounded-xl text-slate-700"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredLocations.map((loc) => {
            const locBins = bins.filter((b) => b.locationId === loc.id);
            const totalWeight = locBins.reduce((sum, b) => sum + b.currentWeight, 0);
            const totalCap = locBins.reduce((sum, b) => sum + b.maxCapacity, 0);
            const fillPct = totalCap > 0 ? (totalWeight / totalCap) * 100 : 0;
            const needsPickup = locBins.some(
              (b) => b.status === 'COLLECTION_REQUIRED' || (b.currentWeight / b.maxCapacity) * 100 > 90
            );

            return (
              <div
                key={loc.id}
                id={`location-card-${loc.id}`}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200">
                      {loc.city} &bull; {loc.district}
                    </span>
                    {needsPickup && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-300 animate-pulse">
                        Pickup Required
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{loc.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{loc.address}</p>
                </div>

                {/* Metrics */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Fill Level ({fillPct.toFixed(1)}%)</span>
                    <span className="font-bold text-slate-800">
                      {totalWeight} / {totalCap} kg
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        fillPct > 90 ? 'bg-rose-500' : fillPct >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, fillPct)}%` }}
                    />
                  </div>

                  <div className="pt-1 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                    <div>Bins: <strong>{locBins.length}</strong></div>
                    <div>Contact: <strong className="truncate block">{loc.contactPerson}</strong></div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    id={`view-loc-btn-${loc.id}`}
                    onClick={() => setViewingLocation(loc)}
                    className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      id={`edit-loc-btn-${loc.id}`}
                      onClick={() => openEditModal(loc)}
                      className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Edit Location"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`delete-loc-btn-${loc.id}`}
                      onClick={() => setDeletingLocation(loc)}
                      className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Location"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Location Modal */}
      {(isAddModalOpen || editingLocation) && (
        <div
          id="location-form-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                {editingLocation ? 'Edit Collection Location' : 'Register New Collection Location'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingLocation(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={editingLocation ? handleSubmitEdit : handleSubmitAdd}
              className="p-6 space-y-4 overflow-y-auto flex-1 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Location Depot Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Marina Eco-Collection Depot"
                  className={`w-full px-3 py-2 rounded-xl border ${
                    formErrors.name ? 'border-rose-500 bg-rose-50' : 'border-slate-200'
                  } focus:outline-none focus:ring-2 focus:ring-sky-500`}
                />
                {formErrors.name && <p className="text-[11px] text-rose-500 mt-1">{formErrors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tamil Nadu City *</label>
                  <select
                    value={formData.city}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {TN_CITIES.map((c) => (
                      <option key={c.city} value={c.city}>
                        {c.city}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">District *</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Street Address *</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street name, landmark, postal code"
                  className={`w-full px-3 py-2 rounded-xl border ${
                    formErrors.address ? 'border-rose-500 bg-rose-50' : 'border-slate-200'
                  } focus:outline-none focus:ring-2 focus:ring-sky-500`}
                />
                {formErrors.address && <p className="text-[11px] text-rose-500 mt-1">{formErrors.address}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Person *</label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="Site supervisor"
                    className={`w-full px-3 py-2 rounded-xl border ${
                      formErrors.contactPerson ? 'border-rose-500 bg-rose-50' : 'border-slate-200'
                    }`}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Number *</label>
                  <input
                    type="tel"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    placeholder="+91 98400 12345"
                    className={`w-full px-3 py-2 rounded-xl border ${
                      formErrors.contactNumber ? 'border-rose-500 bg-rose-50' : 'border-slate-200'
                    }`}
                  />
                </div>
              </div>

              {!editingLocation && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Initial Bins to Deploy</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.numberOfBins}
                      onChange={(e) => setFormData({ ...formData, numberOfBins: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Bin Max Capacity (kg)</label>
                    <input
                      type="number"
                      min="50"
                      max="1000"
                      step="10"
                      value={formData.binCapacity}
                      onChange={(e) => setFormData({ ...formData, binCapacity: parseFloat(e.target.value) || 200 })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingLocation(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-xs shadow-xs"
                >
                  {editingLocation ? 'Save Changes' : 'Create Location Depot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Location Details Modal */}
      {viewingLocation && (
        <div
          id="view-location-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400">
                  {viewingLocation.city} &bull; {viewingLocation.district}
                </span>
                <h3 className="text-base font-bold">{viewingLocation.name}</h3>
              </div>
              <button
                onClick={() => setViewingLocation(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto text-xs">
              {/* Overview Details */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block mb-0.5">Address</span>
                  <span className="font-semibold text-slate-800">{viewingLocation.address}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Contact Supervisor</span>
                  <span className="font-semibold text-slate-800">{viewingLocation.contactPerson}</span>
                  <span className="text-slate-500 block">{viewingLocation.contactNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">GPS Coordinates</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {viewingLocation.latitude.toFixed(4)}, {viewingLocation.longitude.toFixed(4)}
                  </span>
                </div>
              </div>

              {/* Bins list at this location */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center justify-between">
                  <span>Deployed Bins at this Location</span>
                  <span className="text-xs font-normal text-slate-500">
                    {bins.filter((b) => b.locationId === viewingLocation.id).length} bins installed
                  </span>
                </h4>

                <div className="space-y-2">
                  {bins
                    .filter((b) => b.locationId === viewingLocation.id)
                    .map((bin) => {
                      const fillPct = (bin.currentWeight / bin.maxCapacity) * 100;
                      return (
                        <div
                          key={bin.id}
                          className="p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-4"
                        >
                          <div>
                            <div className="font-bold text-slate-800">{bin.id}</div>
                            <div className="text-slate-500 text-[11px]">{bin.notes || 'Drop-off bin'}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-slate-900">
                              {bin.currentWeight} / {bin.maxCapacity} kg ({fillPct.toFixed(0)}%)
                            </div>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                fillPct > 90
                                  ? 'bg-rose-100 text-rose-700'
                                  : fillPct >= 70
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {bin.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setViewingLocation(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingLocation && (
        <div
          id="delete-location-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full border border-slate-200 p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Location Depot?</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Are you sure you want to delete <strong>{deletingLocation.name}</strong>? All associated bins and records will also be removed.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingLocation(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs shadow-xs"
              >
                Yes, Delete Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
