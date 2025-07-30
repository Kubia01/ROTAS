import React, { createContext, useContext, useState, useEffect } from 'react';
import { Driver, Vehicle, Client, Route, Expense } from '../types';

interface DataContextType {
  // Drivers
  drivers: Driver[];
  addDriver: (driver: Omit<Driver, 'id' | 'createdAt'>) => void;
  updateDriver: (id: string, driver: Partial<Driver>) => void;
  deleteDriver: (id: string) => void;

  // Vehicles
  vehicles: Vehicle[];
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;

  // Clients
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  importClients: (clients: Omit<Client, 'id' | 'createdAt'>[]) => void;

  // Routes
  routes: Route[];
  addRoute: (route: Omit<Route, 'id' | 'createdAt'>) => void;
  updateRoute: (id: string, route: Partial<Route>) => void;
  deleteRoute: (id: string) => void;

  // Expenses
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData deve ser usado dentro de um DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Carregar dados iniciais
  useEffect(() => {
    const mockDrivers: Driver[] = [
      {
        id: '1',
        name: 'João Silva',
        license: '123456789',
        phone: '(11) 99999-9999',
        email: 'joao@tws.com',
        vehicleId: '1',
        active: true,
        createdAt: new Date(),
      },
      {
        id: '2',
        name: 'Maria Santos',
        license: '987654321',
        phone: '(11) 88888-8888',
        email: 'maria@tws.com',
        vehicleId: '2',
        active: true,
        createdAt: new Date(),
      },
    ];

    const mockVehicles: Vehicle[] = [
      {
        id: '1',
        plate: 'ABC-1234',
        model: 'Fiat Fiorino',
        year: 2020,
        currentKm: 45000,
        lastMaintenanceKm: 40000,
        nextMaintenanceKm: 50000,
        maintenanceIntervalKm: 10000,
        active: true,
      },
      {
        id: '2',
        plate: 'XYZ-5678',
        model: 'Volkswagen Saveiro',
        year: 2019,
        currentKm: 62000,
        lastMaintenanceKm: 55000,
        nextMaintenanceKm: 65000,
        maintenanceIntervalKm: 10000,
        active: true,
      },
    ];

    const mockClients: Client[] = [
      {
        id: '1',
        name: 'Empresa ABC',
        address: 'Rua das Flores, 123 - Centro',
        city: 'São Paulo',
        phone: '(11) 1111-1111',
        email: 'contato@empresaabc.com',
        isTransporter: false,
        createdAt: new Date(),
      },
      {
        id: '2',
        name: 'Transportadora XYZ',
        address: 'Av. Industrial, 456 - Zona Norte',
        city: 'São Paulo',
        phone: '(11) 2222-2222',
        email: 'operacao@transportadoraxyz.com',
        isTransporter: true,
        createdAt: new Date(),
      },
      {
        id: '3',
        name: 'Loja DEF',
        address: 'Rua Comercial, 789 - Vila Madalena',
        city: 'São Paulo',
        phone: '(11) 3333-3333',
        isTransporter: false,
        createdAt: new Date(),
      },
    ];

    setDrivers(mockDrivers);
    setVehicles(mockVehicles);
    setClients(mockClients);
  }, []);

  // Driver methods
  const addDriver = (driver: Omit<Driver, 'id' | 'createdAt'>) => {
    const newDriver: Driver = {
      ...driver,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setDrivers(prev => [...prev, newDriver]);
  };

  const updateDriver = (id: string, driver: Partial<Driver>) => {
    setDrivers(prev => prev.map(d => d.id === id ? { ...d, ...driver } : d));
  };

  const deleteDriver = (id: string) => {
    setDrivers(prev => prev.filter(d => d.id !== id));
  };

  // Vehicle methods
  const addVehicle = (vehicle: Omit<Vehicle, 'id'>) => {
    const newVehicle: Vehicle = {
      ...vehicle,
      id: Date.now().toString(),
    };
    setVehicles(prev => [...prev, newVehicle]);
  };

  const updateVehicle = (id: string, vehicle: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...vehicle } : v));
  };

  const deleteVehicle = (id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
  };

  // Client methods
  const addClient = (client: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient: Client = {
      ...client,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setClients(prev => [...prev, newClient]);
  };

  const updateClient = (id: string, client: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...client } : c));
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
  };

  const importClients = (newClients: Omit<Client, 'id' | 'createdAt'>[]) => {
    const clientsWithIds = newClients.map(client => ({
      ...client,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    }));
    setClients(prev => [...prev, ...clientsWithIds]);
  };

  // Route methods
  const addRoute = (route: Omit<Route, 'id' | 'createdAt'>) => {
    const newRoute: Route = {
      ...route,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setRoutes(prev => [...prev, newRoute]);
  };

  const updateRoute = (id: string, route: Partial<Route>) => {
    setRoutes(prev => prev.map(r => r.id === id ? { ...r, ...route } : r));
  };

  const deleteRoute = (id: string) => {
    setRoutes(prev => prev.filter(r => r.id !== id));
  };

  // Expense methods
  const addExpense = (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setExpenses(prev => [...prev, newExpense]);
  };

  const updateExpense = (id: string, expense: Partial<Expense>) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...expense } : e));
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  return (
    <DataContext.Provider value={{
      drivers, addDriver, updateDriver, deleteDriver,
      vehicles, addVehicle, updateVehicle, deleteVehicle,
      clients, addClient, updateClient, deleteClient, importClients,
      routes, addRoute, updateRoute, deleteRoute,
      expenses, addExpense, updateExpense, deleteExpense,
    }}>
      {children}
    </DataContext.Provider>
  );
};