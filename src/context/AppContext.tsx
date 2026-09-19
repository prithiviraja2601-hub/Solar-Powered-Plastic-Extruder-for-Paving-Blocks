import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Location,
  Bin,
  CollectionRecord,
  Order,
  InventoryTransaction,
  AppNotification,
  AppSettings,
  BinStatus,
  OrderStatus,
  PlasticCategory,
  PageId,
} from '../types';
import {
  INITIAL_LOCATIONS,
  INITIAL_BINS,
  INITIAL_COLLECTION_RECORDS,
  INITIAL_ORDERS,
  INITIAL_TRANSACTIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SETTINGS,
  calculateBinStatus,
} from '../data/initialData';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

interface AppContextType {
  // Navigation
  currentPage: PageId;
  setCurrentPage: (page: PageId) => void;
  selectedLocationIdFilter: string | null;
  setSelectedLocationIdFilter: (id: string | null) => void;

  // Data
  locations: Location[];
  bins: Bin[];
  collectionRecords: CollectionRecord[];
  orders: Order[];
  transactions: InventoryTransaction[];
  notifications: AppNotification[];
  settings: AppSettings;
  toasts: Toast[];

  // Statistics
  stats: {
    totalPlasticCollectedKg: number;
    collectedTodayKg: number;
    totalLocations: number;
    totalBins: number;
    totalCapacityKg: number;
    currentWeightInBinsKg: number;
    availableCapacityKg: number;
    binsRequiringPickupCount: number;
    binsNearlyFullCount: number;
    currentStock: number;
    totalRevenue: number;
    totalOrdersCount: number;
    isLowStock: boolean;
    totalBlocksSold: number;
  };

  // Actions
  addToast: (type: Toast['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;

  // Location CRUD
  addLocation: (loc: Omit<Location, 'id' | 'createdAt'>) => void;
  editLocation: (id: string, loc: Partial<Location>) => void;
  deleteLocation: (id: string) => void;

  // Bin Actions
  schedulePickup: (binId: string, scheduledDate: string, volunteerName: string) => void;
  completePickup: (binId: string, collectedWeightKg: number, category: PlasticCategory, collector: string, notes?: string) => void;

  // Collection Records CRUD
  addCollectionRecord: (record: Omit<CollectionRecord, 'id'>) => boolean;
  editCollectionRecord: (id: string, record: Partial<CollectionRecord>) => void;
  deleteCollectionRecord: (id: string) => void;

  // Inventory Actions
  addStock: (quantity: number, reason: string) => void;
  removeStock: (quantity: number, reason: string) => boolean;

  // Order Actions
  calculateOrderQuote: (quantity: number, distanceKm: number) => {
    subtotal: number;
    transportCost: number;
    taxAmount: number;
    finalTotal: number;
    hasStock: boolean;
    shortfall: number;
  };
  createOrder: (orderData: Omit<Order, 'id' | 'orderDate' | 'subtotal' | 'transportCost' | 'taxAmount' | 'finalTotal' | 'pricePerBlock' | 'transportRate' | 'taxRate'>) => boolean;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;

  // Notification Actions
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;

  // Settings Actions
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  generateDemoData: () => void;
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'solar_extruder_';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error loading ${key} from localStorage`, e);
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage`, e);
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [selectedLocationIdFilter, setSelectedLocationIdFilter] = useState<string | null>(null);

  // Core Data States
  const [locations, setLocations] = useState<Location[]>(() =>
    loadFromStorage('locations', INITIAL_LOCATIONS)
  );
  const [bins, setBins] = useState<Bin[]>(() =>
    loadFromStorage('bins', INITIAL_BINS)
  );
  const [collectionRecords, setCollectionRecords] = useState<CollectionRecord[]>(() =>
    loadFromStorage('collection_records', INITIAL_COLLECTION_RECORDS)
  );
  const [orders, setOrders] = useState<Order[]>(() =>
    loadFromStorage('orders', INITIAL_ORDERS)
  );
  const [transactions, setTransactions] = useState<InventoryTransaction[]>(() =>
    loadFromStorage('transactions', INITIAL_TRANSACTIONS)
  );
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    loadFromStorage('notifications', INITIAL_NOTIFICATIONS)
  );
  const [settings, setSettings] = useState<AppSettings>(() =>
    loadFromStorage('settings', INITIAL_SETTINGS)
  );
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Sync to LocalStorage
  useEffect(() => {
    saveToStorage('locations', locations);
  }, [locations]);

