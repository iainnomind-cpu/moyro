export type ClientType = 'contado' | 'credito';
export type PaymentBehavior = 'excelente' | 'bueno' | 'con_retrasos' | 'critico';

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  rfc?: string;
  type: ClientType;
  
  // Credit specific fields
  creditLimit?: number;
  creditDays?: number;
  currentBalance?: number;
  
  // Stats
  totalPurchases: number;
  lastPurchaseDate?: string;
  paymentBehavior: PaymentBehavior;
  
  createdAt: string;
}

export interface Transaction {
  id: string;
  clientId: string;
  date: string;
  type: 'compra' | 'pago' | 'cotizacion';
  amount: number;
  status: 'completado' | 'pendiente' | 'vencido';
  description: string;
}
