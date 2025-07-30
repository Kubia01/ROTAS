import React from 'react';
import { 
  Home, 
  Users, 
  Car, 
  UserCheck, 
  Route, 
  FileText, 
  DollarSign, 
  BarChart3,
  LogOut,
  Settings
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { user, logout } = useAuth();

  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'drivers', label: 'Motoristas', icon: UserCheck },
    { id: 'vehicles', label: 'Veículos', icon: Car },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'routes', label: 'Rotas', icon: Route },
    { id: 'expenses', label: 'Gastos', icon: DollarSign },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
  ];

  const driverMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'my-routes', label: 'Minhas Rotas', icon: Route },
    { id: 'delivery-form', label: 'Formulário Entrega', icon: FileText },
    { id: 'expenses', label: 'Meus Gastos', icon: DollarSign },
  ];

  const menuItems = user?.role === 'admin' ? adminMenuItems : driverMenuItems;

  return (
    <div className="bg-white shadow-lg w-64 min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Car className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Sistema TWS</h2>
            <p className="text-sm text-gray-500">{user?.role === 'admin' ? 'Administrador' : 'Motorista'}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-6">
        <ul className="space-y-2 px-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                    activeTab === item.id
                      ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-900">{user?.name}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>
        
        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <Settings className="w-4 h-4" />
            Config
          </button>
          <button
            onClick={logout}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </div>
    </div>
  );
};