  useEffect(() => {
    saveToStorage('bins', bins);
  }, [bins]);

  useEffect(() => {
    saveToStorage('collection_records', collectionRecords);
  }, [collectionRecords]);

  useEffect(() => {
    saveToStorage('orders', orders);
  }, [orders]);

  useEffect(() => {
    saveToStorage('transactions', transactions);
  }, [transactions]);

  useEffect(() => {
    saveToStorage('notifications', notifications);
  }, [notifications]);

  useEffect(() => {
    saveToStorage('settings', settings);
  }, [settings]);

  // Toast Helpers
  const addToast = (type: Toast['type'], title: string, message: string) => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Add notification helper
  const triggerNotification = (
    type: AppNotification['type'],
    title: string,
    message: string,
    linkPage?: PageId,
    relatedId?: string
  ) => {
    const newNotif: AppNotification = {
      id: 'NOTIF-' + Date.now().toString().slice(-6),
      title,
      message,
      type,
      read: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' today',
      linkPage,
      relatedId,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Current stock computed from latest transaction
  const currentStock = useMemo(() => {
    if (transactions.length === 0) return 0;
    return transactions[transactions.length - 1].stockAfter;
  }, [transactions]);

  // Computed Statistics
  const stats = useMemo(() => {
    const totalPlasticCollectedKg = collectionRecords.reduce((sum, r) => sum + (r.weightKg || 0), 0);
    
    // Check records from today
    const todayStr = '2026-09-19';
    const collectedTodayKg = collectionRecords
      .filter((r) => r.date === todayStr || r.date.startsWith('2026-09-19'))
      .reduce((sum, r) => sum + (r.weightKg || 0), 0);

    const totalLocations = locations.length;
    const totalBins = bins.length;
    const totalCapacityKg = bins.reduce((sum, b) => sum + (b.maxCapacity || 0), 0);
    const currentWeightInBinsKg = bins.reduce((sum, b) => sum + (b.currentWeight || 0), 0);
    const availableCapacityKg = Math.max(0, totalCapacityKg - currentWeightInBinsKg);

    const binsRequiringPickupCount = bins.filter(
      (b) => b.status === 'COLLECTION_REQUIRED' || (b.currentWeight / b.maxCapacity) * 100 > 90
    ).length;

    const binsNearlyFullCount = bins.filter(
      (b) => b.status === 'NEARLY_FULL' || ((b.currentWeight / b.maxCapacity) * 100 >= 70 && (b.currentWeight / b.maxCapacity) * 100 <= 90)
    ).length;

    const nonCancelledOrders = orders.filter((o) => o.status !== 'Cancelled');
    const totalRevenue = nonCancelledOrders.reduce((sum, o) => sum + o.finalTotal, 0);
    const totalBlocksSold = nonCancelledOrders.reduce((sum, o) => sum + o.quantity, 0);
    const isLowStock = currentStock < settings.lowStockThreshold;

    return {
      totalPlasticCollectedKg: Math.round(totalPlasticCollectedKg * 10) / 10,
      collectedTodayKg: Math.round(collectedTodayKg * 10) / 10,
      totalLocations,
      totalBins,
      totalCapacityKg,
      currentWeightInBinsKg: Math.round(currentWeightInBinsKg * 10) / 10,
      availableCapacityKg: Math.round(availableCapacityKg * 10) / 10,
      binsRequiringPickupCount,
      binsNearlyFullCount,
      currentStock,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrdersCount: orders.length,
      isLowStock,
      totalBlocksSold,
    };
  }, [collectionRecords, locations, bins, orders, currentStock, settings.lowStockThreshold]);

  // Location Actions
  const addLocation = (loc: Omit<Location, 'id' | 'createdAt'>) => {
    const locId = 'LOC-' + loc.city.slice(0, 3).toUpperCase() + '-' + Date.now().toString().slice(-3);
    const newLoc: Location = {
      ...loc,
      id: locId,
      createdAt: '2026-09-19',
    };

    // Auto-generate requested number of bins for this new location
    const newBins: Bin[] = [];
    const binCount = Math.max(1, loc.numberOfBins || 1);
    const cap = loc.binCapacity || 200;

    for (let i = 1; i <= binCount; i++) {
      const binId = `BIN-${loc.city.slice(0, 3).toUpperCase()}-${String(i).padStart(2, '0')}`;
      newBins.push({
        id: binId,
        locationId: locId,
        locationName: loc.name,
        cityName: loc.city,
        maxCapacity: cap,
        currentWeight: 0,
        status: 'AVAILABLE',
        notes: `Bin ${i} at ${loc.name}`,
      });
    }

    setLocations((prev) => [...prev, newLoc]);
    setBins((prev) => [...prev, ...newBins]);
    addToast('success', 'Location Created', `Added ${newLoc.name} in ${newLoc.city} with ${binCount} bin(s).`);
    triggerNotification('system', 'New Location Registered', `Added ${newLoc.name} in ${newLoc.city}`, 'locations', locId);
  };

  const editLocation = (id: string, updatedFields: Partial<Location>) => {
    setLocations((prev) =>
      prev.map((loc) => (loc.id === id ? { ...loc, ...updatedFields } : loc))
    );
    // Also update locationName / cityName in associated bins if changed
    if (updatedFields.name || updatedFields.city) {
      setBins((prev) =>
        prev.map((b) =>
          b.locationId === id
            ? {
                ...b,
                locationName: updatedFields.name || b.locationName,
                cityName: updatedFields.city || b.cityName,
              }
            : b
        )
      );
    }
    addToast('success', 'Location Updated', `Changes to location have been saved successfully.`);
  };

  const deleteLocation = (id: string) => {
    const locToDelete = locations.find((l) => l.id === id);
    setLocations((prev) => prev.filter((loc) => loc.id !== id));
    setBins((prev) => prev.filter((b) => b.locationId !== id));
    addToast('info', 'Location Removed', `Removed ${locToDelete?.name || id} and its associated bins.`);
  };

  // Bin Actions
  const schedulePickup = (binId: string, scheduledDate: string, volunteerName: string) => {
    setBins((prev) =>
      prev.map((b) => {
        if (b.id === binId) {
          return {
            ...b,
            scheduledPickupDate: scheduledDate,
            assignedVolunteer: volunteerName,
          };
        }
        return b;
      })
    );
    addToast('success', 'Pickup Scheduled', `Scheduled pickup for bin ${binId} with volunteer ${volunteerName} on ${scheduledDate}.`);
    triggerNotification('pickup', `Pickup Scheduled: ${binId}`, `Volunteer ${volunteerName} assigned for ${scheduledDate}`, 'pickup-alerts', binId);
  };

  const completePickup = (
    binId: string,
    collectedWeightKg: number,
    category: PlasticCategory,
    collector: string,
    notes?: string
  ) => {
    const targetBin = bins.find((b) => b.id === binId);
    if (!targetBin) {
      addToast('error', 'Bin Not Found', `Bin ${binId} could not be located.`);
      return;
    }

    const effectiveWeight = Math.min(targetBin.currentWeight, collectedWeightKg);
    const newWeight = Math.max(0, targetBin.currentWeight - effectiveWeight);
    const newStatus = calculateBinStatus(newWeight, targetBin.maxCapacity);

    // 1. Update bin
    setBins((prev) =>
      prev.map((b) => {
        if (b.id === binId) {
          return {
            ...b,
            currentWeight: newWeight,
            status: newStatus,
            lastPickupDate: '2026-09-19',
            scheduledPickupDate: undefined,
            assignedVolunteer: undefined,
          };
        }
        return b;
      })
    );

    // 2. Automatically create a collection record for this emptied plastic
    const newRecordId = 'REC-' + (1050 + collectionRecords.length + 1);
    const newRecord: CollectionRecord = {
      id: newRecordId,
      date: '2026-09-19',
      locationId: targetBin.locationId,
      locationName: targetBin.locationName,
      binId: targetBin.id,
      plasticCategory: category,
      weightKg: effectiveWeight > 0 ? effectiveWeight : collectedWeightKg,
      collector: collector || 'Eco Volunteer Team',
      notes: notes || `Cleared during scheduled pickup from ${targetBin.locationName}`,
    };

    setCollectionRecords((prev) => [newRecord, ...prev]);

    addToast(
      'success',
      'Pickup Completed',
      `Bin ${binId} emptied (${effectiveWeight} kg collected). New fill is ${((newWeight / targetBin.maxCapacity) * 100).toFixed(1)}%.`
    );

    triggerNotification(
      'pickup',
      `Pickup Completed: ${binId}`,
      `Successfully cleared ${effectiveWeight} kg of ${category} plastic from ${targetBin.locationName}.`,
      'collection-records',
      newRecordId
    );
  };

  // Collection Records CRUD
  const addCollectionRecord = (record: Omit<CollectionRecord, 'id'>): boolean => {
    if (record.weightKg <= 0) {
      addToast('error', 'Invalid Weight', 'Plastic weight must be a positive number.');
      return false;
    }

    const targetBin = bins.find((b) => b.id === record.binId);
    if (targetBin) {
      const projectedWeight = targetBin.currentWeight + record.weightKg;
      if (projectedWeight > targetBin.maxCapacity) {
        addToast(
          'error',
          'Capacity Exceeded',
          `Cannot add ${record.weightKg} kg. Bin ${targetBin.id} only has ${Math.max(0, targetBin.maxCapacity - targetBin.currentWeight).toFixed(1)} kg remaining space.`
        );
        return false;
      }

      // Update bin current weight & status
      const updatedStatus = calculateBinStatus(projectedWeight, targetBin.maxCapacity);
      setBins((prev) =>
        prev.map((b) =>
          b.id === record.binId
            ? {
                ...b,
                currentWeight: projectedWeight,
                status: updatedStatus,
              }
            : b
        )
      );

      // If threshold crossed to full or collection required, send alert
      if (updatedStatus === 'COLLECTION_REQUIRED' || updatedStatus === 'FULL') {
        triggerNotification(
          'bin_alert',
          `Bin Alert: ${targetBin.id} Exceeded 90%!`,
          `Current weight: ${projectedWeight} kg / ${targetBin.maxCapacity} kg at ${targetBin.locationName}.`,
          'pickup-alerts',
          targetBin.id
        );
      }
    }

    const newId = 'REC-' + (1100 + collectionRecords.length + 1);
    const newRecord: CollectionRecord = {
      ...record,
      id: newId,
    };

    setCollectionRecords((prev) => [newRecord, ...prev]);
    addToast('success', 'Collection Logged', `Logged ${record.weightKg} kg of ${record.plasticCategory} at ${record.locationName}.`);
    return true;
  };

  const editCollectionRecord = (id: string, updated: Partial<CollectionRecord>) => {
    setCollectionRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updated } : r))
    );
    addToast('success', 'Record Updated', `Collection record ${id} was updated.`);
  };

  const deleteCollectionRecord = (id: string) => {
    setCollectionRecords((prev) => prev.filter((r) => r.id !== id));
    addToast('info', 'Record Deleted', `Collection record ${id} removed.`);
  };

  // Inventory Stock Actions
  const addStock = (quantity: number, reason: string) => {
    if (quantity <= 0) {
      addToast('error', 'Invalid Quantity', 'Added stock quantity must be greater than 0.');
      return;
    }
    const newStockAfter = currentStock + quantity;
    const newTxn: InventoryTransaction = {
      id: 'TXN-' + Date.now().toString().slice(-5),
      date: '2026-09-19',
      type: 'ADD_STOCK',
      quantity,
      reason: reason || 'Solar Plastic Extruder Production Run',
      stockAfter: newStockAfter,
    };

    setTransactions((prev) => [...prev, newTxn]);
    addToast('success', 'Stock Added', `Added ${quantity} paving blocks. Total available stock is now ${newStockAfter}.`);
    triggerNotification('stock', `Inventory Added: +${quantity} Blocks`, `Reason: ${reason || 'Solar Extrusion'}`, 'inventory');
  };

  const removeStock = (quantity: number, reason: string): boolean => {
    if (quantity <= 0) {
      addToast('error', 'Invalid Quantity', 'Quantity must be greater than 0.');
      return false;
    }
    if (quantity > currentStock) {
      addToast('error', 'Insufficient Stock', `Cannot remove ${quantity} blocks. Only ${currentStock} blocks available.`);
      return false;
    }

    const newStockAfter = currentStock - quantity;
    const newTxn: InventoryTransaction = {
      id: 'TXN-' + Date.now().toString().slice(-5),
      date: '2026-09-19',
      type: 'REMOVE_STOCK',
      quantity: -quantity,
      reason: reason || 'Manual Stock Adjustment / Defect Write-off',
      stockAfter: newStockAfter,
    };

    setTransactions((prev) => [...prev, newTxn]);
    addToast('info', 'Stock Removed', `Removed ${quantity} blocks. Remaining available stock is ${newStockAfter}.`);

    if (newStockAfter < settings.lowStockThreshold) {
      triggerNotification(
        'stock',
        'Low Stock Warning!',
        `Paving block stock (${newStockAfter}) is below safety threshold (${settings.lowStockThreshold}).`,
        'inventory'
      );
    }
    return true;
  };

  // Order Calculator Helper
  const calculateOrderQuote = (quantity: number, distanceKm: number) => {
    const subtotal = Math.max(0, quantity) * settings.pricePerBlock;
    const transportCost = Math.max(0, distanceKm) * settings.transportRate;
    const taxAmount = ((subtotal + transportCost) * settings.taxRate) / 100;
    const finalTotal = subtotal + transportCost + taxAmount;
    const hasStock = quantity <= currentStock && quantity > 0;
    const shortfall = Math.max(0, quantity - currentStock);

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      transportCost: Math.round(transportCost * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      finalTotal: Math.round(finalTotal * 100) / 100,
      hasStock,
      shortfall,
    };
  };

  // Create Order
  const createOrder = (
    orderData: Omit<Order, 'id' | 'orderDate' | 'subtotal' | 'transportCost' | 'taxAmount' | 'finalTotal' | 'pricePerBlock' | 'transportRate' | 'taxRate'>
  ): boolean => {
    if (orderData.quantity <= 0) {
      addToast('error', 'Invalid Quantity', 'Order quantity must be at least 1 paving block.');
      return false;
    }
    if (orderData.quantity > currentStock) {
      addToast('error', 'Insufficient Stock', `Stock shortfall: Requested ${orderData.quantity}, but only ${currentStock} blocks are available.`);
      return false;
    }

    const quote = calculateOrderQuote(orderData.quantity, orderData.distanceKm);
    const orderId = 'ORD-2026-' + String(orders.length + 1).padStart(3, '0');

    const newOrder: Order = {
      ...orderData,
      id: orderId,
      orderDate: '2026-09-19',
      pricePerBlock: settings.pricePerBlock,
      transportRate: settings.transportRate,
      taxRate: settings.taxRate,
      subtotal: quote.subtotal,
      transportCost: quote.transportCost,
      taxAmount: quote.taxAmount,
      finalTotal: quote.finalTotal,
    };

    // Deduct stock via transaction
    const newStockAfter = currentStock - orderData.quantity;
    const newTxn: InventoryTransaction = {
      id: 'TXN-' + Date.now().toString().slice(-5),
      date: '2026-09-19',
      type: 'ORDER_FULFILLMENT',
      quantity: -orderData.quantity,
      reason: `Reserved for Order ${orderId} (${orderData.customerName})`,
      stockAfter: newStockAfter,
      referenceOrderId: orderId,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setTransactions((prev) => [...prev, newTxn]);

    addToast('success', 'Order Confirmed', `Order ${orderId} placed for ₹${quote.finalTotal.toLocaleString('en-IN')}. Stock updated.`);
    triggerNotification('order', `New Order: ${orderId}`, `${orderData.customerName} ordered ${orderData.quantity} paving blocks (₹${quote.finalTotal.toLocaleString('en-IN')}).`, 'orders', orderId);

    if (newStockAfter < settings.lowStockThreshold) {
      triggerNotification('stock', 'Low Stock Threshold Warning', `Available stock is now ${newStockAfter} (below threshold ${settings.lowStockThreshold}).`, 'inventory');
    }

    return true;
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    const existingOrder = orders.find((o) => o.id === orderId);
    if (!existingOrder) return;

    // Handle stock restoration on cancellation
    if (newStatus === 'Cancelled' && existingOrder.status !== 'Cancelled') {
      const restoredStock = currentStock + existingOrder.quantity;
      const restoreTxn: InventoryTransaction = {
        id: 'TXN-' + Date.now().toString().slice(-5),
        date: '2026-09-19',
        type: 'ORDER_CANCEL_RESTORE',
        quantity: existingOrder.quantity,
        reason: `Restored stock from Cancelled Order ${orderId}`,
        stockAfter: restoredStock,
        referenceOrderId: orderId,
      };
      setTransactions((prev) => [...prev, restoreTxn]);
      addToast('info', 'Stock Restored', `Order ${orderId} cancelled. ${existingOrder.quantity} blocks returned to inventory.`);
    } else if (existingOrder.status === 'Cancelled' && newStatus !== 'Cancelled') {
      // Re-deduct stock if reactivated
      if (existingOrder.quantity > currentStock) {
        addToast('error', 'Cannot Reactivate Order', `Insufficient inventory to reactivate. Need ${existingOrder.quantity} blocks, available: ${currentStock}.`);
        return;
      }
      const newStockAfter = currentStock - existingOrder.quantity;
      const deductTxn: InventoryTransaction = {
        id: 'TXN-' + Date.now().toString().slice(-5),
        date: '2026-09-19',
        type: 'ORDER_FULFILLMENT',
        quantity: -existingOrder.quantity,
        reason: `Re-allocated for Reactivated Order ${orderId}`,
        stockAfter: newStockAfter,
        referenceOrderId: orderId,
      };
      setTransactions((prev) => [...prev, deductTxn]);
    }

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    addToast('success', 'Status Updated', `Order ${orderId} status changed to ${newStatus}.`);
    if (newStatus === 'Delivered') {
      triggerNotification('order', `Order Delivered: ${orderId}`, `Order for ${existingOrder.customerName} was marked as Delivered.`, 'orders', orderId);
    }
  };

  // Notification Actions
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    addToast('info', 'All Read', 'Marked all notifications as read.');
  };

  const clearNotifications = () => {
    setNotifications([]);
    addToast('info', 'Notifications Cleared', 'All notifications have been removed.');
  };

  // Settings Actions
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    addToast('success', 'Settings Updated', 'New pricing and operational parameters are now live.');
  };

  const generateDemoData = () => {
    setLocations(INITIAL_LOCATIONS);
    setBins(INITIAL_BINS);
    setCollectionRecords(INITIAL_COLLECTION_RECORDS);
    setOrders(INITIAL_ORDERS);
    setTransactions(INITIAL_TRANSACTIONS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setSettings(INITIAL_SETTINGS);
    addToast('success', 'Demo Data Generated', 'Application populated with complete Tamil Nadu simulated dataset.');
  };

  const resetDemoData = () => {
    setLocations(INITIAL_LOCATIONS);
    setBins(INITIAL_BINS);
    setCollectionRecords(INITIAL_COLLECTION_RECORDS);
    setOrders(INITIAL_ORDERS);
    setTransactions(INITIAL_TRANSACTIONS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setSettings(INITIAL_SETTINGS);
    try {
      localStorage.clear();
    } catch (e) {
      console.error(e);
    }
    addToast('info', 'Data Reset', 'All settings and data have been reset to factory baseline demo state.');
  };

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        selectedLocationIdFilter,
        setSelectedLocationIdFilter,
        locations,
        bins,
        collectionRecords,
        orders,
        transactions,
        notifications,
        settings,
        toasts,
        stats,
        addToast,
        removeToast,
        addLocation,
        editLocation,
        deleteLocation,
        schedulePickup,
        completePickup,
        addCollectionRecord,
        editCollectionRecord,
        deleteCollectionRecord,
        addStock,
        removeStock,
        calculateOrderQuote,
        createOrder,
        updateOrderStatus,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotifications,
        updateSettings,
        generateDemoData,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
