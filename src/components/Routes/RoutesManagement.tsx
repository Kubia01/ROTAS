import React, { useState } from 'react';
import { Plus, MapPin, Clock, User, Car, Calendar } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { Route, DeliveryStop } from '../../types';
import { RouteForm } from './RouteForm';
import { RouteDetails } from './RouteDetails';

export const RoutesManagement: React.FC = () => {
  const { routes, drivers, vehicles, clients } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'details'>('list');

  const getRouteStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRouteStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluída';
      case 'in_progress':
        return 'Em Andamento';
      default:
        return 'Planejada';
    }
  };

  const handleViewRoute = (route: Route) => {
    setSelectedRoute(route);
    setViewMode('details');
  };

  const handleBackToList = () => {
    setSelectedRoute(null);
    setViewMode('list');
  };

  if (viewMode === 'details' && selectedRoute) {
    return <RouteDetails route={selectedRoute} onBack={handleBackToList} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Rotas</h2>
          <p className="text-gray-600">Planeje e gerencie as rotas de entrega</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Rota
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex gap-4 items-center">
          <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">Todos os motoristas</option>
            {drivers.map(driver => (
              <option key={driver.id} value={driver.id}>{driver.name}</option>
            ))}
          </select>
          
          <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">Todos os status</option>
            <option value="planned">Planejada</option>
            <option value="in_progress">Em Andamento</option>
            <option value="completed">Concluída</option>
          </select>

          <input
            type="date"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Lista de Rotas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {routes.map((route) => (
          <div key={route.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Rota #{route.id.slice(-6)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {new Date(route.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRouteStatusColor(route.status)}`}>
                {getRouteStatusText(route.status)}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{route.driver.name}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Car className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{route.vehicle.model} - {route.vehicle.plate}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{route.stops.length} paradas</span>
              </div>

              {route.startTime && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">
                    Iniciada às {new Date(route.startTime).toLocaleTimeString('pt-BR')}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleViewRoute(route)}
                className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                Ver Detalhes
              </button>
              {route.status === 'planned' && (
                <button className="px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium">
                  Iniciar
                </button>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progresso</span>
                <span>
                  {route.stops.filter(s => s.status === 'completed').length} / {route.stops.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ 
                    width: `${(route.stops.filter(s => s.status === 'completed').length / route.stops.length) * 100}%` 
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {routes.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma rota encontrada</h3>
          <p className="text-gray-500 mb-6">Comece criando sua primeira rota de entrega</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Criar Nova Rota
          </button>
        </div>
      )}

      {/* Modal de Nova Rota */}
      {isModalOpen && (
        <RouteForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};