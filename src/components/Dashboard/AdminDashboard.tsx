import React from 'react';
import { 
  Truck, 
  Users, 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';

export const AdminDashboard: React.FC = () => {
  const { drivers, vehicles, routes, expenses, clients } = useData();

  const today = new Date();
  const todayRoutes = routes.filter(route => 
    new Date(route.date).toDateString() === today.toDateString()
  );

  const activeDrivers = drivers.filter(d => d.active);
  const activeVehicles = vehicles.filter(v => v.active);
  
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const monthlyExpenses = expenses
    .filter(expense => new Date(expense.date).getMonth() === today.getMonth())
    .reduce((sum, expense) => sum + expense.amount, 0);

  const vehiclesMaintenance = vehicles.filter(v => {
    const kmUntilMaintenance = v.nextMaintenanceKm - v.currentKm;
    return kmUntilMaintenance <= 1000;
  });

  const stats = [
    {
      title: 'Rotas Hoje',
      value: todayRoutes.length.toString(),
      icon: MapPin,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: 'Motoristas Ativos',
      value: activeDrivers.length.toString(),
      icon: Users,
      color: 'bg-green-500',
      change: '+5%',
    },
    {
      title: 'Veículos Ativos',
      value: activeVehicles.length.toString(),
      icon: Truck,
      color: 'bg-purple-500',
      change: '0%',
    },
    {
      title: 'Gastos do Mês',
      value: `R$ ${monthlyExpenses.toLocaleString('pt-BR')}`,
      icon: DollarSign,
      color: 'bg-orange-500',
      change: '-8%',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-500">{stat.change}</span>
                  </div>
                </div>
                <div className={`${stat.color} rounded-lg p-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alerts */}
      {vehiclesMaintenance.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2" />
            <p className="text-yellow-800">
              <strong>{vehiclesMaintenance.length} veículo(s)</strong> próximos da revisão:
              {vehiclesMaintenance.map(v => ` ${v.plate}`).join(', ')}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Routes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Rotas de Hoje</h3>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          
          {todayRoutes.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nenhuma rota programada para hoje</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayRoutes.map((route) => (
                <div key={route.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{route.driver.name}</p>
                    <p className="text-sm text-gray-600">{route.vehicle.plate} - {route.stops.length} paradas</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      route.status === 'completed' ? 'bg-green-100 text-green-800' :
                      route.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {route.status === 'completed' ? 'Concluída' :
                       route.status === 'in_progress' ? 'Em Andamento' :
                       'Planejada'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Expenses */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Gastos Recentes</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>

          {expenses.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nenhum gasto registrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.slice(0, 5).map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {expense.type === 'fuel' ? 'Combustível' :
                       expense.type === 'toll' ? 'Pedágio' :
                       expense.type === 'maintenance' ? 'Manutenção' :
                       'Aluguel'}
                    </p>
                    <p className="text-sm text-gray-600">{expense.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">R$ {expense.amount.toLocaleString('pt-BR')}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(expense.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};