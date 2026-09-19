import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { InventoryTransaction } from '../types';
import {
  Boxes,
  Plus,
  Minus,
  AlertTriangle,
  Calendar,
  History,
  TrendingUp,
  Download,
  Search,
  CheckCircle2,
  X,
  Calculator,
  Sun,
  Flame,
} from 'lucide-react';

export const InventoryView: React.FC = () => {
  const {
    transactions,
    stats,
    settings,
    addStock,
    removeStock,
    setCurrentPage,
  } = useApp();

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeductModalOpen, setIsDeductModalOpen] = useState(false);

  // Form states
  const [addQuantity, setAddQuantity] = useState<number>(100);
  const [addNotes, setAddNotes] = useState('Solar extruder batch #42 (PET/HDPE mix)');
  const [operator, setOperator] = useState('K. Vijayakumar (Extruder Tech)');

  const [deductQuantity, setDeductQuantity] = useState<number>(20);
  const [deductReason, setDeductReason] = useState('Quality inspection & compression fracture test');

  // Search filter for movement history
  const [historySearch, setHistorySearch] = useState('');

  const handleConfirmAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (addQuantity <= 0) return;
    addStock(
      addQuantity,
      `${addNotes || 'Solar extrusion run'} (Operator: ${operator || 'Tech Team'})`
    );
    setIsAddModalOpen(false);
  };

  const handleConfirmDeduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (deductQuantity <= 0) return;
    if (deductQuantity > stats.currentStock) {
      alert('Cannot deduct more than available inventory!');
      return;
    }
    const success = removeStock(deductQuantity, deductReason || 'Stock manual adjustment');
    if (success) {
      setIsDeductModalOpen(false);
    }
  };

  const filteredMovements = transactions.filter((m: InventoryTransaction) => {
    const q = historySearch.toLowerCase();
    return (
      m.reason.toLowerCase().includes(q) ||
      m.date.toLowerCase().includes(q) ||
      m.type.toLowerCase().includes(q)
    );
  });

  const exportMovementsCSV = () => {
    const headers = ['Log ID', 'Date', 'Type', 'Change Quantity', 'Balance After', 'Notes / Reference'];
    const rows = filteredMovements.map((m: InventoryTransaction) => [
      m.id,
      m.date,
      m.type,
      m.quantity,
      m.stockAfter,
      `"${m.reason.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e: any[]) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `paving_block_stock_movements_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="inventory-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-amber-600" />
            Paving Block Inventory Warehouse
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Finished eco-composite paving blocks produced by the solar plastic extruder ready for commercial sales.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="inv-open-calculator-btn"
            onClick={() => setCurrentPage('order-calculator')}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 border border-slate-200"
          >
            <Calculator className="w-3.5 h-3.5 text-slate-500" />
            <span>Order Calculator</span>
          </button>

          <button
            id="inv-deduct-stock-btn"
            onClick={() => setIsDeductModalOpen(true)}
            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 border border-rose-200"
          >
            <Minus className="w-3.5 h-3.5" />
            <span>Manual Deduction</span>
          </button>

          <button
            id="inv-add-stock-btn"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Extruded Stock</span>
          </button>
        </div>
      </div>

      {/* Stock Cards & Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main Stock Gauge */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Available Inventory
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                stats.isLowStock
                  ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}
            >
              {stats.isLowStock ? 'LOW STOCK ALERT' : 'HEALTHY STOCK'}
            </span>
          </div>

          <div className="my-4">
            <div className="text-4xl font-extrabold text-slate-900 tracking-tight">
              {stats.currentStock.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-1">Standard Interlocking Paving Units</div>
          </div>

          <div className="text-xs text-slate-600 flex items-center justify-between pt-3 border-t border-slate-100">
            <span>Safety Threshold: <strong>{settings.lowStockThreshold} units</strong></span>
            <span>Commercial Value: <strong>₹{(stats.currentStock * settings.pricePerBlock).toLocaleString('en-IN')}</strong></span>
          </div>
        </div>

        {/* Specifications */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Block Technical Specs
          </div>

          <div className="space-y-2 text-xs text-slate-700">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-400">Dimensions:</span>
              <span className="font-semibold">200 x 100 x 60 mm</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-400">Plastic Per Block:</span>
              <span className="font-semibold">{settings.kgPlasticPerBlock || 2.2} kg polymer</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-400">Compressive Strength:</span>
              <span className="font-semibold text-emerald-600">&gt; 35 MPa (Heavy Duty)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Standard Retail Rate:</span>
              <span className="font-semibold text-slate-900">₹{settings.pricePerBlock} / block</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Formed with 100% solar thermal energy without coal clinker.</span>
          </div>
        </div>

        {/* Extrusion Yield & Cumulative Output */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-emerald-500/10 border border-amber-500/20 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider mb-1">
              <Flame className="w-4 h-4 text-amber-600" />
              <span>Solar Extruder Yield</span>
            </div>
            <p className="text-xs text-slate-600">
              Direct conversion ratio of reclaimed Tamil Nadu municipal polymers.
            </p>
          </div>

          <div className="space-y-3 my-2 text-xs">
            <div className="p-2.5 bg-white/80 rounded-xl border border-amber-200">
              <div className="text-slate-500 text-[11px]">Total Plastic Extruded to Date</div>
              <div className="text-base font-bold text-slate-900">
                {stats.totalPlasticCollectedKg.toLocaleString()} kg
              </div>
            </div>

            <div className="p-2.5 bg-white/80 rounded-xl border border-amber-200">
              <div className="text-slate-500 text-[11px]">Equivalent Blocks Produced</div>
              <div className="text-base font-bold text-emerald-700">
                {Math.floor(stats.totalPlasticCollectedKg / (settings.kgPlasticPerBlock || 2.2)).toLocaleString()} blocks
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-2xs"
          >
            Record Extruder Production Batch &rarr;
          </button>
        </div>
      </div>

      {/* Stock Movement Audit Log */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-bold text-slate-900">Warehouse Stock Movement Audit Trail</h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search audit trail..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              onClick={exportMovementsCSV}
              className="p-1.5 text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              title="Export Stock Movements CSV"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4 text-right">Balance After</th>
                <th className="py-3 px-4">Description / Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredMovements.map((m: InventoryTransaction) => (
                <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-4 font-mono whitespace-nowrap text-slate-900">{m.date}</td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        m.quantity > 0
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : m.type === 'ORDER_FULFILLMENT'
                          ? 'bg-sky-100 text-sky-800 border-sky-300'
                          : 'bg-rose-100 text-rose-800 border-rose-300'
                      }`}
                    >
                      {m.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td
                    className={`py-2.5 px-4 text-right font-bold whitespace-nowrap ${
                      m.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {m.quantity > 0 ? `+${m.quantity}` : m.quantity} units
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-900">
                    {m.stockAfter.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-4 text-slate-600">{m.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Stock Modal */}
      {isAddModalOpen && (
        <div
          id="add-stock-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-amber-500 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Extruded Paving Block Stock
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-amber-100 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAdd} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Quantity Produced (Units) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  step="1"
                  value={addQuantity}
                  onChange={(e) => setAddQuantity(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-base focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Consumes approx {Math.round(addQuantity * (settings.kgPlasticPerBlock || 2.2))} kg of melted polymer.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Extruder Operator *</label>
                <input
                  type="text"
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                  placeholder="Technician or operator name"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Batch Run Notes</label>
                <input
                  type="text"
                  value={addNotes}
                  onChange={(e) => setAddNotes(e.target.value)}
                  placeholder="e.g. Molded at 195°C using HDPE flake mix"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl shadow-xs"
                >
                  Confirm &amp; Deposit Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deduct Stock Modal */}
      {isDeductModalOpen && (
        <div
          id="deduct-stock-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Minus className="w-4 h-4 text-rose-400" />
                Manual Stock Deduction / Defect Write-off
              </h3>
              <button onClick={() => setIsDeductModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmDeduct} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Quantity to Deduct *
                </label>
                <input
                  type="number"
                  min="1"
                  max={stats.currentStock}
                  value={deductQuantity}
                  onChange={(e) => setDeductQuantity(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-base focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Available in warehouse: {stats.currentStock} units
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Deduction *</label>
                <input
                  type="text"
                  value={deductReason}
                  onChange={(e) => setDeductReason(e.target.value)}
                  placeholder="e.g. Lab fracture test / Transit breakage"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDeductModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl shadow-xs"
                >
                  Deduct Units
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
