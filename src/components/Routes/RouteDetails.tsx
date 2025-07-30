import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Play, 
  Square, 
  MapPin, 
  Clock, 
  User, 
  Car, 
  Camera,
  PenTool,
  CheckCircle,
  AlertCircle,
  Navigation,
  Building2,
  DollarSign
} from 'lucide-react';
import { Route, DeliveryStop } from '../../types';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

interface RouteDetailsProps {
  route: Route;
  onBack: () => void;
}

export const RouteDetails: React.FC<RouteDetailsProps> = ({ route, onBack }) => {
  const { updateRoute, addExpense, vehicles } = useData();
  const { user } = useAuth();
  const [routeData, setRouteData] = useState(route);
  const [showDeliveryForm, setShowDeliveryForm] = useState<string | null>(null);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [dailyData, setDailyData] = useState({
    startTime: route.startTime ? new Date(route.startTime).toLocaleTimeString('pt-BR', { hour12: false }) : '',
    endTime: route.endTime ? new Date(route.endTime).toLocaleTimeString('pt-BR', { hour12: false }) : '',
    startKm: route.startKm || 0,
    endKm: route.endKm || 0,
  });

  const [deliveryForm, setDeliveryForm] = useState({
    entryTime: '',
    exitTime: '',
    observations: '',
    recipientName: '',
    recipientCpf: '',
    recipientEmail: '',
    recipientDepartment: '',
  });

  const [expenseForm, setExpenseForm] = useState({
    type: 'fuel' as 'fuel' | 'toll' | 'maintenance' | 'rental',
    amount: 0,
    description: '',
  });

  const isDriverView = user?.role === 'driver';
  const isMyRoute = user?.email === routeData.driver.email;

  // Para motoristas, só mostrar suas próprias rotas
  if (isDriverView && !isMyRoute) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Acesso Negado</h3>
        <p className="text-gray-500">Você só pode visualizar suas próprias rotas</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Voltar
        </button>
      </div>
    );
  }

  const handleStartRoute = () => {
    const now = new Date();
    const updatedRoute = {
      ...routeData,
      status: 'in_progress' as const,
      startTime: now,
    };
    
    setRouteData(updatedRoute);
    updateRoute(route.id, updatedRoute);
    
    setDailyData(prev => ({
      ...prev,
      startTime: now.toLocaleTimeString('pt-BR', { hour12: false }),
    }));
  };

  const handleCompleteRoute = () => {
    if (!dailyData.endKm || dailyData.endKm <= dailyData.startKm) {
      alert('Por favor, informe a quilometragem final');
      return;
    }

    const now = new Date();
    const updatedRoute = {
      ...routeData,
      status: 'completed' as const,
      endTime: now,
      totalKm: dailyData.endKm - dailyData.startKm,
      startKm: dailyData.startKm,
      endKm: dailyData.endKm,
    };
    
    setRouteData(updatedRoute);
    updateRoute(route.id, updatedRoute);
    
    setDailyData(prev => ({
      ...prev,
      endTime: now.toLocaleTimeString('pt-BR', { hour12: false }),
    }));
  };

  const handleCompleteDelivery = (stopId: string) => {
    if (!deliveryForm.recipientName || !deliveryForm.recipientCpf) {
      alert('Nome e CPF do recebedor são obrigatórios');
      return;
    }

    const now = new Date();
    const updatedStops = routeData.stops.map(stop => 
      stop.id === stopId 
        ? { 
            ...stop, 
            status: 'completed' as const, 
            completedAt: now,
            entryTime: deliveryForm.entryTime ? new Date(`${new Date().toDateString()} ${deliveryForm.entryTime}`) : undefined,
            exitTime: deliveryForm.exitTime ? new Date(`${new Date().toDateString()} ${deliveryForm.exitTime}`) : undefined,
            observations: deliveryForm.observations,
            recipientData: {
              name: deliveryForm.recipientName,
              cpf: deliveryForm.recipientCpf,
              email: deliveryForm.recipientEmail,
              department: deliveryForm.recipientDepartment,
            }
          }
        : stop
    );
    
    const updatedRoute = { ...routeData, stops: updatedStops };
    setRouteData(updatedRoute);
    updateRoute(route.id, { stops: updatedStops });

    // Avançar para próxima entrega automaticamente
    const nextPendingIndex = updatedStops.findIndex(stop => stop.status === 'pending');
    if (nextPendingIndex !== -1) {
      setCurrentStopIndex(nextPendingIndex);
    }

    setShowDeliveryForm(null);
    setDeliveryForm({
      entryTime: '',
      exitTime: '',
      observations: '',
      recipientName: '',
      recipientCpf: '',
      recipientEmail: '',
      recipientDepartment: '',
    });
  };

  const handleAddExpense = () => {
    if (!expenseForm.amount || !expenseForm.description) {
      alert('Valor e descrição são obrigatórios');
      return;
    }

    addExpense({
      routeId: route.id,
      vehicleId: routeData.vehicle.id,
      type: expenseForm.type,
      amount: expenseForm.amount,
      description: expenseForm.description,
      date: new Date(),
    });

    setShowExpenseForm(false);
    setExpenseForm({
      type: 'fuel',
      amount: 0,
      description: '',
    });

    alert('Gasto registrado com sucesso!');
  };

  const openGoogleMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
  };

  const completedStops = routeData.stops.filter(stop => stop.status === 'completed').length;
  const totalStops = routeData.stops.length;
  const progressPercentage = totalStops > 0 ? (completedStops / totalStops) * 100 : 0;

  // Para motoristas, mostrar apenas a próxima entrega
  const currentStop = isDriverView ? routeData.stops.find(stop => stop.status === 'pending') : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">Rota #{route.id.slice(-6)}</h2>
          <p className="text-gray-600">{new Date(route.date).toLocaleDateString('pt-BR')}</p>
        </div>

        <div className="flex gap-3">
          {routeData.status === 'planned' && isMyRoute && (
            <button
              onClick={handleStartRoute}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Play className="w-4 h-4" />
              Iniciar Rota
            </button>
          )}
          
          {routeData.status === 'in_progress' && isMyRoute && (
            <>
              <button
                onClick={() => setShowExpenseForm(true)}
                className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                <DollarSign className="w-4 h-4" />
                Registrar Gasto
              </button>
              <button
                onClick={handleCompleteRoute}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Square className="w-4 h-4" />
                Finalizar Rota
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações da Rota */}
        <div className="lg:col-span-1 space-y-6">
          {/* Dados Gerais */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Informações Gerais</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{routeData.driver.name}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{routeData.vehicle.model} - {routeData.vehicle.plate}</span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{totalStops} paradas</span>
              </div>
            </div>

            {/* Progress */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progresso</span>
                <span>{completedStops} / {totalStops}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Dados Diários */}
          {(isMyRoute || !isDriverView) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Dados Diários</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Horário de Saída</label>
                    <input
                      type="time"
                      value={dailyData.startTime}
                      onChange={(e) => setDailyData({ ...dailyData, startTime: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      disabled={routeData.status === 'completed' || !isMyRoute}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Horário de Chegada</label>
                    <input
                      type="time"
                      value={dailyData.endTime}
                      onChange={(e) => setDailyData({ ...dailyData, endTime: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      disabled={routeData.status !== 'in_progress' || !isMyRoute}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">KM Inicial</label>
                    <input
                      type="number"
                      value={dailyData.startKm}
                      onChange={(e) => setDailyData({ ...dailyData, startKm: parseInt(e.target.value) })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      disabled={routeData.status === 'completed' || !isMyRoute}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">KM Final</label>
                    <input
                      type="number"
                      value={dailyData.endKm}
                      onChange={(e) => setDailyData({ ...dailyData, endKm: parseInt(e.target.value) })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      disabled={routeData.status !== 'in_progress' || !isMyRoute}
                    />
                  </div>
                </div>

                {dailyData.startKm > 0 && dailyData.endKm > 0 && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <strong>KM Rodado:</strong> {(dailyData.endKm - dailyData.startKm).toLocaleString('pt-BR')} km
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Lista de Paradas */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              {isDriverView ? 'Próxima Entrega' : 'Paradas da Rota'}
            </h3>
            
            {isDriverView && currentStop ? (
              // Vista do motorista - apenas próxima entrega
              <div className="space-y-4">
                <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">{currentStop.stopNumber}</span>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 text-lg">{currentStop.client.name}</h4>
                        <p className="text-gray-600">{currentStop.deliveryAddress || currentStop.client.address}</p>
                        {currentStop.transporter && (
                          <div className="flex items-center gap-1 mt-1">
                            <Building2 className="w-4 h-4 text-orange-600" />
                            <span className="text-orange-600 text-sm">Via: {currentStop.transporter.name}</span>
                          </div>
                        )}
                        {currentStop.estimatedTime && (
                          <p className="text-blue-600 flex items-center gap-1 mt-1">
                            <Clock className="w-4 h-4" />
                            Previsão: {currentStop.estimatedTime}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openGoogleMaps(currentStop.deliveryAddress || currentStop.client.address)}
                        className="p-3 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                        title="Abrir no Google Maps"
                      >
                        <Navigation className="w-5 h-5" />
                      </button>
                      
                      <button
                        onClick={() => setShowDeliveryForm(currentStop.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Entregar
                      </button>
                    </div>
                  </div>

                  {currentStop.observations && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
                      <p className="text-yellow-800">{currentStop.observations}</p>
                    </div>
                  )}
                </div>

                {/* Progresso das entregas */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Progresso da Rota</h4>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Entregas concluídas</span>
                    <span>{completedStops} de {totalStops}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-500 h-3 rounded-full transition-all"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              // Vista do admin - todas as paradas
              <div className="space-y-4">
                {routeData.stops.map((stop, index) => (
                  <div key={stop.id} className={`border rounded-lg p-4 ${
                    stop.status === 'completed' ? 'border-green-200 bg-green-50' :
                    stop.status === 'failed' ? 'border-red-200 bg-red-50' :
                    'border-gray-200'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          stop.status === 'completed' ? 'bg-green-500 text-white' :
                          stop.status === 'failed' ? 'bg-red-500 text-white' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {stop.status === 'completed' ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : stop.status === 'failed' ? (
                            <AlertCircle className="w-4 h-4" />
                          ) : (
                            <span className="text-sm font-medium">{stop.stopNumber}</span>
                          )}
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900">{stop.client.name}</h4>
                          <p className="text-sm text-gray-600">{stop.deliveryAddress || stop.client.address}</p>
                          {stop.transporter && (
                            <div className="flex items-center gap-1 mt-1">
                              <Building2 className="w-3 h-3 text-orange-600" />
                              <span className="text-orange-600 text-xs">Via: {stop.transporter.name}</span>
                            </div>
                          )}
                          {stop.estimatedTime && (
                            <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" />
                              Previsão: {stop.estimatedTime}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => openGoogleMaps(stop.deliveryAddress || stop.client.address)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Abrir no Google Maps"
                        >
                          <Navigation className="w-4 h-4" />
                        </button>
                        
                        {stop.status === 'pending' && routeData.status === 'in_progress' && isMyRoute && (
                          <button
                            onClick={() => setShowDeliveryForm(stop.id)}
                            className="px-3 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors text-sm"
                          >
                            Entregar
                          </button>
                        )}
                      </div>
                    </div>

                    {stop.observations && (
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-3">
                        <p className="text-sm text-yellow-800">{stop.observations}</p>
                      </div>
                    )}

                    {stop.status === 'completed' && (
                      <div className="text-xs text-green-600 space-y-1">
                        <p>Concluída em: {stop.completedAt ? new Date(stop.completedAt).toLocaleString('pt-BR') : 'N/A'}</p>
                        {stop.recipientData && (
                          <p>Recebedor: {stop.recipientData.name} - {stop.recipientData.cpf}</p>
                        )}
                        {stop.entryTime && stop.exitTime && (
                          <p>Permanência: {stop.entryTime.toLocaleTimeString('pt-BR')} - {stop.exitTime.toLocaleTimeString('pt-BR')}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Formulário de Entrega */}
      {showDeliveryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Registrar Entrega</h3>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horário de Entrada
                  </label>
                  <input
                    type="time"
                    value={deliveryForm.entryTime}
                    onChange={(e) => setDeliveryForm({ ...deliveryForm, entryTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horário de Saída
                  </label>
                  <input
                    type="time"
                    value={deliveryForm.exitTime}
                    onChange={(e) => setDeliveryForm({ ...deliveryForm, exitTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações da entrega
                </label>
                <textarea
                  value={deliveryForm.observations}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, observations: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Observações sobre a entrega..."
                />
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Dados do Recebedor</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={deliveryForm.recipientName}
                      onChange={(e) => setDeliveryForm({ ...deliveryForm, recipientName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CPF *
                    </label>
                    <input
                      type="text"
                      required
                      value={deliveryForm.recipientCpf}
                      onChange={(e) => setDeliveryForm({ ...deliveryForm, recipientCpf: e.target.value })}
                      placeholder="000.000.000-00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      E-mail
                    </label>
                    <input
                      type="email"
                      value={deliveryForm.recipientEmail}
                      onChange={(e) => setDeliveryForm({ ...deliveryForm, recipientEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Setor/Departamento
                    </label>
                    <input
                      type="text"
                      value={deliveryForm.recipientDepartment}
                      onChange={(e) => setDeliveryForm({ ...deliveryForm, recipientDepartment: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Camera className="w-4 h-4 inline mr-1" />
                    Fotos da entrega
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <PenTool className="w-4 h-4 inline mr-1" />
                    Assinatura digital
                  </label>
                  <div className="h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 text-sm">
                    Canvas para assinatura
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowDeliveryForm(null)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleCompleteDelivery(showDeliveryForm)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Confirmar Entrega
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Registro de Gastos */}
      {showExpenseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Registrar Gasto</h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Gasto
                </label>
                <select
                  value={expenseForm.type}
                  onChange={(e) => setExpenseForm({ ...expenseForm, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="fuel">Combustível</option>
                  <option value="toll">Pedágio</option>
                  <option value="maintenance">Manutenção</option>
                  <option value="rental">Aluguel</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  rows={3}
                  placeholder="Descreva o gasto..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowExpenseForm(false)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddExpense}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Registrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};