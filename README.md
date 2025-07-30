# 🚛 Sistema TWS para Motoristas

Sistema completo de gestão de entregas e logística para empresas de transporte com funcionalidades avançadas para transportadoras e controle detalhado de entregas.

## 🚀 Como Começar a Usar

### 1. **Acesso ao Sistema**
- Abra o navegador e acesse o sistema
- **Credenciais de Administrador Master**: `admin@tws.com` / `admin123`
- **Credenciais de Motorista 1**: `motorista1@tws.com` / `driver123`
- **Credenciais de Motorista 2**: `motorista2@tws.com` / `driver123`

### 2. **Configuração Inicial (Admin Master)**

#### **Passo 1: Cadastrar Motoristas**
1. Acesse **"Motoristas"** no menu lateral
2. Clique em **"Novo Motorista"**
3. Preencha: Nome, CNH, Telefone, Email
4. Associe um veículo (se já cadastrado)

#### **Passo 2: Cadastrar Veículos**
1. Acesse **"Veículos"** no menu lateral
2. Clique em **"Novo Veículo"**
3. Preencha: Placa, Modelo, Ano, KM atual
4. Configure revisões por quilometragem:
   - **KM da última revisão**
   - **KM da próxima revisão**
   - **Intervalo de revisão** (ex: 10.000 km)

#### **Passo 3: Importar/Cadastrar Clientes e Transportadoras**
1. Acesse **"Clientes"** no menu lateral
2. **Opção A - Importar planilha:**
   - Clique em **"Importar"**
   - Baixe o modelo CSV atualizado
   - Preencha com seus dados (clientes e transportadoras)
   - Faça upload do arquivo
3. **Opção B - Cadastro manual:**
   - Clique em **"Novo Cliente"**
   - Preencha os dados
   - Marque "É uma transportadora" se aplicável
   - Adicione endereço alternativo se necessário

### 3. **Formato para Importação de Clientes/Transportadoras**

#### **Colunas Obrigatórias:**
- **Nome**: Nome da empresa/cliente
- **Endereço**: Endereço principal
- **Cidade**: Cidade
- **Telefone**: Telefone de contato

#### **Colunas Opcionais:**
- **Endereço_Alternativo**: Endereço alternativo para entrega
- **Email**: E-mail de contato
- **É_Transportadora**: true/false ou sim/não

#### **Exemplo de CSV:**
```csv
Nome,Endereço,Endereço_Alternativo,Cidade,Telefone,Email,É_Transportadora
Empresa ABC Ltda,"Rua das Flores, 123 - Centro","Rua Alternativa, 456",São Paulo,(11) 1111-1111,contato@empresaabc.com,false
Transportadora XYZ,"Av. Industrial, 456 - Zona Norte",,São Paulo,(11) 2222-2222,operacao@transportadoraxyz.com,true
```

### 4. **Criando Rotas de Entrega Avançadas**

#### **Planejamento de Rota**
1. Acesse **"Rotas"** no menu lateral
2. Clique em **"Nova Rota"**
3. Selecione: Motorista, Veículo, Data
4. Adicione as paradas com opções avançadas:
   - **Cliente**: Cliente final
   - **Transportadora**: Consignatária (opcional)
   - **Endereço de entrega**: Se diferente do cliente
   - **Horário previsto**
   - **Observações**

#### **Otimização e Divisão Inteligente**
- **Otimizar Rota**: Organiza paradas por prioridade
- **Dividir Rotas**: Distribui entregas entre motoristas
- Opções disponíveis:
  - ✅ Priorizar transportadoras primeiro
  - ✅ Agrupar por cidade
  - ✅ Dividir entre motoristas disponíveis (funciona com qualquer quantidade)

### 5. **Execução das Entregas (Motorista)**

#### **Interface Específica do Motorista**
- Cada motorista vê apenas suas próprias rotas
- Interface simplificada focada na próxima entrega
- Organização por lote (próxima entrega automática)

#### **Iniciando a Rota**
1. Login como motorista
2. Acesse **"Minhas Rotas"**
3. Clique na rota do dia
4. Preencha dados diários:
   - Horário de saída
   - KM inicial
5. Clique em **"Iniciar Rota"**

#### **Registrando Entregas Detalhadas**
1. Para cada parada, clique em **"Entregar"**
2. Preencha dados obrigatórios:
   - **Horário de entrada no cliente**
   - **Horário de saída do cliente**
   - **Nome completo do recebedor**
   - **CPF do recebedor**
3. Dados opcionais:
   - E-mail do recebedor
   - Setor/Departamento
   - Observações da entrega
   - Upload de fotos
   - Assinatura digital do cliente
4. Confirme a entrega
5. Sistema avança automaticamente para próxima entrega

#### **Registro de Gastos pelo Motorista**
- Durante a rota, clique em **"Registrar Gasto"**
- Tipos: Combustível, Pedágio, Manutenção, Aluguel
- Vincule automaticamente à rota atual
- Adicione valor e descrição

#### **Finalizando a Rota**
1. Preencha KM final
2. Horário de chegada
3. Clique em **"Finalizar Rota"**

## 📊 Gestão e Controle Avançado

### **Controle de Revisões por KM**
- Sistema baseado em quilometragem, não datas
- Alertas automáticos quando próximo da revisão
- Controle de intervalos personalizáveis
- Status visual: OK, Próxima, Vencida

