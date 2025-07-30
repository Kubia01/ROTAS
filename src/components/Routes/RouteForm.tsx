import React, { useState } from 'react';
import { X, Plus, MapPin, Calendar, User, Car, Trash2, MoveUp, MoveDown, Users } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { DeliveryStop } from '../../types';

interface RouteFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RouteForm: React.FC<RouteFormProps> = ({ isOpen, onClose }) => {
  const { drivers, vehicles, clients, addRoute } = useData();
  const [showOptimizeModal, setShowOptimizeModal] = useState(false);
  const [optimizeSettings, setOptimizeSettings] = useState({
    prioritizeTransporters: true,
    groupByCity: true,
    splitBetweenDrivers: false,
    maxStopsPerDriver: 10,
  });
  const [formData, setFormData] = useState({
    driverId: '',
    vehicleId: '',
    date: new Date().toISOString().split('T')[0],
  });
  
  const [stops, setStops] = useState<Partial<DeliveryStop>[]>([]);
  const [newStop, setNewStop] = useState({
    clientId: '',
    observations: '',
    estimatedTime: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.driverId || !formData.vehicleId || stops.length === 0) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const driver = drivers.find(d => d.id === formData.driverId)!;
    const vehicle = vehicles.find(v => v.id === formData.vehicleId)!;
    
    const routeStops: DeliveryStop[] = stops.map((stop, index) => ({
      id: `${Date.now()}-${index}`,
      clientId: stop.clientId!,
      client: clients.find(c => c.id === stop.clientId)!,
      stopNumber: index + 1,
      estimatedTime: stop.estimatedTime,
      observations: stop.observations,
      photos: [],
      status: 'pending' as const,
    }));

    addRoute({
      driverId: formData.driverId,
      driver,
      vehicleId: formData.vehicleId,
      vehicle,
      date: new Date(formData.date),
      stops: routeStops,
      status: 'planned',
    });

    onClose();
  };

  const handleOptimizeRoute = () => {
    if (stops.length < 2) return;

    let optimizedStops = [...stops];

    // Aplicar otimizações
    optimizedStops.sort((a, b) => {
      const clientA = clients.find(c => c.id === a.clientId);
      const clientB = clients.find(c => c.id === b.clientId);
      
      // Priorizar transportadoras primeiro se habilitado
      if (optimizeSettings.prioritizeTransporters) {
        if (clientA?.isTransporter && !clientB?.isTransporter) return -1;
        if (!clientA?.isTransporter && clientB?.isTransporter) return 1;
      }
      
      // Agrupar por cidade se habilitado
      if (optimizeSettings.groupByCity) {
        const cityComparison = (clientA?.city || '').localeCompare(clientB?.city || '');
        if (cityComparison !== 0) return cityComparison;
      }
      
      // Ordenar por horário estimado
      if (a.estimatedTime && b.estimatedTime) {
        return a.estimatedTime.localeCompare(b.estimatedTime);
      }
      
      return 0;
    });

    setStops(optimizedStops);
    setShowOptimizeModal(false);
    
    let message = 'Rota otimizada com sucesso!';
    if (optimizeSettings.prioritizeTransporters) message += '\n• Transportadoras priorizadas';
    if (optimizeSettings.groupByCity) message += '\n• Agrupado por cidade';
    
    alert(message);
  };

