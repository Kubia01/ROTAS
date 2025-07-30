import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { Login } from './components/Login';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { AdminDashboard } from './components/Dashboard/AdminDashboard';
import { DriverDashboard } from './components/Dashboard/DriverDashboard';
import { DriversManagement } from './components/Drivers/DriversManagement';
import { VehiclesManagement } from './components/Vehicles/VehiclesManagement';
import { ClientsManagement } from './components/Clients/ClientsManagement';
import { RoutesManagement } from './components/Routes/RoutesManagement';
import { ExpensesManagement } from './components/Expenses/ExpensesManagement';
import { ReportsManagement } from './components/Reports/ReportsManagement';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return user.role === 'admin' ? 'Dashboard Administrativo' : 'Dashboard do Motorista';
      case 'drivers':
        return 'Gestão de Motoristas';
      case 'vehicles':
        return 'Gestão de Veículos';
      case 'clients':
        return 'Gestão de Clientes';
      case 'routes':
        return 'Gestão de Rotas';
      case 'my-routes':
        return 'Minhas Rotas';
      case 'delivery-form':
        return 'Formulário de Entrega';
      case 'expenses':
        return 'Gestão de Gastos';
      case 'reports':
        return 'Relatórios';
      default:
        return 'Sistema TWS';
    }
  };

  const getPageSubtitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return user.role === 'admin' 
          ? 'Visão geral das operações de entrega'
          : 'Acompanhe suas rotas e entregas';
      default:
        return '';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return user.role === 'admin' ? <AdminDashboard /> : <DriverDashboard />;
      case 'drivers':
        return <DriversManagement />;
      case 'vehicles':
        return <VehiclesManagement />;
      case 'clients':
        return <ClientsManagement />;
      case 'routes':
      case 'my-routes':
        return <RoutesManagement />;
      case 'delivery-form':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Formulário de Entrega</h3>
            <p className="text-gray-600">
              Esta funcionalidade está integrada ao sistema de rotas. 
              Acesse "Minhas Rotas" para registrar entregas.
            </p>
          </div>
        );
      case 'expenses':
        return <ExpensesManagement />;
      case 'reports':
        return <ReportsManagement />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col">
        <Header 
          title={getPageTitle()} 
          subtitle={getPageSubtitle()}
        />
        
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;