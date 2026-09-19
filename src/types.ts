export type PlasticCategory = 'PET' | 'HDPE' | 'LDPE' | 'PP' | 'Mixed Plastic' | 'Other';

export type BinStatus = 'AVAILABLE' | 'NEARLY_FULL' | 'FULL' | 'COLLECTION_REQUIRED';

export type OrderStatus = 'Pending' | 'Confirmed' | 'Preparing' | 'Dispatched' | 'Delivered' | 'Cancelled';

export type PaymentStatus = 'Paid' | 'Pending' | 'Partial';

export type InventoryTransactionType = 'ADD_STOCK' | 'REMOVE_STOCK' | 'ORDER_FULFILLMENT' | 'ORDER_CANCEL_RESTORE';

export interface Location {
  id: string;
  name: string;
  city: string;
  district: string;
  address: string;
  latitude: number;
  longitude: number;
  contactPerson: string;
  contactNumber: string;
  numberOfBins: number;
  binCapacity: number; // in kg (default capacity per bin)
  createdAt: string;
}

export interface Bin {
  id: string;
  locationId: string;
  locationName: string;
  cityName: string;
  maxCapacity: number; // in kg
  currentWeight: number; // in kg
  status: BinStatus;
  lastPickupDate?: string;
  scheduledPickupDate?: string;
  assignedVolunteer?: string;
  notes?: string;
}

export interface CollectionRecord {
  id: string;
  date: string;
  locationId: string;
  locationName: string;
  binId: string;
  plasticCategory: PlasticCategory;
  weightKg: number;
  collector: string;
  notes?: string;
}

export interface PickupAlert {
  id: string;
  binId: string;
  locationId: string;
  locationName: string;
  cityName: string;
  currentWeight: number;
  maxCapacity: number;
  fillPercentage: number;
  status: 'PENDING' | 'SCHEDULED' | 'COMPLETED';
  scheduledDate?: string;
  volunteerName?: string;
  createdAt: string;
}

export interface InventoryTransaction {
  id: string;
  date: string;
  type: InventoryTransactionType;
  quantity: number; // positive or negative
  reason: string;
  stockAfter: number;
  referenceOrderId?: string;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  deliveryAddress: string;
  city: string;
  quantity: number; // number of paving blocks
  distanceKm: number;
  pricePerBlock: number;
  transportRate: number;
  taxRate: number; // in percentage, e.g. 5
  subtotal: number;
  transportCost: number;
  taxAmount: number;
  finalTotal: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  orderDate: string;
  deliveryDate?: string;
  notes?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'bin_alert' | 'pickup' | 'order' | 'stock' | 'system';
  read: boolean;
  timestamp: string;
  linkPage?: string;
  relatedId?: string;
}

export interface AppSettings {
  pricePerBlock: number;
  transportRate: number;
  taxRate: number;
  lowStockThreshold: number;
  solarPanelOutputKw: number;
  extruderTemperatureC: number;
  extrusionCapacityKgPerHour: number;
  kgPlasticPerBlock: number; // e.g. 2.2 kg of recycled plastic produces 1 paving block
}

export type PageId =
  | 'dashboard'
  | 'collection-overview'
  | 'locations'
  | 'collection-records'
  | 'bins'
  | 'pickup-alerts'
  | 'inventory'
  | 'order-calculator'
  | 'orders'
  | 'sales-analytics'
  | 'reports'
  | 'notifications'
  | 'settings';
