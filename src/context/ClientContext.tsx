import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Client, Transaction } from '../types/client';
import { mockClients, mockTransactions } from '../mocks/clientsMock';

interface ClientContextType {
  clients: Client[];
  transactions: Transaction[];
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'currentBalance' | 'totalPurchases'>) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  getClientTransactions: (clientId: string) => Transaction[];
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [transactions] = useState<Transaction[]>(mockTransactions);

  const addClient = (newClientData: Omit<Client, 'id' | 'createdAt' | 'currentBalance' | 'totalPurchases'>) => {
    const newClient: Client = {
      ...newClientData,
      id: `CLI-${(clients.length + 1).toString().padStart(3, '0')}`,
      createdAt: new Date().toISOString().split('T')[0],
      currentBalance: 0,
      totalPurchases: 0,
    };
    setClients(prev => [...prev, newClient]);
  };

  const updateClient = (id: string, updatedData: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updatedData } : c));
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
  };

  const getClientTransactions = (clientId: string) => {
    return transactions.filter(t => t.clientId === clientId);
  };

  return (
    <ClientContext.Provider value={{ clients, transactions, addClient, updateClient, deleteClient, getClientTransactions }}>
      {children}
    </ClientContext.Provider>
  );
};

export const useClients = () => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClients must be used within a ClientProvider');
  }
  return context;
};
