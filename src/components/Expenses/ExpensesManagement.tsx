import React, { useState } from 'react';
import { Plus, Edit2, Trash2, DollarSign, Upload, Calendar, Car, Receipt, Fuel, Wrench, CreditCard } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { Expense } from '../../types';

export const ExpensesManagement: React.FC = () => {
  const { expenses, vehicles, routes, addExpense, updateExpense, deleteExpense } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState({
    routeId: '',
    vehicleId: '',
    type: 'fuel' as 'fuel' | 'toll' | 'maintenance' | 'rental',
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingExpense) {
      updateExpense(editingExpense.id, {
        ...formData,
        date: new Date(formData.date),
      });
    } else {
      addExpense({
        ...formData,
        date: new Date(formData.date),
      });
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      routeId: '',
      vehicleId: '',
      type: 'fuel',
      amount: 0,
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
    setEditingExpense(null);
    setIsModalOpen(false);
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      routeId: expense.routeId || '',
      vehicleId: expense.vehicleId,
      type: expense.type,
      amount: expense.amount,
      description: expense.description,
      date: expense.date.toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleDelete = (expenseId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este gasto?')) {
      deleteExpense(expenseId);
    }
  };

  const getExpenseIcon = (type: string) => {
    switch (type) {
      case 'fuel':
        return <Fuel className="w-5 h-5" />;
      case 'toll':
        return <CreditCard className="w-5 h-5" />;
      case 'maintenance':
        return <Wrench className="w-5 h-5" />;
      case 'rental':
        return <Car className="w-5 h-5" />;
      default:
        return <DollarSign className="w-5 h-5" />;
    }
  };

  const getExpenseTypeText = (type: string) => {
    switch (type) {
      case 'fuel':
        return 'Combustível';
      case 'toll':
        return 'Pedágio';
      case 'maintenance':
        return 'Manutenção';
      case 'rental':
        return 'Aluguel';
      default:
        return type;
    }
  };

  const getExpenseTypeColor = (type: string) => {
    switch (type) {
      case 'fuel':
        return 'bg-blue-100 text-blue-800';
      case 'toll':
        return 'bg-yellow-100 text-yellow-800';
      case 'maintenance':
        return 'bg-red-100 text-red-800';
      case 'rental':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const monthlyExpenses = expenses
    .filter(expense => new Date(expense.date).getMonth() === new Date().getMonth())
    .reduce((sum, expense) => sum + expense.amount, 0);

  const expensesByType = expenses.reduce((acc, expense) => {
    acc[expense.type] = (acc[expense.type] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Gastos</h2>
          <p className="text-gray-600">Controle todos os gastos operacionais da frota</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Gasto
        </button>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Geral</p>
              <p className="text-2xl font-bold text-gray-900">R$ {totalExpenses.toLocaleString('pt-BR')}</p>
            </div>
            <div className="bg-blue-500 rounded-lg p-3">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Este Mês</p>
              <p className="text-2xl font-bold text-gray-900">R$ {monthlyExpenses.toLocaleString('pt-BR')}</p>
            </div>
            <div className="bg-green-500 rounded-lg p-3">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Combustível</p>
              <p className="text-2xl font-bold text-gray-900">R$ {(expensesByType.fuel || 0).toLocaleString('pt-BR')}</p>
            </div>
            <div className="bg-blue-500 rounded-lg p-3">
              <Fuel className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Manutenção</p>
              <p className="text-2xl font-bold text-gray-900">R$ {(expensesByType.maintenance || 0).toLocaleString('pt-BR')}</p>
            </div>
            <div className="bg-red-500 rounded-lg p-3">
              <Wrench className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Gastos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Histórico de Gastos</h3>
        </div>

        {expenses.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum gasto registrado</h3>
            <p className="text-gray-500 mb-6">Comece registrando os gastos operacionais</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Registrar Primeiro Gasto
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {expenses.map((expense) => {
              const vehicle = vehicles.find(v => v.id === expense.vehicleId);
              const route = expense.routeId ? routes.find(r => r.id === expense.routeId) : null;
              
              return (
                <div key={expense.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        {getExpenseIcon(expense.type)}
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">{expense.description}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getExpenseTypeColor(expense.type)}`}>
                            {getExpenseTypeText(expense.type)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Veículo: {vehicle?.plate || 'N/A'}</span>
                          {route && <span>Rota: #{route.id.slice(-6)}</span>}
                          <span>{new Date(expense.date).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          R$ {expense.amount.toLocaleString('pt-BR')}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingExpense ? 'Editar Gasto' : 'Novo Gasto'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Gasto
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="fuel">Combustível</option>
                  <option value="toll">Pedágio</option>
                  <option value="maintenance">Manutenção</option>
                  <option value="rental">Aluguel de Veículo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Veículo
                </label>
                <select
                  required
                  value={formData.vehicleId}
                  onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione um veículo</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.model} - {vehicle.plate}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rota (opcional)
                </label>
                <select
                  value={formData.routeId}
                  onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Gasto não vinculado a rota</option>
                  {routes.map(route => (
                    <option key={route.id} value={route.id}>
                      Rota #{route.id.slice(-6)} - {route.driver.name} - {new Date(route.date).toLocaleDateString('pt-BR')}
                    </option>
                  ))}
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
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva o gasto..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comprovante (opcional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <label className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-700">
                      Clique para anexar comprovante
                    </span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">PDF ou imagem até 5MB</p>
                </div>
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
                  {editingExpense ? 'Atualizar' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};