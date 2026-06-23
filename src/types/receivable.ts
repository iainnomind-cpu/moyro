export type ReceivableStatus = 'vigente' | 'por_vencer' | 'vencido' | 'pagado';

export interface Payment {
  id: string;
  date: string;
  amount: number;
  method: 'efectivo' | 'transferencia' | 'cheque';
  reference?: string;
}

export interface Receivable {
  id: string; // ID of the debt/invoice
  clientId: string;
  issueDate: string;
  dueDate: string;
  originalAmount: number;
  balance: number;
  status: ReceivableStatus;
  payments: Payment[];
  interestApplied?: number;
  relatedQuoteId?: string; // Vínculo con cotización o ticket
}
