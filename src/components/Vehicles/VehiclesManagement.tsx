import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Car, Calendar, AlertTriangle, Gauge } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { Vehicle } from '../../types';

export const VehiclesManagement: React.FC = () => {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({
    plate: '',
    model: '',
    year: new Date().getFullYear(),
    currentKm: 0,
    lastMaintenanceKm: 0,
    nextMaintenanceKm: 0,
    maintenanceIntervalKm: 10000,
    active: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const vehicleData = {
      ...formData,
    };
    
    if (editingVehicle) {
      updateVehicle(editingVehicle.id, vehicleData);
    } else {
      addVehicle(vehicleData);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      plate: '',
      model: '',
      year: new Date().getFullYear(),
      currentKm: 0,
      lastMaintenanceKm: 0,
      nextMaintenanceKm: 0,
      maintenanceIntervalKm: 10000,
      active: true,
    });
    setEditingVehicle(null);
    setIsModalOpen(false);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      plate: vehicle.plate,
      model: vehicle.model,
      year: vehicle.year,
      currentKm: vehicle.currentKm,
      lastMaintenanceKm: vehicle.lastMaintenanceKm,
      nextMaintenanceKm: vehicle.nextMaintenanceKm,
      maintenanceIntervalKm: vehicle.maintenanceIntervalKm,
      active: vehicle.active,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (vehicleId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este veículo?')) {
      deleteVehicle(vehicleId);
    }
  };

  const getMaintenanceStatus = (currentKm: number, nextMaintenanceKm: number) => {
    const kmUntilMaintenance = nextMaintenanceKm - currentKm;
    
    if (kmUntilMaintenance < 0) {
      return { status: 'overdue', color: 'text-red-600', bgColor: 'bg-red-50' };
    } else if (kmUntilMaintenance <= 1000) {
      return { status: 'due_soon', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    }
    return { status: 'ok', color: 'text-green-600', bgColor: 'bg-green-50' };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Veículos</h2>
          <p className="text-gray-600">Gerencie a frota de veículos da empresa</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Veículo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => {
          const maintenanceStatus = getMaintenanceStatus(vehicle.currentKm, vehicle.nextMaintenanceKm);
          
          return (
            <div key={vehicle.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Car className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{vehicle.plate}</h3>
                    <p className="text-sm text-gray-600">{vehicle.model} ({vehicle.year})</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(vehicle)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(vehicle.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Gauge className="w-4 h-4" />
                    Quilometragem
                  </span>
                  <span className="font-medium">{vehicle.currentKm.toLocaleString('pt-BR')} km</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    vehicle.active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {vehicle.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                <div className={`p-3 rounded-lg ${maintenanceStatus.bgColor}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {maintenanceStatus.status === 'overdue' ? (
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    ) : (
                      <Calendar className="w-4 h-4 text-gray-600" />
                    )}
                    <span className="text-sm font-medium text-gray-900">
                      Próxima Revisão
                    </span>
                  </div>
                  <p className={`text-sm ${maintenanceStatus.color}`}>
                    {vehicle.nextMaintenanceKm.toLocaleString('pt-BR')} km
                  </p>
                  <p className="text-xs text-gray-500">
                    Faltam {(vehicle.nextMaintenanceKm - vehicle.currentKm).toLocaleString('pt-BR')} km
                  </p>
                  {maintenanceStatus.status === 'overdue' && (
                    <p className="text-xs text-red-600 mt-1">Revisão vencida!</p>
                  )}
                  {maintenanceStatus.status === 'due_soon' && (
                    <p className="text-xs text-yellow-600 mt-1">Revisão próxima!</p>
                  )}
                </div>

                <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                  <p>Última revisão: {vehicle.lastMaintenanceKm.toLocaleString('pt-BR')} km</p>
                  <p>Intervalo: {vehicle.maintenanceIntervalKm.toLocaleString('pt-BR')} km</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingVehicle ? 'Editar Veículo' : 'Novo Veículo'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Placa
                </label>
                <input
                  type="text"
                  required
                  value={formData.plate}
                  onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                  placeholder="ABC-1234"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modelo
                </label>
                <input
                  type="text"
                  required
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ano
                </label>
                <input
                  type="number"
                  required
                  min="1990"
                  max={new Date().getFullYear() + 1}
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quilometragem Atual
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.currentKm}
                  onChange={(e) => setFormData({ ...formData, currentKm: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  KM da Última Revisão
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.lastMaintenanceKm}
                  onChange={(e) => setFormData({ ...formData, lastMaintenanceKm: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  KM da Próxima Revisão
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.nextMaintenanceKm}
                  onChange={(e) => setFormData({ ...formData, nextMaintenanceKm: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Intervalo de Revisão (KM)
                </label>
                <input
                  type="number"
                  required
                  min="1000"
                  step="1000"
                  value={formData.maintenanceIntervalKm}
                  onChange={(e) => setFormData({ ...formData, maintenanceIntervalKm: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="active" className="text-sm text-gray-700">
                  Veículo ativo
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingVehicle ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};