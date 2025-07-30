import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('tws_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulação de autenticação - substituir por chamada real à API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email === 'admin@tws.com' && password === 'admin123') {
      const adminUser: User = {
        id: '1',
        name: 'Administrador',
        email: 'admin@tws.com',
        role: 'admin',
        createdAt: new Date(),
      };
      setUser(adminUser);
      localStorage.setItem('tws_user', JSON.stringify(adminUser));
      setIsLoading(false);
      return true;
    } else if (email === 'motorista1@tws.com' && password === 'driver123') {
      const driverUser: User = {
        id: '2',
        name: 'João Silva - Motorista 1',
        email: 'motorista1@tws.com',
        role: 'driver',
        createdAt: new Date(),
      };
      setUser(driverUser);
      localStorage.setItem('tws_user', JSON.stringify(driverUser));
      setIsLoading(false);
      return true;
    } else if (email === 'motorista2@tws.com' && password === 'driver123') {
      const driverUser: User = {
        id: '3',
        name: 'Maria Santos - Motorista 2',
        email: 'motorista2@tws.com',
        role: 'driver',
        createdAt: new Date(),
      };
      setUser(driverUser);
      localStorage.setItem('tws_user', JSON.stringify(driverUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tws_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};