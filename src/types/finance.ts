export type TransactionType = 'income' | 'expense' | 'transfer';

export type PaymentMethod = 'efectivo' | 'transferencia' | 'tarjeta' | 'cheque';

export type IncomeCategory =
  | 'venta_pos'
  | 'abono_cxc'
  | 'anticipo_cliente'
  | 'inyeccion_capital'
  | 'venta_activos'
  | 'otros_ingresos';

export type ExpenseCategory =
  | 'proveedores_mercancia'
  | 'nomina_sueldos'
  | 'renta_inmueble'
  | 'servicios_luz_agua_net'
  | 'fletes_logistica'
  | 'mantenimiento_maquinaria'
  | 'combustible_vehiculos'
  | 'impuestos_derechos'
  | 'papeleria_consumibles'
  | 'otros_gastos';

export type FinanceCategory = IncomeCategory | ExpenseCategory | 'traspaso_cuentas';

export interface CashAccount {
  id: string;
  name: string;
  type: 'cash' | 'bank';
  balance: number;
  accountNumber?: string;
  currency: 'MXN';
}

export interface FinancialTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  category: FinanceCategory | string;
  accountId: string; // Cuenta de origen o donde ingresa
  destinationAccountId?: string; // Solo para transferencias
  concept: string;
  reference?: string;
  beneficiary?: string; // Cliente, Proveedor o Empleado
  paymentMethod: PaymentMethod;
  status: 'completado' | 'pendiente' | 'cancelado';
  notes?: string;
  isSystemGenerated?: boolean;
}

export interface CashDenominations {
  b1000: number;
  b500: number;
  b200: number;
  b100: number;
  b50: number;
  b20: number;
  coins: number;
}

export interface CashClose {
  id: string;
  date: string;
  openedAt: string;
  closedAt?: string;
  initialCash: number;
  cashSales: number;
  cashIncomes: number;
  cashExpenses: number;
  expectedCash: number;
  countedCash: number;
  difference: number;
  responsible: string;
  status: 'abierta' | 'cerrada';
  denominations?: CashDenominations;
  notes?: string;
}
