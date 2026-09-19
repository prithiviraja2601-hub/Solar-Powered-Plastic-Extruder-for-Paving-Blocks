import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TN_CITIES } from '../data/initialData';
import { OrderStatus } from '../types';
import {
  Calculator,
  Layers,
  Truck,
  IndianRupee,
  Leaf,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const OrderCalculatorView: React.FC = () => {
  const { stats, settings, createOrder, calculateOrderQuote, setCurrentPage } = useApp();

  // Mode: AREA_SQM, AREA_SQFT, DIRECT_BLOCKS
  const [calcMode, setCalcMode] = useState<'SQM' | 'SQFT' | 'BLOCKS'>('SQM');
  const [areaInput, setAreaInput] = useState<number>(50); // 50 sq.m
  const [blockInput, setBlockInput] = useState<number>(2500);
  const [wastageBuffer, setWastageBuffer] = useState<number>(5); // 5%

  // Delivery & Customer inputs
  const [deliveryCity, setDeliveryCity] = useState<string>('Chennai');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');

  // Distance lookup for TN cities
  const cityDistanceMap: Record<string, number> = {
    Chennai: 20,
    Coimbatore: 480,
    Madurai: 440,
    Tiruchirappalli: 320,
    Salem: 340,
    Tirunelveli: 600,
    Erode: 390,
    Thoothukudi: 580,
    Vellore: 130,
    Thanjavur: 340,
    Dindigul: 410,
    Kanchipuram: 70,
  };
  const estimatedDistanceKm = cityDistanceMap[deliveryCity] || 150;

  // Calculations
  // Standard 200x100mm = 0.02 sqm per block -> 50 blocks per sqm.
  // 1 sqm = 10.7639 sqft -> ~4.64 blocks per sqft.
  let baseBlocks = 0;
  if (calcMode === 'SQM') {
    baseBlocks = Math.ceil(areaInput * 50);
  } else if (calcMode === 'SQFT') {
    baseBlocks = Math.ceil((areaInput / 10.7639) * 50);
  } else {
    baseBlocks = Math.max(1, blockInput);
  }

  const wastageMultiplier = 1 + wastageBuffer / 100;
  const totalBlocksNeeded = Math.ceil(baseBlocks * wastageMultiplier);

  // Plastic & Carbon offset
  const plasticEquivalentKg = Math.round(totalBlocksNeeded * (settings.kgPlasticPerBlock || 2.2));
  const co2SavedKg = Math.round(plasticEquivalentKg * 1.75);

  // Quote calculation from business logic
  const quote = calculateOrderQuote(totalBlocksNeeded, estimatedDistanceKm);

  const isStockSufficient = stats.currentStock >= totalBlocksNeeded;
  const stockShortfall = Math.max(0, totalBlocksNeeded - stats.currentStock);

  const [orderCreatedSuccess, setOrderCreatedSuccess] = useState(false);

  const handlePlaceOrderFromCalc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Please provide customer name and contact phone number.');
      return;
    }

    const success = createOrder({
      customerName,
      phone: customerPhone,
      email: `${customerName.toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com`,
      city: deliveryCity,
      deliveryAddress: deliveryAddress || `${deliveryCity}, Tamil Nadu`,
      quantity: totalBlocksNeeded,
      distanceKm: estimatedDistanceKm,
      status: 'Confirmed',
      paymentStatus: 'Paid',
      notes: `Order generated via project estimator. Area mode: ${calcMode}, Wastage buffer: ${wastageBuffer}%.`,
    });

    if (success) {
      setOrderCreatedSuccess(true);
    }
  };

  return (
    <div id="order-calculator-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-600" />
            Paving Block Project Estimator &amp; Order Calculator
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Compute exact block requirements, plastic diverted from landfills, delivery logistics, and quotation totals.
          </p>
        </div>

        <button
          onClick={() => setCurrentPage('orders')}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors self-start md:self-auto"
        >
          View Existing Orders ({stats.totalOrdersCount}) &rarr;
        </button>
      </div>

      {orderCreatedSuccess && (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Order Successfully Placed &amp; Dispatched!</h3>
              <p className="text-xs text-emerald-800">
                Order for <strong>{totalBlocksNeeded.toLocaleString()} blocks</strong> (₹{quote.finalTotal.toLocaleString('en-IN')}) has been added to the sales registry and stock adjusted.
              </p>
            </div>
          </div>
          <button
            onClick={() => setCurrentPage('orders')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs"
          >
            Review Orders Page &rarr;
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Calculation Inputs */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              1. Paving Project Dimensions
            </h3>

            {/* Mode selection buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCalcMode('SQM')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  calcMode === 'SQM'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Square Metres (m²)
              </button>
              <button
                type="button"
                onClick={() => setCalcMode('SQFT')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  calcMode === 'SQFT'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Square Feet (sq ft)
              </button>
              <button
                type="button"
                onClick={() => setCalcMode('BLOCKS')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  calcMode === 'BLOCKS'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Exact Block Count
              </button>
            </div>

            {/* Value inputs */}
            {calcMode === 'SQM' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Total Paving Area in Square Metres (m²)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={areaInput}
                    onChange={(e) => setAreaInput(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-2.5 rounded-xl">
                    m²
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Standard coverage: 50 blocks per m²</p>
              </div>
            )}

            {calcMode === 'SQFT' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Total Paving Area in Square Feet (sq ft)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={areaInput}
                    onChange={(e) => setAreaInput(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-2.5 rounded-xl">
                    sq ft
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Approx 4.64 blocks per sq ft</p>
              </div>
            )}

            {calcMode === 'BLOCKS' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Number of Interlocking Blocks
                </label>
                <input
                  type="number"
                  min="1"
                  step="50"
                  value={blockInput}
                  onChange={(e) => setBlockInput(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            {/* Wastage buffer */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1">
                <span>Cutting &amp; Corner Wastage Margin</span>
                <span className="text-indigo-600 font-bold">{wastageBuffer}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                step="1"
                value={wastageBuffer}
                onChange={(e) => setWastageBuffer(parseInt(e.target.value) || 0)}
                className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>0% (No buffer)</span>
                <span>5% (Standard)</span>
                <span>10% (High curved cuts)</span>
                <span>15%</span>
              </div>
            </div>
          </div>

          {/* Customer & Delivery Section */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600" />
              2. Delivery Logistics &amp; Customer Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customer / Organization *</label>
                <input
                  type="text"
                  placeholder="e.g. Coimbatore Municipal Park Project"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Phone *</label>
                <input
                  type="tel"
                  placeholder="+91 98410 00000"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tamil Nadu Delivery Destination *</label>
                <select
                  value={deliveryCity}
                  onChange={(e) => setDeliveryCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  {TN_CITIES.map((c) => (
                    <option key={c.city} value={c.city}>
                      {c.city} ({c.district})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Site Delivery Address</label>
                <input
                  type="text"
                  placeholder="Street / Site gate reference"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Calculated Results & Live Quote */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 text-white shadow-md border border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Instant Quotation
              </span>
              <span className="text-xs text-slate-400">Rate: ₹{settings.pricePerBlock} / block</span>
            </div>

            {/* Main Calculated Block Count */}
            <div>
              <div className="text-slate-400 text-xs">Total Blocks Required (with {wastageBuffer}% buffer)</div>
              <div className="text-3xl font-extrabold text-white mt-1">
                {totalBlocksNeeded.toLocaleString()} <span className="text-base font-normal text-slate-400">units</span>
              </div>
            </div>

            {/* Inventory Status Check */}
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
                isStockSufficient
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}
            >
              {isStockSufficient ? (
                <>
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>
                    In Stock! Available warehouse stock is <strong>{stats.currentStock} units</strong>.
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>
                    Shortfall of <strong>{stockShortfall} blocks</strong>. Available: {stats.currentStock} units. Additional production run needed.
                  </span>
                </>
              )}
            </div>

            {/* Environmental Impact Breakdown */}
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2 text-xs">
              <div className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Leaf className="w-4 h-4 text-emerald-400" />
                <span>Environmental Benefit (This Order)</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-700">
                <div>
                  <span className="text-slate-400 block">Plastic Reclaimed</span>
                  <span className="font-bold text-emerald-400 text-xs">
                    {plasticEquivalentKg.toLocaleString()} kg
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">CO₂ Saved</span>
                  <span className="font-bold text-sky-400 text-xs">
                    {co2SavedKg.toLocaleString()} kg
                  </span>
                </div>
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="space-y-2 text-xs pt-1">
              <div className="flex justify-between text-slate-400">
                <span>{totalBlocksNeeded.toLocaleString()} Paving Blocks (@ ₹{settings.pricePerBlock}):</span>
                <span className="text-white font-mono">₹{quote.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Transport ({estimatedDistanceKm} km @ ₹{settings.transportRate}/km):</span>
                <span className="text-white font-mono">₹{quote.transportCost.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>GST Tax ({settings.taxRate}%):</span>
                <span className="text-white font-mono">₹{quote.taxAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-slate-800">
                <span>Total Estimated Cost:</span>
                <span className="text-amber-400 font-mono">₹{quote.finalTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              id="calc-place-order-btn"
              onClick={handlePlaceOrderFromCalc}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Transfer to Sales Registry &amp; Place Order</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
