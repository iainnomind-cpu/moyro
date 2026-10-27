import type { CashAccount, FinancialTransaction, CashClose } from '../types/finance';

export const mockCashAccounts: CashAccount[] = [
  {
    id: 'caja_mostrador',
    name: 'Caja Mostrador / Chica',
    type: 'cash',
    balance: 4850,
    currency: 'MXN'
  },
  {
    id: 'banco_bbva',
    name: 'BBVA Bancomer (Principal)',
    type: 'bank',
    balance: 168450,
    accountNumber: '•••• 0192',
    currency: 'MXN'
  },
  {
    id: 'banco_banorte',
    name: 'Banorte Operativo',
    type: 'bank',
    balance: 52100,
    accountNumber: '•••• 4451',
    currency: 'MXN'
  }
];

export const mockFinancialTransactions: FinancialTransaction[] = [
  {
    id: 'TXN-1001',
    type: 'income',
    amount: 14500,
    date: '2026-06-22',
    time: '10:15',
    category: 'abono_cxc',
    accountId: 'banco_bbva',
    concept: 'Liquidación de Factura A-104 - Tornos del Norte',
    reference: 'SPEI-884920',
    beneficiary: 'Tornos del Norte S.A.',
    paymentMethod: 'transferencia',
    status: 'completado',
    notes: 'Pago recibido vía SPEI BBVA'
  },
  {
    id: 'TXN-1002',
    type: 'income',
    amount: 3250,
    date: '2026-06-22',
    time: '11:40',
    category: 'venta_pos',
    accountId: 'caja_mostrador',
    concept: 'Venta de Mostrador - Insertos de carburo y brocas',
    reference: 'TICK-802',
    beneficiary: 'Cliente Mostrador General',
    paymentMethod: 'efectivo',
    status: 'completado'
  },
  {
    id: 'TXN-1003',
    type: 'expense',
    amount: 6800,
    date: '2026-06-21',
    time: '16:00',
    category: 'nomina_sueldos',
    accountId: 'banco_bbva',
    concept: 'Nómina semanal operador torno CNC',
    reference: 'NOM-SEM-25',
    beneficiary: 'Carlos M. Mendoza (Operador)',
    paymentMethod: 'transferencia',
    status: 'completado'
  },
  {
    id: 'TXN-1004',
    type: 'expense',
    amount: 1850,
    date: '2026-06-21',
    time: '12:20',
    category: 'fletes_logistica',
    accountId: 'caja_mostrador',
    concept: 'Flete Express Monterrey - Envío barra de acero grado herramienta',
    reference: 'GUIA-9921',
    beneficiary: 'Transportes Castores',
    paymentMethod: 'efectivo',
    status: 'completado'
  },
  {
    id: 'TXN-1005',
    type: 'expense',
    amount: 12400,
    date: '2026-06-20',
    time: '14:10',
    category: 'proveedores_mercancia',
    accountId: 'banco_banorte',
    concept: 'Compra de lote de electrodos y consumibles de soldadura',
    reference: 'FAC-PROV-7812',
    beneficiary: 'Aceros y Soldaduras Industriales SA',
    paymentMethod: 'transferencia',
    status: 'completado'
  },
  {
    id: 'TXN-1006',
    type: 'income',
    amount: 8500,
    date: '2026-06-19',
    time: '09:30',
    category: 'anticipo_cliente',
    accountId: 'banco_bbva',
    concept: 'Anticipo 50% fabricación piñón helicoidal sobre medida',
    reference: 'SPEI-710294',
    beneficiary: 'Metalmecánica Monterrey',
    paymentMethod: 'transferencia',
    status: 'completado'
  },
  {
    id: 'TXN-1007',
    type: 'expense',
    amount: 4200,
    date: '2026-06-18',
    time: '11:00',
    category: 'servicios_luz_agua_net',
    accountId: 'banco_bbva',
    concept: 'Pago CFE Taller Mecánico - Periodo Mayo-Junio',
    reference: 'CFE-REC-44102',
    beneficiary: 'Comisión Federal de Electricidad',
    paymentMethod: 'transferencia',
    status: 'completado'
  },
  {
    id: 'TXN-1008',
    type: 'expense',
    amount: 950,
    date: '2026-06-18',
    time: '15:45',
    category: 'mantenimiento_maquinaria',
    accountId: 'caja_mostrador',
    concept: 'Aceite hidráulico ISO 68 y filtros para prensa',
    reference: 'NOT-REF-114',
    beneficiary: 'Refaccionaria Industrial del Centro',
    paymentMethod: 'efectivo',
    status: 'completado'
  },
  {
    id: 'TXN-1009',
    type: 'transfer',
    amount: 5000,
    date: '2026-06-17',
    time: '17:30',
    category: 'traspaso_cuentas',
    accountId: 'caja_mostrador',
    destinationAccountId: 'banco_bbva',
    concept: 'Depósito de efectivo excedente de caja a cuenta bancaria',
    reference: 'DEP-BBVA-01',
    paymentMethod: 'efectivo',
    status: 'completado'
  }
];

export const mockInitialCashClose: CashClose = {
  id: 'CORTE-20260623',
  date: new Date().toISOString().split('T')[0],
  openedAt: '08:30',
  initialCash: 2500,
  cashSales: 3250,
  cashIncomes: 0,
  cashExpenses: 900,
  expectedCash: 4850,
  countedCash: 4850,
  difference: 0,
  responsible: 'Myriam Moyro',
  status: 'abierta',
  denominations: {
    b1000: 1,
    b500: 4,
    b200: 6,
    b100: 4,
    b50: 3,
    b20: 3,
    coins: 40
  },
  notes: 'Caja operando normalmente. Fondo de caja cubierto.'
};

export const mockHistoricalCashCloses: CashClose[] = [
  {
    id: 'CORTE-20260622',
    date: '2026-06-22',
    openedAt: '08:30',
    closedAt: '18:15',
    initialCash: 2000,
    cashSales: 4850,
    cashIncomes: 0,
    cashExpenses: 1850,
    expectedCash: 5000,
    countedCash: 5000,
    difference: 0,
    responsible: 'Myriam Moyro',
    status: 'cerrada',
    notes: 'Cierre exacto. Depósito de $5,000 realizado a BBVA.'
  },
  {
    id: 'CORTE-20260621',
    date: '2026-06-21',
    openedAt: '08:30',
    closedAt: '18:00',
    initialCash: 2000,
    cashSales: 3100,
    cashIncomes: 0,
    cashExpenses: 600,
    expectedCash: 4500,
    countedCash: 4500,
    difference: 0,
    responsible: 'Myriam Moyro',
    status: 'cerrada',
    notes: 'Cuadrado sin novedades.'
  }
];