### **Gastos Operacionais Completos**
1. Acesse **"Gastos"** no menu
2. Registre: Combustível, Pedágio, Manutenção, Aluguel
3. Vincule a rotas específicas ou registre independente
4. Anexe comprovantes
5. Controle por veículo e motorista

### **Relatórios Executivos**
1. Acesse **"Relatórios"** no menu
2. Escolha período: Semanal, Mensal, Semestral, Anual
3. Filtre por motorista específico
4. Métricas disponíveis:
   - Total de entregas e KM
   - Gastos por categoria
   - Desempenho por motorista
   - Custo por KM e por entrega
   - Análise de tendências
5. Exporte dados em JSON

## 👥 **Sistema de Usuários**

### **Administrador Master**
- **Login**: `admin@tws.com` / `admin123`
- **Permissões**: Acesso completo a todas funcionalidades
- Gerencia rotas, motoristas, veículos, clientes
- Visualiza todos os relatórios e dados

### **Motoristas**
- **Motorista 1**: `motorista1@tws.com` / `driver123`
- **Motorista 2**: `motorista2@tws.com` / `driver123`
- **Permissões limitadas**:
  - Visualiza apenas suas próprias rotas
  - Registra entregas e gastos
  - Interface simplificada e focada

## 🏢 **Sistema de Transportadoras**

### **Cadastro e Vinculação**
- Transportadoras são cadastradas como clientes especiais
- Marcação específica "É uma transportadora"
- Podem ser vinculadas como consignatárias nas entregas
- Sistema permite entrega via transportadora mesmo com cliente final diferente

### **Endereços Alternativos**
- Cada cliente pode ter endereço alternativo
- Opção de definir endereço específico por entrega
- Flexibilidade total para diferentes cenários de entrega

## 💾 **Armazenamento de Dados**

### **Situação Atual**
- **Dados temporários**: Armazenados na memória do navegador
- **Persistência**: Dados são perdidos ao recarregar a página
- **Recomendação**: Integração com banco de dados para produção

### **Opções de Banco de Dados**

#### **1. Banco Local (SQLite)**
```python
# Backend Python com SQLite
pip install flask sqlite3 sqlalchemy
```

#### **2. Banco Online (PostgreSQL/MySQL)**
```bash
# Hospedagem em nuvem
- Heroku + PostgreSQL
- AWS RDS
- Google Cloud SQL
```

#### **3. Firebase (Google)**
```bash
# Banco em tempo real
npm install firebase
```

## 🌐 **Conectividade e Uso Offline**

### **Uso Online (Atual)**
- ✅ Interface responsiva para mobile/tablet
- ✅ Funcionalidades completas
- ❌ Requer conexão constante

### **Modo Offline (Implementação Futura)**
Para implementar modo offline:

1. **Service Workers**
```javascript
// Cachear recursos estáticos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('tws-v1').then(cache => {
      return cache.addAll([
        '/',
        '/static/js/bundle.js',
        '/static/css/main.css'
      ]);
    })
  );
});
```

2. **IndexedDB**
```javascript
// Armazenamento local
const request = indexedDB.open('TWS_DB', 1);
```

3. **Sincronização**
```javascript
// Sync quando voltar online
navigator.serviceWorker.ready.then(registration => {
  return registration.sync.register('background-sync');
});
```

## 🔧 **Instalação para Produção**

### **1. Preparar Ambiente**
```bash
# Clonar projeto
git clone [repositorio]
cd sistema-tws

# Instalar dependências
npm install
```

### **2. Configurar Backend**
```python
# app.py (Flask)
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tws.db'
db = SQLAlchemy(app)

# Modelos de dados
class Driver(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    license = db.Column(db.String(20), nullable=False)
    # ... outros campos
```

### **3. Deploy**
```bash
# Build para produção
npm run build

# Deploy (exemplo Netlify)
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

## 📱 **Funcionalidades Implementadas**

### ✅ **Sistema Completo**
- Sistema de autenticação com 3 níveis de usuário
- Gestão completa de motoristas e veículos
- Cadastro e importação de clientes/transportadoras
- Planejamento inteligente de rotas com otimização
- Divisão automática entre motoristas (qualquer quantidade)
- Sistema avançado de entregas com:
  - Controle de horários de entrada/saída
  - Dados completos do recebedor (nome, CPF, email, setor)
  - Assinatura digital
  - Upload de fotos
  - Vinculação com transportadoras
  - Endereços alternativos
- Controle de gastos operacionais por motorista
- Revisões controladas por quilometragem
- Relatórios executivos detalhados
- Interface responsiva para mobile/tablet
- Organização por lote para motoristas

### 🔄 **Próximos Passos**
- Integração com banco de dados
- Modo offline com sincronização
- Integração GPS (Google Maps/Waze)
- Notificações push
- API para mobile
- Backup automático
- Canvas para assinatura digital
- Geolocalização automática

## 📞 **Suporte e Uso**

### **Como Começar Agora:**
1. Acesse o sistema com as credenciais fornecidas
2. Configure motoristas e veículos
3. Importe clientes usando o modelo CSV
4. Crie rotas com otimização automática
5. Teste entregas com login de motorista

### **Funcionalidades Principais:**
- **Admin**: Controle total, relatórios, configurações
- **Motoristas**: Interface focada, próxima entrega, registro de gastos
- **Transportadoras**: Sistema completo de consignação
- **Revisões**: Controle por KM com alertas automáticos
- **Importação**: CSV flexível com mapeamento automático

---

**Sistema TWS v2.0** - Gestão completa de entregas com transportadoras e controle avançado