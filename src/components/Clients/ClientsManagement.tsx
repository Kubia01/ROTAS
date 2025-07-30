import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Users, MapPin, Phone, Mail, Upload, Building2 } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { Client } from '../../types';

export const ClientsManagement: React.FC = () => {
  const { clients, addClient, updateClient, deleteClient, importClients } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    alternativeAddress: '',
    city: '',
    phone: '',
    email: '',
    isTransporter: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingClient) {
      updateClient(editingClient.id, formData);
    } else {
      addClient(formData);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      alternativeAddress: '',
      city: '',
      phone: '',
      email: '',
      isTransporter: false,
    });
    setEditingClient(null);
    setIsModalOpen(false);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      address: client.address,
      alternativeAddress: client.alternativeAddress || '',
      city: client.city,
      phone: client.phone,
      email: client.email || '',
      isTransporter: client.isTransporter,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (clientId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      deleteClient(clientId);
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          alert('Arquivo deve conter pelo menos um cabeçalho e uma linha de dados');
          return;
        }
        
        // Processar cabeçalho
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const newClients: Omit<Client, 'id' | 'createdAt'>[] = [];
        
        // Validar cabeçalhos obrigatórios
        const requiredHeaders = ['nome', 'endereco', 'cidade', 'telefone'];
        const missingHeaders = requiredHeaders.filter(header => 
          !headers.some(h => h.includes(header))
        );
        
        if (missingHeaders.length > 0) {
          alert(`Cabeçalhos obrigatórios não encontrados: ${missingHeaders.join(', ')}`);
          return;
        }
        
        for (let i = 1; i < lines.length; i++) {
          const data = lines[i].split(',').map(d => d.trim().replace(/"/g, ''));
          
          if (data.length >= 4 && data[0] && data[1] && data[2] && data[3]) {
            // Mapear colunas dinamicamente
            const nameIndex = headers.findIndex(h => h.includes('nome'));
            const addressIndex = headers.findIndex(h => h.includes('endereco') || h.includes('endereço'));
            const altAddressIndex = headers.findIndex(h => h.includes('endereco_alternativo') || h.includes('endereço_alternativo'));
            const cityIndex = headers.findIndex(h => h.includes('cidade'));
            const phoneIndex = headers.findIndex(h => h.includes('telefone'));
            const emailIndex = headers.findIndex(h => h.includes('email'));
            const transporterIndex = headers.findIndex(h => h.includes('transportadora'));
            
            newClients.push({
              name: data[nameIndex] || data[0],
              address: data[addressIndex] || data[1],
              alternativeAddress: altAddressIndex >= 0 ? data[altAddressIndex] : '',
              city: data[cityIndex] || data[2],
              phone: data[phoneIndex] || data[3],
              email: data[emailIndex] || '',
              isTransporter: data[transporterIndex]?.toLowerCase() === 'true' || 
                           data[transporterIndex]?.toLowerCase() === 'sim' || false,
            });
          }
        }
        
        if (newClients.length > 0) {
          importClients(newClients);
          alert(`✅ ${newClients.length} cliente(s) importado(s) com sucesso!\n\nDetalhes:\n${newClients.map(c => `• ${c.name} - ${c.city}`).slice(0, 5).join('\n')}${newClients.length > 5 ? `\n... e mais ${newClients.length - 5} clientes` : ''}`);
        } else {
          alert('❌ Nenhum cliente válido encontrado no arquivo');
        }
      } catch (error) {
        console.error('Erro na importação:', error);
        alert('❌ Erro ao processar arquivo. Verifique se:\n• O arquivo está em formato CSV\n• As colunas estão separadas por vírgula\n• Contém os campos obrigatórios: Nome, Endereço, Cidade, Telefone');
      }
      
      setShowImportModal(false);
    };
    
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const template = `Nome,Endereço,Endereço_Alternativo,Cidade,Telefone,Email,É_Transportadora
Empresa ABC Ltda,"Rua das Flores, 123 - Centro","Rua Alternativa, 456",São Paulo,(11) 1111-1111,contato@empresaabc.com,false
Transportadora XYZ,"Av. Industrial, 456 - Zona Norte",,São Paulo,(11) 2222-2222,operacao@transportadoraxyz.com,true
Loja DEF,"Rua Comercial, 789 - Vila Madalena",,São Paulo,(11) 3333-3333,vendas@lojadef.com,false
Cliente GHI,"Alameda Santos, 321 - Jardins","Alameda Alternativa, 654",São Paulo,(11) 4444-4444,,false`;
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modelo-importacao-clientes.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Clientes</h2>
          <p className="text-gray-600">Gerencie os clientes e transportadoras cadastradas</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Importar
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Cliente
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <div key={client.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  client.isTransporter ? 'bg-orange-100' : 'bg-blue-100'
                }`}>
                  {client.isTransporter ? (
                    <Building2 className="w-6 h-6 text-orange-600" />
                  ) : (
                    <Users className="w-6 h-6 text-blue-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{client.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    client.isTransporter 
                      ? 'bg-orange-100 text-orange-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {client.isTransporter ? 'Transportadora' : 'Cliente Final'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(client)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(client.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-900">{client.address}</p>
                  {client.alternativeAddress && (
                    <p className="text-gray-500 text-xs">Alt: {client.alternativeAddress}</p>
                  )}
                  <p className="text-gray-500">{client.city}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{client.phone}</span>
              </div>
              
              {client.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 truncate">{client.email}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço Alternativo (opcional)
                </label>
                <textarea
                  rows={2}
                  value={formData.alternativeAddress}
                  onChange={(e) => setFormData({ ...formData, alternativeAddress: e.target.value })}
                  placeholder="Endereço alternativo para entrega..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cidade
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (opcional)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isTransporter"
                  checked={formData.isTransporter}
                  onChange={(e) => setFormData({ ...formData, isTransporter: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isTransporter" className="text-sm text-gray-700">
                  É uma transportadora
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
                  {editingClient ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Importar Clientes</h3>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-sm text-gray-600">
                <p className="mb-3">
                  📋 <strong>Como importar clientes:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 mb-4">
                  <li>Arquivo deve estar em formato <strong>CSV</strong></li>
                  <li>Colunas obrigatórias: <strong>Nome, Endereço, Cidade, Telefone</strong></li>
                  <li>Colunas opcionais: <strong>Email, É Transportadora</strong></li>
                  <li>Use vírgula (,) para separar as colunas</li>
                  <li>Para transportadoras, use "true" ou "sim" na última coluna</li>
                </ul>
                
                <button
                  onClick={downloadTemplate}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 underline font-medium"
                >
                  📥 Baixar modelo de planilha (CSV)
                </button>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-2">Arraste o arquivo aqui ou</p>
                <label className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-700">
                    Clique para selecionar arquivo CSV
                  </span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileImport}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">Apenas arquivos CSV são aceitos</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};