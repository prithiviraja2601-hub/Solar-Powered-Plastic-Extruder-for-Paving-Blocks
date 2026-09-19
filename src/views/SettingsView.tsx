import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings,
  Flame,
  Recycle,
  IndianRupee,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Trash2,
  Sliders,
  ShieldAlert,
  Sun,
  Server,
  Zap,
  Percent,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetDemoData, addToast } = useApp();

  const [formValues, setFormValues] = useState({ ...settings });
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formValues);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleConfirmReset = () => {
    resetDemoData();
    setIsResetConfirmOpen(false);
    setFormValues({
      pricePerBlock: 35,
      transportRate: 15,
      taxRate: 5,
      lowStockThreshold: 1000,
      solarPanelOutputKw: 18.5,
      extruderTemperatureC: 195,
      extrusionCapacityKgPerHour: 45,
      kgPlasticPerBlock: 2.2,
    });
  };

  return (
    <div id="settings-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-700" />
            System Configuration &amp; Extruder Calibration
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage operational parameters, threshold triggers, solar thermodynamic targets, and demo simulation states.
          </p>
        </div>

        {savedSuccess && (
          <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 self-start md:self-auto">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Extruder & Engineering Parameters */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-3">
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Solar Thermal Extruder Specifications</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Extrusion Melting Temperature (°C)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="140"
                  max="280"
                  step="1"
                  value={formValues.extruderTemperatureC}
                  onChange={(e) =>
                    setFormValues({ ...formValues, extruderTemperatureC: parseInt(e.target.value) || 190 })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                  °C
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Optimal for PET/HDPE blends: 185°C – 210°C
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Plastic per Paving Block (kg)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1.0"
                  max="5.0"
                  step="0.1"
                  value={formValues.kgPlasticPerBlock}
                  onChange={(e) =>
                    setFormValues({ ...formValues, kgPlasticPerBlock: parseFloat(e.target.value) || 2.2 })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                  kg
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Yield multiplier for conversion calculators
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Extrusion Throughput Capacity (kg/hr)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="10"
                  max="200"
                  step="5"
                  value={formValues.extrusionCapacityKgPerHour}
                  onChange={(e) =>
                    setFormValues({ ...formValues, extrusionCapacityKgPerHour: parseFloat(e.target.value) || 45 })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                  kg/hr
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Average continuous hourly output rate
              </p>
            </div>
          </div>
        </div>

        {/* Commercial Rates & Logistics */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-3">
            <Sliders className="w-4 h-4 text-sky-600" />
            <span>Commercial Pricing &amp; Warehouse Parameters</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Standard Price per Block (₹)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="10"
                  max="500"
                  step="1"
                  value={formValues.pricePerBlock}
                  onChange={(e) =>
                    setFormValues({ ...formValues, pricePerBlock: parseFloat(e.target.value) || 35 })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                  ₹
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Base price per heavy-duty paving unit
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Logistics Rate (₹ / km)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={formValues.transportRate}
                  onChange={(e) =>
                    setFormValues({ ...formValues, transportRate: parseFloat(e.target.value) || 15 })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                  ₹/km
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Inter-district transport tariff
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                GST / Tax Rate (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="28"
                  step="0.5"
                  value={formValues.taxRate}
                  onChange={(e) =>
                    setFormValues({ ...formValues, taxRate: parseFloat(e.target.value) || 5 })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                  %
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Standard recycled goods tax rate (5%)
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Low Stock Threshold (Units)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="100"
                  max="10000"
                  step="100"
                  value={formValues.lowStockThreshold}
                  onChange={(e) =>
                    setFormValues({ ...formValues, lowStockThreshold: parseInt(e.target.value) || 1000 })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                  units
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Triggers dashboard low inventory warnings
              </p>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            Save Configuration Changes
          </button>
        </div>
      </form>

      {/* Danger Zone / Demo Reset */}
      <div className="p-6 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-4">
        <div className="flex items-center gap-2 text-rose-950 font-bold text-sm">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <span>Demo Data Management &amp; System Reset</span>
        </div>

        <p className="text-xs text-rose-800 leading-relaxed max-w-2xl">
          Resetting will restore all 12 Tamil Nadu regional collection depots, 25+ demo smart bins, pre-loaded collection logs, and sample commercial paving block sales to the verified initial demo state.
        </p>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Database to Initial Demo State</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full border border-slate-200 p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">Reset All Demo Data?</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                This will reset your browser&apos;s localStorage back to the verified Tamil Nadu initial dataset. Any newly added locations or orders will be replaced with default records.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs shadow-xs"
              >
                Yes, Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
