import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Receivable, Payment, ReceivableStatus } from '../types/receivable';
import { mockReceivables } from '../mocks/receivableMock';
import { useClients } from './ClientContext';

interface ReceivableContextType {
  receivables: Receivable[];
  registerSaleDebt: (clientId: string, amount: number, quoteId?: string, anticipo?: number) => void;
  registerPayment: (receivableId: string, amount: number, method: Payment['method'], reference?: string) => void;
  calculateStatus: (dueDate: string, balance: number) => ReceivableStatus;
  applyInterest: (receivableId: string, interestAmount: number) => void;
}

const ReceivableContext = createContext<ReceivableContextType | undefined>(undefined);

export const ReceivableProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [receivables, setReceivables] = useState<Receivable[]>(mockReceivables);
  const { clients } = useClients();

  // Función auxiliar para determinar el estado de la deuda en base a la fecha de hoy
  const calculateStatus = (dueDate: string, balance: number): ReceivableStatus => {
    if (balance <= 0) return 'pagado';
    
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'vencido';
    if (diffDays <= 3) return 'por_vencer';
    return 'vigente';
  };

  // Recalcular estados dinámicamente
  useEffect(() => {
    setReceivables(prev => prev.map(r => ({
      ...r,
      status: calculateStatus(r.dueDate, r.balance)
    })));
  }, []);

  const registerSaleDebt = (clientId: string, amount: number, quoteId?: string, anticipo: number = 0) => {
    const client = clients.find(c => c.id === clientId);
    if (!client || client.type !== 'credito') return;

    const daysTerms = client.creditTermsDays || 30;
    
    const issueDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + daysTerms);

    const initialPayments: Payment[] = [];
    if (anticipo > 0) {
      initialPayments.push({
        id: `PAY-${Math.floor(Math.random() * 100000)}`,
        date: issueDate.toISOString().split('T')[0],
        amount: anticipo,
        method: 'efectivo',
        reference: 'Anticipo inicial POS'
      });
    }

    const newBalance = Math.max(0, amount - anticipo);

    const newDebt: Receivable = {
      id: `CXC-${Math.floor(Math.random() * 100000)}`,
      clientId,
      issueDate: issueDate.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      originalAmount: amount,
      balance: newBalance,
      status: calculateStatus(dueDate.toISOString().split('T')[0], newBalance),
      payments: initialPayments,
      interestApplied: 0,
      relatedQuoteId: quoteId
    };

    setReceivables(prev => [...prev, newDebt]);
  };

  const registerPayment = (receivableId: string, amount: number, method: Payment['method'], reference?: string) => {
    setReceivables(prev => prev.map(r => {
      if (r.id !== receivableId) return r;
      
      const newPayment: Payment = {
        id: `PAY-${Math.floor(Math.random() * 100000)}`,
        date: new Date().toISOString().split('T')[0],
        amount,
        method,
        reference
      };
      
      const newBalance = Math.max(0, r.balance - amount);
      
      return {
        ...r,
        balance: newBalance,
        status: calculateStatus(r.dueDate, newBalance),
        payments: [...r.payments, newPayment]
      };
    }));
  };

  const applyInterest = (receivableId: string, interestAmount: number) => {
    setReceivables(prev => prev.map(r => {
      if (r.id !== receivableId) return r;
      return {
        ...r,
        balance: r.balance + interestAmount,
        interestApplied: (r.interestApplied || 0) + interestAmount
      };
    }));
  };

  return (
    <ReceivableContext.Provider value={{ 
      receivables, 
      registerSaleDebt, 
      registerPayment, 
      calculateStatus,
      applyInterest
    }}>
      {children}
    </ReceivableContext.Provider>
  );
};

export const useReceivables = () => {
  const context = useContext(ReceivableContext);
  if (context === undefined) {
    throw new Error('useReceivables must be used within a ReceivableProvider');
  }
  return context;
};
