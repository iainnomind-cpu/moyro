import React, { createContext, useContext, useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import type {
  CashAccount,
  FinancialTransaction,
  CashClose,
  CashDenominations,
  PaymentMethod
} from '../types/finance';
import {
  mockCashAccounts,
  mockFinancialTransactions,
  mockInitialCashClose,
  mockHistoricalCashCloses
} from '../mocks/financeMock';

interface FinanceContextType {
  accounts: CashAccount[];
  transactions: FinancialTransaction[];
  currentCashClose: CashClose;
  closeHistory: CashClose[];
  
  // Acciones
  addTransaction: (data: Omit<FinancialTransaction, 'id' | 'status'>) => void;
  registerPOSSaleIncome: (amount: number, method: PaymentMethod, ticketRef: string, clientName?: string) => void;
  registerReceivablePaymentIncome: (amount: number, method: PaymentMethod, clientName: string, ref?: string) => void;
  registerPurchaseExpense: (amount: number, supplierName: string, invoiceRef?: string) => void;
  transferFunds: (fromId: string, toId: string, amount: number, concept: string, reference?: string) => void;
  updateCashCloseDenominations: (denominations: CashDenominations, notes?: string) => void;
  closeCashDay: (countedCash: number, responsible: string, notes?: string) => CashClose;
  openNewCashDay: (initialCash: number, responsible: string) => void;

  // KPIs Financieros
  totalLiquidity: number;
  cashBalance: number;
  bankBalance: number;
  totalIncomes: number;
  totalExpenses: number;
  netCashFlow: number;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<CashAccount[]>(mockCashAccounts);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(mockFinancialTransactions);
  const [currentCashClose, setCurrentCashClose] = useState<CashClose>(mockInitialCashClose);
  const [closeHistory, setCloseHistory] = useState<CashClose[]>(mockHistoricalCashCloses);

  // Totales de Liquidez
  const totalLiquidity = useMemo(() => accounts.reduce((acc, a) => acc + a.balance, 0), [accounts]);
  const cashBalance = useMemo(() => accounts.filter(a => a.type === 'cash').reduce((acc, a) => acc + a.balance, 0), [accounts]);
  const bankBalance = useMemo(() => accounts.filter(a => a.type === 'bank').reduce((acc, a) => acc + a.balance, 0), [accounts]);

  // Totales de Transacciones
  const totalIncomes = useMemo(() => 
    transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0), 
    [transactions]
  );
  const totalExpenses = useMemo(() => 
    transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0), 
    [transactions]
  );
  const netCashFlow = totalIncomes - totalExpenses;

  // Agregar Transacción General
  const addTransaction = (data: Omit<FinancialTransaction, 'id' | 'status'>) => {
    const newTxn: FinancialTransaction = {
      ...data,
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'completado',
      time: data.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Actualizar balances de cuentas
    setAccounts(prevAccounts =>
      prevAccounts.map(acc => {
        if (data.type === 'income' && acc.id === data.accountId) {
          return { ...acc, balance: acc.balance + data.amount };
        }
        if (data.type === 'expense' && acc.id === data.accountId) {
          return { ...acc, balance: acc.balance - data.amount };
        }
        if (data.type === 'transfer') {
          if (acc.id === data.accountId) {
            return { ...acc, balance: acc.balance - data.amount };
          }
          if (acc.id === data.destinationAccountId) {
            return { ...acc, balance: acc.balance + data.amount };
          }
        }
        return acc;
      })
    );

    // Si es movimiento de caja chica en efectivo, impactar corte activo
    if (data.accountId === 'caja_mostrador' && data.paymentMethod === 'efectivo') {
      setCurrentCashClose(prev => {
        const cashIn = data.type === 'income' ? prev.cashIncomes + data.amount : prev.cashIncomes;
        const cashOut = data.type === 'expense' ? prev.cashExpenses + data.amount : prev.cashExpenses;
        const expected = prev.initialCash + prev.cashSales + cashIn - cashOut;
        return {
          ...prev,
          cashIncomes: cashIn,
          cashExpenses: cashOut,
          expectedCash: expected,
          difference: prev.countedCash - expected
        };
      });
    }

    setTransactions(prev => [newTxn, ...prev]);
  };

  // Registrar Ingreso por Venta POS de Contado o Anticipo
  const registerPOSSaleIncome = (amount: number, method: PaymentMethod, ticketRef: string, clientName?: string) => {
    const targetAccount = method === 'efectivo' ? 'caja_mostrador' : 'banco_bbva';
    
    addTransaction({
      type: 'income',
      amount,
      date: new Date().toISOString().split('T')[0],
      category: 'venta_pos',
      accountId: targetAccount,
      concept: `Venta Mostrador ${ticketRef}${clientName ? ` - ${clientName}` : ''}`,
      reference: ticketRef,
      beneficiary: clientName || 'Venta Mostrador',
      paymentMethod: method,
      isSystemGenerated: true
    });

    // Sumar a ventas en efectivo del corte si fue en efectivo
    if (method === 'efectivo') {
      setCurrentCashClose(prev => {
        const updatedSales = prev.cashSales + amount;
        const expected = prev.initialCash + updatedSales + prev.cashIncomes - prev.cashExpenses;
        return {
          ...prev,
          cashSales: updatedSales,
          expectedCash: expected,
          difference: prev.countedCash - expected
        };
      });
    }
  };

  // Registrar Ingreso por Abono de Cuenta por Cobrar
  const registerReceivablePaymentIncome = (amount: number, method: PaymentMethod, clientName: string, ref?: string) => {
    const targetAccount = method === 'efectivo' ? 'caja_mostrador' : 'banco_bbva';

    addTransaction({
      type: 'income',
      amount,
      date: new Date().toISOString().split('T')[0],
      category: 'abono_cxc',
      accountId: targetAccount,
      concept: `Abono a Cartera CxC - ${clientName}`,
      reference: ref || 'ABONO-CXC',
      beneficiary: clientName,
      paymentMethod: method,
      isSystemGenerated: true
    });
  };

  // Registrar Egreso por Compra a Proveedor
  const registerPurchaseExpense = (amount: number, supplierName: string, invoiceRef?: string) => {
    addTransaction({
      type: 'expense',
      amount,
      date: new Date().toISOString().split('T')[0],
      category: 'proveedores_mercancia',
      accountId: 'banco_bbva',
      concept: `Pago a Proveedor: ${supplierName}`,
      reference: invoiceRef || 'ORD-COMPRA',
      beneficiary: supplierName,
      paymentMethod: 'transferencia',
      isSystemGenerated: true
    });
  };

  // Transferencia interna entre cuentas
  const transferFunds = (fromId: string, toId: string, amount: number, concept: string, reference?: string) => {
    addTransaction({
      type: 'transfer',
      amount,
      date: new Date().toISOString().split('T')[0],
      category: 'traspaso_cuentas',
      accountId: fromId,
      destinationAccountId: toId,
      concept: concept || 'Traspaso interno de fondos',
      reference: reference || 'TRASPASO-INT',
      paymentMethod: fromId === 'caja_mostrador' ? 'efectivo' : 'transferencia',
      isSystemGenerated: false
    });
  };

  // Actualizar desglose de monedas y billetes en el Arqueo Activo
  const updateCashCloseDenominations = (denominations: CashDenominations, notes?: string) => {
    const calculatedCount =
      denominations.b1000 * 1000 +
      denominations.b500 * 500 +
      denominations.b200 * 200 +
      denominations.b100 * 100 +
      denominations.b50 * 50 +
      denominations.b20 * 20 +
      denominations.coins;

    setCurrentCashClose(prev => ({
      ...prev,
      countedCash: calculatedCount,
      difference: calculatedCount - prev.expectedCash,
      denominations,
      notes: notes !== undefined ? notes : prev.notes
    }));
  };

  // Cerrar Caja del Día (Arqueo Oficial)
  const closeCashDay = (countedCash: number, responsible: string, notes?: string): CashClose => {
    const finalClose: CashClose = {
      ...currentCashClose,
      closedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      countedCash,
      difference: countedCash - currentCashClose.expectedCash,
      responsible,
      notes: notes || currentCashClose.notes,
      status: 'cerrada'
    };

    setCloseHistory(prev => [finalClose, ...prev]);
    setCurrentCashClose(finalClose);
    return finalClose;
  };

  // Abrir Nuevo Día de Caja
  const openNewCashDay = (initialCash: number, responsible: string) => {
    const today = new Date().toISOString().split('T')[0];
    const newClose: CashClose = {
      id: `ARQ-${new Date().getTime().toString().slice(-8)}`,
      date: today,
      openedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      initialCash,
      cashSales: 0,
      cashIncomes: 0,
      cashExpenses: 0,
      expectedCash: initialCash,
      countedCash: initialCash,
      difference: 0,
      responsible,
      status: 'abierta',
      denominations: {
        b1000: 0,
        b500: Math.floor(initialCash / 500),
        b200: 0,
        b100: 0,
        b50: 0,
        b20: 0,
        coins: initialCash % 500
      },
      notes: 'Apertura de turno'
    };

    setCurrentCashClose(newClose);

    // Ajustar saldo de caja chica al nuevo fondo
    setAccounts(prev =>
      prev.map(acc => (acc.id === 'caja_mostrador' ? { ...acc, balance: initialCash } : acc))
    );
  };

  return (
    <FinanceContext.Provider
      value={{
        accounts,
        transactions,
        currentCashClose,
        closeHistory,
        addTransaction,
        registerPOSSaleIncome,
        registerReceivablePaymentIncome,
        registerPurchaseExpense,
        transferFunds,
        updateCashCloseDenominations,
        closeCashDay,
        openNewCashDay,
        totalLiquidity,
        cashBalance,
        bankBalance,
        totalIncomes,
        totalExpenses,
        netCashFlow
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
