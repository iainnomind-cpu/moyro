import type { Receivable } from '../types/receivable';

export const mockReceivables: Receivable[] = [
  {
    id: 'CXC-1001',
    clientId: 'CLI-001', // Industrias Peñoles
    issueDate: '2026-05-10',
    dueDate: '2026-06-10', // 30 days
    originalAmount: 45200.50,
    balance: 45200.50,
    status: 'vigente', // assuming today is early June
    payments: [],
    interestApplied: 0,
    relatedQuoteId: 'COT-001'
  },
  {
    id: 'CXC-1002',
    clientId: 'CLI-003', // Constructora del Norte
    issueDate: '2026-04-15',
    dueDate: '2026-04-30', // 15 days
    originalAmount: 35000,
    balance: 15000,
    status: 'vencido', // Way overdue
    payments: [
      {
        id: 'PAY-001',
        date: '2026-05-05',
        amount: 20000,
        method: 'transferencia',
        reference: 'SPEI-845920'
      }
    ],
    interestApplied: 1500, // They have been charged 1500 in interest
    relatedQuoteId: 'COT-005'
  },
  {
    id: 'CXC-1003',
    clientId: 'CLI-001', 
    issueDate: '2026-05-01',
    dueDate: '2026-06-01', // Due very soon or just passed
    originalAmount: 10000,
    balance: 10000,
    status: 'por_vencer',
    payments: [],
    interestApplied: 0,
    relatedQuoteId: 'COT-012'
  }
];
