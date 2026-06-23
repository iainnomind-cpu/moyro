import type { Product } from '../types/inventory';

export const mockProducts: Product[] = [
  {
    id: 'MANG-A-001',
    name: 'Manguera Hidráulica R2AT 1/2"',
    category: 'Mangueras de Alta Presión',
    description: 'Manguera hidráulica de 2 mallas de acero para alta presión. Rollo de 50m.',
    price: 120.50, // per meter
    cost: 85.00,
    stock: 250, // meters
    minStock: 50,
    location: {
      anaquel: 'A1',
      fila: '2',
      caja_cajon: 'Rollo'
    },
    barcode: '7501234567890',
    supplierId: 'SUP-001',
    lastRestockDate: '2026-05-20'
  },
  {
    id: 'CONEX-J-050',
    name: 'Conexión JIC Hembra Giratoria 1/2"',
    category: 'Conexiones y Adaptadores',
    description: 'Conexión recta JIC 37° hembra giratoria de acero al carbón.',
    price: 45.00,
    cost: 22.50,
    stock: 12, // Critical stock!
    minStock: 30,
    location: {
      anaquel: 'B3',
      fila: '1',
      caja_cajon: 'Cajón 5'
    },
    barcode: '7509876543210'
  },
  {
    id: 'SELLO-K-100',
    name: 'Kit de Sellos para Gato Hidráulico 10T',
    category: 'Kits de Sellos',
    description: 'Kit completo de reparación (O-rings, sellos de pistón, rascadores).',
    price: 350.00,
    cost: 180.00,
    stock: 5,
    minStock: 5, // At limit
    location: {
      anaquel: 'C1',
      fila: '4',
      caja_cajon: 'Caja 2'
    }
  },
  {
    id: 'COMP-A-010',
    name: 'Aceite Compresor Sintético ISO 46',
    category: 'Consumibles',
    description: 'Galón de aceite sintético para compresores de tornillo.',
    price: 850.00,
    cost: 520.00,
    stock: 40,
    minStock: 10,
    location: {
      anaquel: 'A5',
      fila: '1',
      caja_cajon: 'Piso'
    }
  }
];
