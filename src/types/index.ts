export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'driver';
  createdAt: Date;
}

export interface Driver {
  id: string;
  name: string;
  license: string;
  phone: string;
  email: string;
  vehicleId?: string;
  active: boolean;
  createdAt: Date;
}

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  year: number;
  currentKm: number;
  lastMaintenanceKm: number;
  nextMaintenanceKm: number;
  maintenanceIntervalKm: number;
  active: boolean;
}

export interface Client {
  id: string;
  name: string;
  address: string;
  alternativeAddress?: string;
  city: string;
  state?: string; // UF
  phone: string;
  email?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  isTransporter: boolean;
  createdAt: Date;
}

export interface DeliveryStop {
  id: string;
  clientId: string;
  client: Client;
  transporterId?: string;
  transporter?: Client;
  deliveryAddress?: string;
  stopNumber: number;
  estimatedTime?: string;
  entryTime?: Date;
  exitTime?: Date;
  completedAt?: Date;
  observations?: string;
  photos: string[];
  signature?: string;
  invoiceNumber?: string; // Nota fiscal
  clientCode?: string; // Código do cliente
  recipientData?: {
    name: string;
    cpf: string;
    email: string;
    department: string;
  };
  status: 'pending' | 'completed' | 'failed';
}

export interface Route {
  id: string;
  driverId: string;
  driver: Driver;
  vehicleId: string;
  vehicle: Vehicle;
  date: Date;
  startTime?: Date;
  endTime?: Date;
  startKm?: number;
  endKm?: number;
  totalKm?: number;
  stops: DeliveryStop[];
  status: 'planned' | 'in_progress' | 'completed';
  createdAt: Date;
}

export interface Expense {
  id: string;
  routeId?: string;
  vehicleId: string;
  type: 'fuel' | 'toll' | 'maintenance' | 'rental';
  amount: number;
  description: string;
  receipt?: string;
  date: Date;
  createdAt: Date;
}

export interface Report {
  period: 'weekly' | 'monthly' | 'semester' | 'yearly';
  startDate: Date;
  endDate: Date;
  totalDeliveries: number;
  totalKm: number;
  totalExpenses: number;
  driverStats: {
    driverId: string;
    deliveries: number;
    km: number;
  }[];
}