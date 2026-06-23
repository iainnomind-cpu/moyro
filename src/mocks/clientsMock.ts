import type { Client, Transaction } from '../types/client';

export const mockClients: Client[] = [
  {
    id: 'CLI-001',
    name: 'Industrias Peñoles S.A. de C.V.',
    phone: '871-123-4567',
    email: 'compras@penoles.mx',
    rfc: 'IPE900101XYZ',
    type: 'credito',
    creditLimit: 150000,
    creditDays: 30,
    currentBalance: 45200.50,
    totalPurchases: 1250000,
    lastPurchaseDate: '2026-06-01',
    paymentBehavior: 'excelente',
    createdAt: '2023-01-15'
  },
  {
    id: 'CLI-002',
    name: 'Taller Mecánico El Tuercas',
    phone: '871-987-6543',
    email: 'contacto@eltuercas.com',
    type: 'contado',
    currentBalance: 0,
    totalPurchases: 15400,
    lastPurchaseDate: '2026-06-05',
    paymentBehavior: 'bueno',
    createdAt: '2024-03-20'
  },
  {
    id: 'CLI-003',
    name: 'Constructora del Norte',
    phone: '871-555-0000',
    email: 'pagos@conorte.com',
    rfc: 'CNO150402ABC',
    type: 'credito',
    creditLimit: 80000,
    creditDays: 15,
    currentBalance: 82500, // Sobre límite
    totalPurchases: 340000,
    lastPurchaseDate: '2026-05-15',
    paymentBehavior: 'con_retrasos',
    createdAt: '2023-11-10'
  },
  {
    id: 'CLI-004',
    name: 'Juan Pérez (Público General)',
    phone: '871-333-2211',
    email: 'juanp@gmail.com',
    type: 'contado',
    currentBalance: 0,
    totalPurchases: 2500,
    lastPurchaseDate: '2026-05-28',
    paymentBehavior: 'bueno',
    createdAt: '2025-01-05'
  }
];

export const mockTransactions: Transaction[] = [
  {
    id: 'TRX-1001',
    clientId: 'CLI-001',
    date: '2026-06-01',
    type: 'compra',
    amount: 15200.50,
    status: 'pendiente',
    description: 'Mangueras de alta presión y conexiones R2'
  },
  {
    id: 'TRX-1002',
    clientId: 'CLI-001',
    date: '2026-05-10',
    type: 'pago',
    amount: 30000,
    status: 'completado',
    description: 'Abono a factura F-8452'
  },
  {
    id: 'TRX-1003',
    clientId: 'CLI-003',
    date: '2026-05-15',
    type: 'compra',
    amount: 45000,
    status: 'vencido',
    description: 'Kits de sellos para excavadora'
  }
];