  const splitRoutesBetweenDrivers = () => {
    if (stops.length < 2) {
      alert('É necessário ter pelo menos 2 paradas para dividir a rota');
      return;
    }

    const availableDrivers = drivers.filter(d => d.active);
    if (availableDrivers.length < 2) {
      alert('É necessário ter pelo menos 2 motoristas ativos para dividir a rota');
      return;
    }

    // Primeiro otimizar a rota se as configurações estiverem habilitadas
    let optimizedStops = [...stops];
    
    if (optimizeSettings.prioritizeTransporters || optimizeSettings.groupByCity) {
      optimizedStops.sort((a, b) => {
        const clientA = clients.find(c => c.id === a.clientId);
        const clientB = clients.find(c => c.id === b.clientId);
        
        // Priorizar transportadoras primeiro se habilitado
        if (optimizeSettings.prioritizeTransporters) {
          if (clientA?.isTransporter && !clientB?.isTransporter) return -1;
          if (!clientA?.isTransporter && clientB?.isTransporter) return 1;
        }
        
        // Agrupar por cidade se habilitado
        if (optimizeSettings.groupByCity) {
          const cityComparison = (clientA?.city || '').localeCompare(clientB?.city || '');
          if (cityComparison !== 0) return cityComparison;
        }
        
        // Ordenar por horário estimado
        if (a.estimatedTime && b.estimatedTime) {
          return a.estimatedTime.localeCompare(b.estimatedTime);
        }
        
        return 0;
      });
    }
    const stopsPerDriver = Math.ceil(optimizedStops.length / availableDrivers.length);
    const routeGroups: { driverId: string; stops: typeof stops }[] = [];

    for (let i = 0; i < availableDrivers.length; i++) {
      const startIndex = i * stopsPerDriver;
      const endIndex = Math.min(startIndex + stopsPerDriver, optimizedStops.length);
      const driverStops = optimizedStops.slice(startIndex, endIndex);
      
      if (driverStops.length > 0) {
        routeGroups.push({
          driverId: availableDrivers[i].id,
          stops: driverStops
        });
      }
    }

    // Criar múltiplas rotas
    routeGroups.forEach((group, index) => {
      const driver = drivers.find(d => d.id === group.driverId)!;
      const vehicle = vehicles.find(v => v.id === driver.vehicleId);
      
      if (!vehicle) {
        alert(`Motorista ${driver.name} não possui veículo associado`);
        return;
      }

      const routeStops: DeliveryStop[] = group.stops.map((stop, stopIndex) => ({
        id: `${Date.now()}-${index}-${stopIndex}`,
        clientId: stop.clientId!,
        client: clients.find(c => c.id === stop.clientId)!,
        stopNumber: stopIndex + 1,
        estimatedTime: stop.estimatedTime,
        observations: stop.observations,
        photos: [],
        status: 'pending' as const,
      }));

      addRoute({
        driverId: group.driverId,
        driver,
        vehicleId: vehicle.id,
        vehicle,
        date: new Date(formData.date),
        stops: routeStops,
        status: 'planned',
      });
    });

    const routeDetails = routeGroups.map((group, index) => {
      const driver = drivers.find(d => d.id === group.driverId)!;
      return `• ${driver.name}: ${group.stops.length} paradas`;
    }).join('\n');
    
    alert(`${routeGroups.length} rotas criadas e divididas entre os motoristas:\n\n${routeDetails}`);
    setShowOptimizeModal(false);
    onClose();
  };

  const addStop = () => {
    if (!newStop.clientId) {
      alert('Selecione um cliente');
      return;
    }

    // Verificar se o cliente já foi adicionado
    if (stops.some(stop => stop.clientId === newStop.clientId)) {
      alert('Este cliente já foi adicionado à rota');
      return;
    }

    const client = clients.find(c => c.id === newStop.clientId);
    if (!client) return;

    setStops([...stops, {
      clientId: newStop.clientId,
      observations: newStop.observations,
      estimatedTime: newStop.estimatedTime,
    }]);

    setNewStop({
      clientId: '',
      observations: '',
      estimatedTime: '',
    });
  };

  const removeStop = (index: number) => {
    setStops(stops.filter((_, i) => i !== index));
  };

