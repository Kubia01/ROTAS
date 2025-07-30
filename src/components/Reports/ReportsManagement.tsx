import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar, 
  MapPin, 
  DollarSign,
  Users,
  Car,
  FileText,
  Filter
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useData } from '../../contexts/DataContext';

export const ReportsManagement: React.FC = () => {
  const { routes, expenses, drivers, vehicles } = useData();
  const [selectedPeriod, setSelectedPeriod] = useState<'weekly' | 'monthly' | 'semester' | 'yearly'>('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDriver, setSelectedDriver] = useState('');

  const filteredData = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (selectedPeriod) {
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'semester':
        const semester = Math.floor(now.getMonth() / 6);
        startDate = new Date(now.getFullYear(), semester * 6, 1);
        break;
      case 'yearly':
        startDate = new Date(selectedYear, 0, 1);
        endDate = new Date(selectedYear, 11, 31);
        break;
    }

    const filteredRoutes = routes.filter(route => {
      const routeDate = new Date(route.date);
      const inPeriod = routeDate >= startDate && routeDate <= endDate;
      const matchesDriver = !selectedDriver || route.driverId === selectedDriver;
      return inPeriod && matchesDriver;
    });

    const filteredExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });

    return { routes: filteredRoutes, expenses: filteredExpenses, startDate, endDate };
  }, [routes, expenses, selectedPeriod, selectedYear, selectedDriver]);

  const reportStats = useMemo(() => {
    const { routes: filteredRoutes, expenses: filteredExpenses } = filteredData;

    const totalDeliveries = filteredRoutes.reduce((sum, route) => 
      sum + route.stops.filter(stop => stop.status === 'completed').length, 0
    );

    const totalKm = filteredRoutes.reduce((sum, route) => sum + (route.totalKm || 0), 0);
    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const completedRoutes = filteredRoutes.filter(route => route.status === 'completed').length;

    const driverStats = drivers.map(driver => {
      const driverRoutes = filteredRoutes.filter(route => route.driverId === driver.id);
      const driverDeliveries = driverRoutes.reduce((sum, route) => 
        sum + route.stops.filter(stop => stop.status === 'completed').length, 0
      );
      const driverKm = driverRoutes.reduce((sum, route) => sum + (route.totalKm || 0), 0);
      const driverExpenses = filteredExpenses
        .filter(expense => {
          const route = routes.find(r => r.id === expense.routeId);
          return route && route.driverId === driver.id;
        })
        .reduce((sum, expense) => sum + expense.amount, 0);

      return {
        driver,
        routes: driverRoutes.length,
        deliveries: driverDeliveries,
        km: driverKm,
        expenses: driverExpenses,
      };
    }).filter(stat => stat.routes > 0);

    const expensesByType = filteredExpenses.reduce((acc, expense) => {
      acc[expense.type] = (acc[expense.type] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalDeliveries,
      totalKm,
      totalExpenses,
      completedRoutes,
      driverStats,
      expensesByType,
    };
  }, [filteredData, drivers, routes]);

  const getPeriodText = () => {
    switch (selectedPeriod) {
      case 'weekly':
        return 'Última Semana';
      case 'monthly':
        return 'Este Mês';
      case 'semester':
        return 'Este Semestre';
      case 'yearly':
        return `Ano ${selectedYear}`;
    }
  };

  const exportReport = () => {
    const { routes: filteredRoutes } = filteredData;
    
    // Aba 1: ENTREGA
    const deliveryData = [];
    filteredRoutes.forEach(route => {
      route.stops.forEach(stop => {
        if (stop.status === 'completed') {
          const waitTime = stop.entryTime && stop.exitTime 
            ? Math.round((stop.exitTime.getTime() - stop.entryTime.getTime()) / (1000 * 60)) 
            : 0;
          
          deliveryData.push({
            'NOTA FISCAL': stop.invoiceNumber || '',
            'CÓDIGO DO CLIENTE': stop.clientCode || '',
            'NOME DO CLIENTE': stop.client.name,
            'TRANSPORTADORA': stop.transporter?.name || '',
            'CIDADE': stop.client.city,
            'UF': stop.client.state || '',
            'HORÁRIO DE CHEGADA NO CLIENTE': stop.entryTime ? stop.entryTime.toLocaleTimeString('pt-BR') : '',
            'HORÁRIO DE SAÍDA NO CLIENTE': stop.exitTime ? stop.exitTime.toLocaleTimeString('pt-BR') : '',
            'TEMPO DE ESPERA NO CLIENTE': `${waitTime} min`,
            'DATA': new Date(route.date).toLocaleDateString('pt-BR')
          });
        }
      });
    });

    // Aba 2: INFORMAÇÕES DA VAN
    const vanData = [];
    const routesByDate = filteredRoutes.reduce((acc, route) => {
      const dateKey = new Date(route.date).toLocaleDateString('pt-BR');
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(route);
      return acc;
    }, {} as Record<string, typeof filteredRoutes>);

    Object.entries(routesByDate).forEach(([date, routesForDate]) => {
      routesForDate.forEach(route => {
        if (route.status === 'completed') {
          const totalStops = route.stops.length;
          const completedStops = route.stops.filter(s => s.status === 'completed').length;
          const completionPercentage = totalStops > 0 ? Math.round((completedStops / totalStops) * 100) : 0;
          const uncompletedDeliveries = totalStops - completedStops;
          
          vanData.push({
            'DATA': date,
            'HORÁRIO DE SAÍDA': route.startTime ? route.startTime.toLocaleTimeString('pt-BR') : '',
            'HORÁRIO DE CHEGADA': route.endTime ? route.endTime.toLocaleTimeString('pt-BR') : '',
            'KM DE SAÍDA': route.startKm || 0,
            'KM DE CHEGADA': route.endKm || 0,
            'KM RODADO (KM)': route.totalKm || 0,
            'ENTREGAS NÃO REALIZADAS': uncompletedDeliveries,
            'PORCENTAGEM DE CONCLUSÃO': `${completionPercentage}%`,
            'NUMERO DE ENTREGAS': totalStops
          });
        }
      });
    });

    // Aba 3: ENTREGAS COM MAIS DE 40 MINUTOS DE ESPERA
    const longWaitDeliveries = deliveryData.filter(delivery => {
      const waitTimeStr = delivery['TEMPO DE ESPERA NO CLIENTE'];
      const waitTime = parseInt(waitTimeStr.replace(' min', ''));
      return waitTime > 40;
    });

    // Criar workbook
    const wb = XLSX.utils.book_new();
    
    // Adicionar as três abas
    const ws1 = XLSX.utils.json_to_sheet(deliveryData);
    const ws2 = XLSX.utils.json_to_sheet(vanData);
    const ws3 = XLSX.utils.json_to_sheet(longWaitDeliveries);
    
    XLSX.utils.book_append_sheet(wb, ws1, 'ENTREGA');
    XLSX.utils.book_append_sheet(wb, ws2, 'INFORMAÇÕES DA VAN');
    XLSX.utils.book_append_sheet(wb, ws3, 'ENTREGAS > 40min');
    
    // Salvar arquivo
    const fileName = `relatorio-entregas-${getPeriodText().replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Relatórios e Análises</h2>
          <p className="text-gray-600">Acompanhe o desempenho operacional e financeiro</p>
        </div>
        <button
          onClick={exportReport}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4" />
                      Exportar Excel
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <h3 className="font-medium text-gray-900">Filtros do Relatório</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="weekly">Última Semana</option>
              <option value="monthly">Este Mês</option>
              <option value="semester">Este Semestre</option>
              <option value="yearly">Anual</option>
            </select>
          </div>

          {selectedPeriod === 'yearly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motorista</label>
            <select
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos os motoristas</option>
              {drivers.map(driver => (
                <option key={driver.id} value={driver.id}>{driver.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              <p><strong>Período:</strong> {getPeriodText()}</p>
              <p><strong>Data:</strong> {filteredData.startDate.toLocaleDateString('pt-BR')} - {filteredData.endDate.toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total de Entregas</p>
              <p className="text-2xl font-bold text-gray-900">{reportStats.totalDeliveries}</p>
            </div>
            <div className="bg-blue-500 rounded-lg p-3">
              <MapPin className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">KM Percorridos</p>
              <p className="text-2xl font-bold text-gray-900">{reportStats.totalKm.toLocaleString('pt-BR')}</p>
            </div>
            <div className="bg-green-500 rounded-lg p-3">
              <Car className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total de Gastos</p>
              <p className="text-2xl font-bold text-gray-900">R$ {reportStats.totalExpenses.toLocaleString('pt-BR')}</p>
            </div>
            <div className="bg-red-500 rounded-lg p-3">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Rotas Concluídas</p>
              <p className="text-2xl font-bold text-gray-900">{reportStats.completedRoutes}</p>
            </div>
            <div className="bg-purple-500 rounded-lg p-3">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Desempenho por Motorista */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">Desempenho por Motorista</h3>
          </div>

          {reportStats.driverStats.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nenhum dado encontrado para o período</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reportStats.driverStats.map((stat) => (
                <div key={stat.driver.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{stat.driver.name}</h4>
                    <span className="text-sm text-gray-500">{stat.routes} rotas</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Entregas</p>
                      <p className="font-medium text-blue-600">{stat.deliveries}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">KM</p>
                      <p className="font-medium text-green-600">{stat.km.toLocaleString('pt-BR')}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Gastos</p>
                      <p className="font-medium text-red-600">R$ {stat.expenses.toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Gastos por Categoria */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">Gastos por Categoria</h3>
          </div>

          {Object.keys(reportStats.expensesByType).length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nenhum gasto registrado no período</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(reportStats.expensesByType).map(([type, amount]) => {
                const percentage = reportStats.totalExpenses > 0 
                  ? (amount / reportStats.totalExpenses) * 100 
                  : 0;
                
                const typeText = {
                  fuel: 'Combustível',
                  toll: 'Pedágio',
                  maintenance: 'Manutenção',
                  rental: 'Aluguel'
                }[type] || type;

                const typeColor = {
                  fuel: 'bg-blue-500',
                  toll: 'bg-yellow-500',
                  maintenance: 'bg-red-500',
                  rental: 'bg-purple-500'
                }[type] || 'bg-gray-500';

                return (
                  <div key={type} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">{typeText}</span>
                      <span className="text-sm text-gray-600">
                        R$ {amount.toLocaleString('pt-BR')} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${typeColor} h-2 rounded-full transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Análise de Tendências */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Análise de Tendências</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {reportStats.totalDeliveries > 0 ? (reportStats.totalKm / reportStats.totalDeliveries).toFixed(1) : '0'}
            </div>
            <p className="text-sm text-blue-800">KM por Entrega</p>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {reportStats.totalKm > 0 ? (reportStats.totalExpenses / reportStats.totalKm).toFixed(2) : '0'}
            </div>
            <p className="text-sm text-green-800">Custo por KM (R$)</p>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {reportStats.totalDeliveries > 0 ? (reportStats.totalExpenses / reportStats.totalDeliveries).toFixed(2) : '0'}
            </div>
            <p className="text-sm text-purple-800">Custo por Entrega (R$)</p>
          </div>
        </div>
      </div>
    </div>
  );
};