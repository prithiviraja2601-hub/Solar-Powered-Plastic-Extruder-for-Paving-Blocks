import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus } from '../types';
import { TN_CITIES } from '../data/initialData';
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  X,
  IndianRupee,
  Calendar,
  Building,
  Phone,
  Calculator,
} from 'lucide-react';

export const OrdersView: React.FC = () => {
  const {
    orders,
    createOrder,
    updateOrderStatus,
    settings,
    stats,
    calculateOrderQuote,
    setCurrentPage,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    city: 'Chennai',
    deliveryAddress: '',
    quantity: 1000,
    distanceKm: 25,
    status: 'Confirmed' as OrderStatus,
    paymentStatus: 'Paid' as const,
    notes: '',
  });

  const handleOpenAddModal = () => {
    setFormData({
      customerName: '',
      phone: '',
      email: '',
      city: 'Chennai',
      deliveryAddress: '',
      quantity: 1000,
      distanceKm: 25,
      status: 'Confirmed',
      paymentStatus: 'Paid',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const handleCityChange = (city: string) => {
    // estimate distance from primary plant (e.g. Tiruchirappalli / Chennai central hub)
    const distMap: Record<string, number> = {
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
    setFormData((prev) => ({
      ...prev,
      city,
      distanceKm: distMap[city] || 150,
    }));
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName.trim() || formData.quantity <= 0) return;

    const success = createOrder({
      customerName: formData.customerName,
      phone: formData.phone,
      email: formData.email || `${formData.customerName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      city: formData.city,
      deliveryAddress: formData.deliveryAddress || `${formData.city}, Tamil Nadu`,
      quantity: formData.quantity,
      distanceKm: formData.distanceKm,
      status: formData.status,
      paymentStatus: formData.paymentStatus,
      notes: formData.notes,
    });

    if (success) {
      setIsAddModalOpen(false);
    }
  };

  const filteredOrders = orders.filter((ord) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      ord.id.toLowerCase().includes(q) ||
      ord.customerName.toLowerCase().includes(q) ||
      ord.phone.toLowerCase().includes(q) ||
      ord.city.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'ALL' || ord.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportOrdersCSV = () => {
    const headers = [
      'Order ID',
      'Order Date',
      'Customer Name',
      'Phone',
      'City',
      'Delivery Address',
      'Quantity',
      'Price Per Block (₹)',
      'Subtotal (₹)',
      'Transport (₹)',
      'Tax (₹)',
      'Final Total (₹)',
      'Status',
      'Payment Status',
    ];
    const rows = filteredOrders.map((o) => [
      o.id,
      o.orderDate,
      `"${o.customerName.replace(/"/g, '""')}"`,
      o.phone,
      o.city,
      `"${o.deliveryAddress.replace(/"/g, '""')}"`,
      o.quantity,
      o.pricePerBlock,
      o.subtotal,
      o.transportCost,
      o.taxAmount,
      o.finalTotal,
      o.status,
      o.paymentStatus,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `paving_block_sales_orders_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Delivered
          </span>
        );
      case 'Confirmed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-300 flex items-center gap-1">
            <Truck className="w-3 h-3" />
            Confirmed
          </span>
        );
      case 'Preparing':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Preparing
          </span>
        );
      case 'Dispatched':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300 flex items-center gap-1">
            <Truck className="w-3 h-3" />
            Dispatched
          </span>
        );
      case 'Pending':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'Cancelled':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-300 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Cancelled
          </span>
        );
    }
  };

  const currentQuote = calculateOrderQuote(formData.quantity, formData.distanceKm);

  return (
    <div id="orders-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-indigo-600" />
            Commercial Sales Orders
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registry of paving block procurement contracts, municipal tenders, and landscaping clients across Tamil Nadu.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentPage('order-calculator')}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 border border-slate-200"
          >
            <Calculator className="w-3.5 h-3.5 text-slate-500" />
            <span>Order Calculator</span>
          </button>

          <button
            onClick={exportOrdersCSV}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 border border-slate-200"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            id="create-new-order-btn"
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Order</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="orders-search-input"
            type="text"
            placeholder="Search orders by ID, customer name, phone, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            id="orders-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Order Statuses ({orders.length})</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Preparing">Preparing</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Delivered">Delivered</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                <th className="py-3.5 px-4">Order ID &amp; Date</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">City</th>
                <th className="py-3.5 px-4 text-right">Quantity</th>
                <th className="py-3.5 px-4 text-right">Final Total (₹)</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No orders found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-mono font-bold text-slate-900">{order.id}</div>
                      <div className="text-[11px] text-slate-400">{order.orderDate}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{order.customerName}</div>
                      <div className="text-[11px] text-slate-500">{order.phone}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700 whitespace-nowrap">
                      {order.city}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                      {order.quantity.toLocaleString()} blocks
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                      ₹{order.finalTotal.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setViewingOrder(order)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'Delivered')}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-md border border-emerald-200 transition-colors"
                            title="Mark as Delivered"
                          >
                            Mark Delivered
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Order Modal */}
      {viewingOrder && (
        <div
          id="view-order-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-amber-400">{viewingOrder.id}</span>
                <h3 className="text-base font-bold">Sales Order Summary</h3>
              </div>
              <button onClick={() => setViewingOrder(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Order Status:</span>
                  <div>{getStatusBadge(viewingOrder.status)}</div>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-semibold text-slate-900">{viewingOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone:</span>
                  <span className="font-semibold text-slate-900">{viewingOrder.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Destination:</span>
                  <span className="font-semibold text-slate-900">{viewingOrder.city}</span>
                </div>
                {viewingOrder.deliveryAddress && (
                  <div className="text-slate-500 text-[11px] pt-1">
                    Address: {viewingOrder.deliveryAddress}
                  </div>
                )}
              </div>

              <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Quantity:</span>
                  <span className="font-bold text-slate-900">{viewingOrder.quantity.toLocaleString()} blocks</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Price Per Block:</span>
                  <span className="font-mono text-slate-900">₹{viewingOrder.pricePerBlock}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="font-mono text-slate-900">₹{viewingOrder.subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Transport Fee ({viewingOrder.distanceKm} km):</span>
                  <span className="font-mono text-slate-900">₹{viewingOrder.transportCost.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">GST Tax ({viewingOrder.taxRate}%):</span>
                  <span className="font-mono text-slate-900">₹{viewingOrder.taxAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2 border-t border-indigo-200">
                  <span className="text-indigo-950">Final Total:</span>
                  <span className="text-indigo-600 font-mono">₹{viewingOrder.finalTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {viewingOrder.notes && (
                <div className="p-3 bg-slate-50 rounded-xl text-slate-600 text-[11px]">
                  <strong>Notes:</strong> {viewingOrder.notes}
                </div>
              )}

              {/* Status change actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-slate-500 font-medium">Update Status:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {viewingOrder.status !== 'Confirmed' && (
                    <button
                      onClick={() => {
                        updateOrderStatus(viewingOrder.id, 'Confirmed');
                        setViewingOrder({ ...viewingOrder, status: 'Confirmed' });
                      }}
                      className="px-2.5 py-1 bg-sky-100 text-sky-800 rounded-lg font-semibold hover:bg-sky-200"
                    >
                      Confirmed
                    </button>
                  )}
                  {viewingOrder.status !== 'Delivered' && (
                    <button
                      onClick={() => {
                        updateOrderStatus(viewingOrder.id, 'Delivered');
                        setViewingOrder({ ...viewingOrder, status: 'Delivered' });
                      }}
                      className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-semibold hover:bg-emerald-200"
                    >
                      Delivered
                    </button>
                  )}
                  {viewingOrder.status !== 'Cancelled' && (
                    <button
                      onClick={() => {
                        updateOrderStatus(viewingOrder.id, 'Cancelled');
                        setViewingOrder({ ...viewingOrder, status: 'Cancelled' });
                      }}
                      className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-lg font-semibold hover:bg-rose-200"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setViewingOrder(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Order Modal */}
      {isAddModalOpen && (
        <div
          id="create-order-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Create New Commercial Sales Order</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="p-6 space-y-4 text-xs overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer / Organization *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Madurai Smart City Agency"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 94430 00000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Destination City *</label>
                  <select
                    value={formData.city}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    {TN_CITIES.map((c) => (
                      <option key={c.city} value={c.city}>
                        {c.city}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estimated Distance (km)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.distanceKm}
                    onChange={(e) => setFormData({ ...formData, distanceKm: parseFloat(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Site Delivery Address</label>
                <input
                  type="text"
                  placeholder="Plot/Street address for logistics dispatch"
                  value={formData.deliveryAddress}
                  onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quantity (Units) *</label>
                  <input
                    type="number"
                    min="1"
                    step="10"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as OrderStatus })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Pending">Pending</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>

              {/* Quotation preview */}
              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal ({formData.quantity} blocks @ ₹{settings.pricePerBlock}):</span>
                  <span className="font-mono">₹{currentQuote.subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Transport ({formData.distanceKm} km @ ₹{settings.transportRate}/km):</span>
                  <span className="font-mono">₹{currentQuote.transportCost.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST Tax ({settings.taxRate}%):</span>
                  <span className="font-mono">₹{currentQuote.taxAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-indigo-950 pt-1 border-t border-indigo-200">
                  <span>Final Total:</span>
                  <span className="text-base font-extrabold text-indigo-700 font-mono">
                    ₹{currentQuote.finalTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Order Notes / Tender Ref</label>
                <input
                  type="text"
                  placeholder="Optional reference"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs"
                >
                  Confirm &amp; Place Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