  const moveStop = (index: number, direction: 'up' | 'down') => {
    const newStops = [...stops];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newStops.length) {
      [newStops[index], newStops[targetIndex]] = [newStops[targetIndex], newStops[index]];
      setStops(newStops);
    }
  };

  const optimizeRoute = () => {
    if (stops.length < 2) return;

    setShowOptimizeModal(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Nova Rota de Entrega</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User className="w-4 h-4 inline mr-1" />
                  Motorista
                </label>
                <select
                  required
                  value={formData.driverId}
                  onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione um motorista</option>
                  {drivers.filter(d => d.active).map(driver => (
                    <option key={driver.id} value={driver.id}>{driver.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Car className="w-4 h-4 inline mr-1" />
                  Veículo
                </label>
                <select
                  required
                  value={formData.vehicleId}
                  onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione um veículo</option>
                  {vehicles.filter(v => v.active).map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.model} - {vehicle.plate}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Data
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Adicionar Parada */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Adicionar Parada</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Cliente</label>
                  <select
                    value={newStop.clientId}
                    onChange={(e) => setNewStop({ ...newStop, clientId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name} {client.isTransporter && '(Transportadora)'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Horário Previsto</label>
                  <input
                    type="time"
                    value={newStop.estimatedTime}
                    onChange={(e) => setNewStop({ ...newStop, estimatedTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Observações</label>
                  <input
                    type="text"
                    value={newStop.observations}
                    onChange={(e) => setNewStop({ ...newStop, observations: e.target.value })}
                    placeholder="Observações..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={addStop}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar
                  </button>
                </div>
              </div>
            </div>

            {/* Lista de Paradas */}
            {stops.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-900">
                    Paradas Programadas ({stops.length})
                  </h4>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={optimizeRoute}
                      className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm"
                    >
                      <MapPin className="w-4 h-4" />
                      Otimizar Rota
                    </button>
                    
                    {stops.length >= 2 && (
                      <button
                        type="button"
                        onClick={() => {
                          setOptimizeSettings({ ...optimizeSettings, splitBetweenDrivers: true });
                          setShowOptimizeModal(true);
                        }}
                        className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                      >
                        <Users className="w-4 h-4" />
                        Dividir Rotas
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {stops.map((stop, index) => {
                    const client = clients.find(c => c.id === stop.clientId);
                    return (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-gray-900 truncate">
                                {client?.name} {client?.isTransporter && '(Transportadora)'}
                              </h5>
                              <p className="text-sm text-gray-500 truncate">{client?.address}</p>
                              {stop.transporter && (
                                <p className="text-xs text-blue-600">Via: {stop.transporter.name}</p>
                              )}
                              {stop.deliveryAddress && (
                                <p className="text-xs text-orange-600">Entrega: {stop.deliveryAddress}</p>
                              )}
                              {stop.estimatedTime && (
                                <p className="text-xs text-blue-600">Previsto: {stop.estimatedTime}</p>
                              )}
                              {stop.observations && (
                                <p className="text-xs text-gray-400">Obs: {stop.observations}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => moveStop(index, 'up')}
                              disabled={index === 0}
                              className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-50"
                            >
                              <MoveUp className="w-4 h-4" />
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => moveStop(index, 'down')}
                              disabled={index === stops.length - 1}
                              className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-50"
                            >
                              <MoveDown className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => removeStop(index)}
                              className="p-1 text-gray-400 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Botões de Ação */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Criar Rota
              </button>
            </div>
          </form>
        </div>

        {/* Modal de Otimização */}
        {showOptimizeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Otimizar Rota</h3>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={optimizeSettings.prioritizeTransporters}
                      onChange={(e) => setOptimizeSettings({ 
                        ...optimizeSettings, 
                        prioritizeTransporters: e.target.checked 
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Priorizar transportadoras primeiro</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={optimizeSettings.groupByCity}
                      onChange={(e) => setOptimizeSettings({ 
                        ...optimizeSettings, 
                        groupByCity: e.target.checked 
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Agrupar por cidade</span>
                  </label>
                  
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={optimizeSettings.splitBetweenDrivers}
                        onChange={(e) => setOptimizeSettings({ 
                          ...optimizeSettings, 
                          splitBetweenDrivers: e.target.checked 
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Dividir entre motoristas disponíveis</span>
                    </label>
                </div>
                {optimizeSettings.splitBetweenDrivers && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Atenção:</strong> Esta opção criará múltiplas rotas dividindo as {stops.length} paradas 
                      entre os motoristas disponíveis ({drivers.filter(d => d.active).length} ativos).
                      Cada motorista receberá aproximadamente {Math.ceil(stops.length / drivers.filter(d => d.active).length)} paradas.
                    </p>
                  </div>
                )}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowOptimizeModal(false)}
                    className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={optimizeSettings.splitBetweenDrivers ? splitRoutesBetweenDrivers : handleOptimizeRoute}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {optimizeSettings.splitBetweenDrivers ? 'Dividir Rotas' : 'Otimizar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};