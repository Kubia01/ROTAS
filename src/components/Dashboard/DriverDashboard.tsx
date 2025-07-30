import React from 'react';
import { 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Route as RouteIcon,
  Calendar
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

export const DriverDashboard: React.FC = () => {
  const { routes } = useData();
  const { user } = useAuth();

  const today = new Date();
  const myRoutes = routes.filter(route => route.driver.email === user?.email);
  const todayRoute = myRoutes.find(route => 
    new Date(route.date).toDateString() === today.toDateString()
  );

  const completedDeliveries = myRoutes.reduce((count, route) => {
    return count + route.stops.filter(stop => stop.status === 'completed').length;
  }, 0);

  const pendingDeliveries = myRoutes.reduce((count, route) => {
    return count + route.stops.filter(stop => stop.status === 'pending').length;
  }, 0);

  const totalKm = myRoutes.reduce((total, route) => total + (route.totalKm || 0), 0);

  const stats = [
    {
      title: 'Entregas Concluídas',
      value: completedDeliveries.toString(),
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      title: 'Entregas Pendentes',
      value: pendingDeliveries.toString(),
      icon: AlertCircle,
      color: 'bg-yellow-500',
    },
    {
      title: 'KM Total',
      value: totalKm.toLocaleString('pt-BR'),
      icon: MapPin,
      color: 'bg-blue-500',
    },
    {
      title: 'Rotas Realizadas',
      value: myRoutes.length.toString(),
      icon: RouteIcon,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Rota de Hoje */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-blue-900">Rota de Hoje</h2>
        </div>
        
        {todayRoute ? (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold text-gray-900">Veículo: {todayRoute.vehicle.plate}</p>
                <p className="text-gray-600">{todayRoute.stops.length} paradas programadas</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                todayRoute.status === 'completed' ? 'bg-green-100 text-green-800' :
                todayRoute.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {todayRoute.status === 'completed' ? 'Concluída' :
                 todayRoute.status === 'in_progress' ? 'Em Andamento' :
                 'Não Iniciada'}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Horário de Saída:</span>
                <p className="font-medium">{todayRoute.startTime ? new Date(todayRoute.startTime).toLocaleTimeString('pt-BR') : 'Não registrado'}</p>
              </div>
              <div>
                <span className="text-gray-500">KM Inicial:</span>
                <p className="font-medium">{todayRoute.startKm ? todayRoute.startKm.toLocaleString('pt-BR') : 'Não registrado'}</p>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <p className="font-medium">
                  {todayRoute.stops.filter(s => s.status === 'completed').length} de {todayRoute.stops.length} concluídas
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg p-8 text-center shadow-sm">
            <RouteIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhuma rota programada para hoje</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} rounded-lg p-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Próximas Entregas */}
      {todayRoute && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximas Entregas</h3>
          
          {todayRoute.stops.filter(stop => stop.status === 'pending').length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-3" />
              <p className="text-gray-500">Todas as entregas foram concluídas!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayRoute.stops
                .filter(stop => stop.status === 'pending')
                .slice(0, 3)
                .map((stop, index) => (
                  <div key={stop.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">{stop.stopNumber}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{stop.client.name}</p>
                      <p className="text-sm text-gray-600">{stop.client.address}</p>
                      {stop.estimatedTime && (
                        <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          Previsão: {stop.estimatedTime}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        Pendente
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};