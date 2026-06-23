import type { Supplier, PurchaseHistory } from '../types/supplier';

export const mockSuppliers: Supplier[] = [
  {
    id: 'SUP-001',
    name: 'Mangueras y Conexiones Globales S.A.',
    contactName: 'Carlos Ruiz',
    phone: '81-1234-5678',
    email: 'ventas@mcglobales.com',
    leadTimeDays: 3
  },
  {
    id: 'SUP-002',
    name: 'Sellos Hidráulicos del Norte',
    contactName: 'Ana Martínez',
    phone: '871-987-6543',
    email: 'pedidos@sellosnorte.mx',
    leadTimeDays: 5
  },
  {
    id: 'SUP-003',
    name: 'Lubricantes Industriales',
    contactName: 'Luis Fernández',
    phone: '55-5555-4444',
    email: 'contacto@lubind.com',
    leadTimeDays: 2
  }
];

export const mockPurchaseHistory: PurchaseHistory[] = [
  {
    id: 'PUR-1001',
    productId: 'MANG-A-001',
    supplierId: 'SUP-001',
    date: '2026-05-20',
    quantity: 100,
    unitCost: 85.00,
    invoiceNumber: 'FAC-88902'
  },
  {
    id: 'PUR-1002',
    productId: 'CONEX-J-050',
    supplierId: 'SUP-001',
    date: '2026-04-15',
    quantity: 50,
    unitCost: 21.00, // Costo anterior era más barato
    invoiceNumber: 'FAC-88210'
  },
  {
    id: 'PUR-1003',
    productId: 'SELLO-K-100',
    supplierId: 'SUP-002',
    date: '2026-05-01',
    quantity: 10,
    unitCost: 180.00,
    invoiceNumber: 'F-901'
  }
];
