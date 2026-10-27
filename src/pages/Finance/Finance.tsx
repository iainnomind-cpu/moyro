import React, { useState, useMemo, useRef } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useReceivables } from '../../context/ReceivableContext';
import { usePurchases } from '../../context/PurchaseContext';
import { useReactToPrint } from 'react-to-print';
import { CashCloseDocument } from './CashCloseDocument';
import type { PaymentMethod } from '../../types/finance';
import {
  DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  Wallet, Landmark, Plus, ArrowLeftRight, Calculator,
  Search, Printer, CheckCircle, AlertTriangle,
  Receipt, BarChart3, Activity, ShieldCheck
} from 'lucide-react';

export const Finance: React.FC = () => {
  const {
    accounts,
    transactions,
    currentCashClose,
    closeHistory,
    addTransaction,
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
  } = useFinance();

  const { receivables } = useReceivables();
  const { purchaseHistory } = usePurchases();

  // Tab activa
  const [activeTab, setActiveTab] = useState<'flow' | 'cash_close' | 'pnl' | 'liquidity'>('flow');

  // Filtros de Flujo de Caja
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<'hoy' | 'semana' | 'mes' | 'todo'>('mes');
  const [typeFilter, setTypeFilter] = useState<'todos' | 'income' | 'expense' | 'transfer'>('todos');
  const [accountFilter, setAccountFilter] = useState<string>('todos');

  // Modales
  const [isNewTxnModalOpen, setIsNewTxnModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isOpenCashModalOpen, setIsOpenCashModalOpen] = useState(false);

  // Formulario Nuevo Movimiento
  const [newTxnType, setNewTxnType] = useState<'income' | 'expense'>('expense');
  const [newTxnAmount, setNewTxnAmount] = useState('');
  const [newTxnAccount, setNewTxnAccount] = useState('caja_mostrador');
  const [newTxnCategory, setNewTxnCategory] = useState('nomina_sueldos');
  const [newTxnConcept, setNewTxnConcept] = useState('');
  const [newTxnRef, setNewTxnRef] = useState('');
  const [newTxnBeneficiary, setNewTxnBeneficiary] = useState('');
  const [newTxnMethod, setNewTxnMethod] = useState<PaymentMethod>('efectivo');

  // Formulario Traspaso
  const [transferFrom, setTransferFrom] = useState('caja_mostrador');
  const [transferTo, setTransferTo] = useState('banco_bbva');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferConcept, setTransferConcept] = useState('Depósito de efectivo a cuenta bancaria');

  // Formulario Apertura de Caja
  const [openCashAmount, setOpenCashAmount] = useState('2500');
  const [cashResponsible, setCashResponsible] = useState('Myriam Moyro');

  // Impresión de corte de caja
  const cashClosePrintRef = useRef<HTMLDivElement>(null);
  const handlePrintCashClose = useReactToPrint({
    contentRef: cashClosePrintRef,
    documentTitle: `Corte_Caja_${currentCashClose.id}`
  });

  const formatMXN = (val: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);

  // Filtrado de transacciones
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Filtro fecha
      if (dateRange !== 'todo') {
        const todayStr = new Date().toISOString().split('T')[0];
        if (dateRange === 'hoy' && t.date !== todayStr) return false;
        if (dateRange === 'semana') {
          const tTime = new Date(t.date).getTime();
          const sevenDaysAgo = new Date().getTime() - 7 * 24 * 60 * 60 * 1000;
          if (tTime < sevenDaysAgo) return false;
        }
        if (dateRange === 'mes') {
          const currentMonth = todayStr.substring(0, 7);
          if (!t.date.startsWith(currentMonth)) return false;
        }
      }

      // Filtro tipo
      if (typeFilter !== 'todos' && t.type !== typeFilter) return false;
      // Filtro cuenta
      if (accountFilter !== 'todos') {
        if (t.accountId !== accountFilter && t.destinationAccountId !== accountFilter) return false;
      }
      // Filtro texto
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchConcept = t.concept.toLowerCase().includes(query);
        const matchBeneficiary = t.beneficiary?.toLowerCase().includes(query) || false;
        const matchRef = t.reference?.toLowerCase().includes(query) || false;
        if (!matchConcept && !matchBeneficiary && !matchRef) return false;
      }
      return true;
    });
  }, [transactions, dateRange, typeFilter, accountFilter, searchQuery]);

  // Manejador para crear nuevo movimiento
  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(newTxnAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Ingresa un monto válido.');
      return;
    }
    if (!newTxnConcept.trim()) {
      alert('Ingresa el concepto del movimiento.');
      return;
    }

    addTransaction({
      type: newTxnType,
      amount: amountNum,
      date: new Date().toISOString().split('T')[0],
      category: newTxnCategory,
      accountId: newTxnAccount,
      concept: newTxnConcept,
      reference: newTxnRef.trim() || undefined,
      beneficiary: newTxnBeneficiary.trim() || undefined,
      paymentMethod: newTxnMethod
    });

    setIsNewTxnModalOpen(false);
    setNewTxnAmount('');
    setNewTxnConcept('');
    setNewTxnRef('');
    setNewTxnBeneficiary('');
  };

  // Manejador para traspaso
  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(transferAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Ingresa un monto válido.');
      return;
    }
    if (transferFrom === transferTo) {
      alert('La cuenta de origen y destino deben ser diferentes.');
      return;
    }

    const sourceAcc = accounts.find(a => a.id === transferFrom);
    if (sourceAcc && sourceAcc.balance < amountNum) {
      if (!confirm(`La cuenta de origen solo tiene ${formatMXN(sourceAcc.balance)}. ¿Deseas continuar?`)) {
        return;
      }
    }

    transferFunds(transferFrom, transferTo, amountNum, transferConcept);
    setIsTransferModalOpen(false);
    setTransferAmount('');
  };

  // Categoría etiqueta legible
  const getCategoryLabel = (category: string) => {
    const map: Record<string, string> = {
      venta_pos: 'Venta de Mostrador',
      abono_cxc: 'Abono Cartera CxC',
      anticipo_cliente: 'Anticipo Cliente',
      inyeccion_capital: 'Aportación de Capital',
      venta_activos: 'Venta de Chatarra/Activo',
      otros_ingresos: 'Otros Ingresos',
      proveedores_mercancia: 'Mercancía / Insumos',
      nomina_sueldos: 'Nómina & Sueldos',
      renta_inmueble: 'Renta Taller / Local',
      servicios_luz_agua_net: 'Servicios (CFE / Agua)',
      fletes_logistica: 'Fletes & Logística',
      mantenimiento_maquinaria: 'Mtto. Maquinaria & Herram.',
      combustible_vehiculos: 'Combustible',
      impuestos_derechos: 'Impuestos & Derechos',
      papeleria_consumibles: 'Consumibles Taller',
      otros_gastos: 'Otros Gastos',
      traspaso_cuentas: 'Traspaso Interno'
    };
    return map[category] || category;
  };

  // Cálculos para Estado de Resultados (P&L)
  const pnlData = useMemo(() => {
    const incomes = transactions.filter(t => t.type === 'income');
    const expenses = transactions.filter(t => t.type === 'expense');

    const totalVentas = incomes
      .filter(t => t.category === 'venta_pos' || t.category === 'abono_cxc' || t.category === 'anticipo_cliente')
      .reduce((s, t) => s + t.amount, 0);

    const otrosIngresos = incomes
      .filter(t => t.category !== 'venta_pos' && t.category !== 'abono_cxc' && t.category !== 'anticipo_cliente')
      .reduce((s, t) => s + t.amount, 0);

    const cogs = expenses
      .filter(t => t.category === 'proveedores_mercancia')
      .reduce((s, t) => s + t.amount, 0);

    const grossProfit = (totalVentas + otrosIngresos) - cogs;
    const grossMargin = (totalVentas + otrosIngresos) > 0 ? (grossProfit / (totalVentas + otrosIngresos)) * 100 : 0;

    const opExpenses = expenses.filter(t => t.category !== 'proveedores_mercancia');
    const totalOpExpenses = opExpenses.reduce((s, t) => s + t.amount, 0);

    const netOperatingProfit = grossProfit - totalOpExpenses;
    const netMargin = (totalVentas + otrosIngresos) > 0 ? (netOperatingProfit / (totalVentas + otrosIngresos)) * 100 : 0;

    // Desglose de gastos por categoría
    const expensesByCategory: Record<string, number> = {};
    opExpenses.forEach(e => {
      const cat = e.category;
      expensesByCategory[cat] = (expensesByCategory[cat] || 0) + e.amount;
    });

    return {
      totalVentas,
      otrosIngresos,
      cogs,
      grossProfit,
      grossMargin,
      totalOpExpenses,
      netOperatingProfit,
      netMargin,
      expensesByCategory
    };
  }, [transactions]);

  // Cálculos para Radar de Liquidez
  const liquidityRadar = useMemo(() => {
    const totalCxC = receivables.reduce((sum, r) => sum + r.balance, 0);
    const vencidoCxC = receivables.filter(r => r.status === 'vencido').reduce((sum, r) => sum + r.balance, 0);
    const vigenteCxC = totalCxC - vencidoCxC;

    // Estimación compras/cuentas por pagar a proveedores
    const totalPurchasesCost = purchaseHistory.reduce((sum, p) => sum + p.quantity * p.unitCost, 0);
    // Asumimos un aproximado de cuentas por pagar operativas vigentes
    const cxpEstimada = Math.round(totalPurchasesCost * 0.45);

    const liquidezInmediata = totalLiquidity;
    const liquidezProyectada30Dias = totalLiquidity + vigenteCxC - cxpEstimada;

    return {
      totalCxC,
      vencidoCxC,
      vigenteCxC,
      cxpEstimada,
      liquidezInmediata,
      liquidezProyectada30Dias
    };
  }, [receivables, purchaseHistory, totalLiquidity]);

  return (
    <div className="finance-page" style={{ padding: '0 0 2rem 0' }}>
      {/* Componente oculto para impresión de corte de caja */}
      <div style={{ display: 'none' }}>
        <CashCloseDocument ref={cashClosePrintRef} cashClose={currentCashClose} />
      </div>

      {/* Encabezado Principal */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Módulo de Finanzas & Flujo de Caja
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Control de tesorería, cortes de caja diarios, gastos operativos y salud financiera industrial.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <ArrowLeftRight size={16} />
            <span>Traspaso de Fondos</span>
          </button>

          <button
            onClick={() => {
              setNewTxnType('expense');
              setIsNewTxnModalOpen(true);
            }}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Plus size={16} />
            <span>Nuevo Movimiento</span>
          </button>
        </div>
      </div>

      {/* Navegación por Pestañas */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border)',
          marginBottom: '1.5rem',
          overflowX: 'auto',
          paddingBottom: '0.25rem'
        }}
      >
        <button
          onClick={() => setActiveTab('flow')}
          style={{
            padding: '0.65rem 1.15rem',
            borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
            border: 'none',
            background: activeTab === 'flow' ? 'var(--bg-surface)' : 'transparent',
            borderBottom: activeTab === 'flow' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'flow' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'flow' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
            transition: 'var(--transition-fast)'
          }}
        >
          <DollarSign size={17} />
          <span>Flujo de Caja & Movimientos</span>
        </button>

        <button
          onClick={() => setActiveTab('cash_close')}
          style={{
            padding: '0.65rem 1.15rem',
            borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
            border: 'none',
            background: activeTab === 'cash_close' ? 'var(--bg-surface)' : 'transparent',
            borderBottom: activeTab === 'cash_close' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'cash_close' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'cash_close' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
            transition: 'var(--transition-fast)'
          }}
        >
          <Calculator size={17} />
          <span>Corte de Caja Diario</span>
          {currentCashClose.status === 'abierta' && (
            <span
              style={{
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '10px',
                background: 'var(--success-light)',
                color: 'var(--success)',
                fontWeight: 700
              }}
            >
              Abierta
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('pnl')}
          style={{
            padding: '0.65rem 1.15rem',
            borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
            border: 'none',
            background: activeTab === 'pnl' ? 'var(--bg-surface)' : 'transparent',
            borderBottom: activeTab === 'pnl' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'pnl' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'pnl' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
            transition: 'var(--transition-fast)'
          }}
        >
          <BarChart3 size={17} />
          <span>Estado de Resultados (P&L)</span>
        </button>

        <button
          onClick={() => setActiveTab('liquidity')}
          style={{
            padding: '0.65rem 1.15rem',
            borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
            border: 'none',
            background: activeTab === 'liquidity' ? 'var(--bg-surface)' : 'transparent',
            borderBottom: activeTab === 'liquidity' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'liquidity' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'liquidity' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
            transition: 'var(--transition-fast)'
          }}
        >
          <Activity size={17} />
          <span>Radar de Liquidez (CxC vs CxP)</span>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          TAB 1: FLUJO DE CAJA & MOVIMIENTOS
          ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'flow' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Métricas Principales de Tesorería */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem'
            }}
          >
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  LIQUIDEZ TOTAL DISPONIBLE
                </span>
                <div
                  style={{
                    padding: '8px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)'
                  }}
                >
                  <Wallet size={20} />
                </div>
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
                {formatMXN(totalLiquidity)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {formatMXN(cashBalance)} en Efectivo · {formatMXN(bankBalance)} en Bancos
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  INGRESOS REGISTRADOS
                </span>
                <div
                  style={{
                    padding: '8px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--success-light)',
                    color: 'var(--success)'
                  }}
                >
                  <TrendingUp size={20} />
                </div>
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.5rem' }}>
                +{formatMXN(totalIncomes)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Ventas de mostrador + Abonos CxC recibidos
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  EGRESOS Y GASTOS
                </span>
                <div
                  style={{
                    padding: '8px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--danger-light)',
                    color: 'var(--danger)'
                  }}
                >
                  <TrendingDown size={20} />
                </div>
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--danger)', marginTop: '0.5rem' }}>
                -{formatMXN(totalExpenses)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Compras, nómina, fletes y servicios de taller
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  FLUJO NETO (BALANCE)
                </span>
                <div
                  style={{
                    padding: '8px',
                    borderRadius: 'var(--radius-md)',
                    background: netCashFlow >= 0 ? 'var(--primary-light)' : 'var(--warning-light)',
                    color: netCashFlow >= 0 ? 'var(--primary)' : 'var(--warning)'
                  }}
                >
                  <DollarSign size={20} />
                </div>
              </div>
              <div
                style={{
                  fontSize: '1.6rem',
                  fontWeight: 800,
                  color: netCashFlow >= 0 ? 'var(--primary)' : 'var(--warning)',
                  marginTop: '0.5rem'
                }}
              >
                {netCashFlow >= 0 ? `+${formatMXN(netCashFlow)}` : formatMXN(netCashFlow)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {netCashFlow >= 0 ? 'Superávit operativo saludable' : 'Déficit temporal en periodo'}
              </div>
            </div>
          </div>

          {/* Cuentas de Tesorería */}
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              Cuentas de Tesorería & Fondos
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1rem'
              }}
            >
              {accounts.map(acc => (
                <div
                  key={acc.id}
                  className="card"
                  style={{
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: '1px solid var(--border)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {acc.type === 'cash' ? (
                          <Wallet size={18} color="var(--primary)" />
                        ) : (
                          <Landmark size={18} color="var(--accent)" />
                        )}
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                          {acc.name}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          background: acc.type === 'cash' ? 'var(--primary-light)' : 'var(--accent-light)',
                          color: acc.type === 'cash' ? 'var(--primary)' : 'var(--accent)'
                        }}
                      >
                        {acc.type === 'cash' ? 'Efectivo' : 'Bancos'}
                      </span>
                    </div>

                    {acc.accountNumber && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Cuenta: {acc.accountNumber}
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Saldo Disponible</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {formatMXN(acc.balance)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabla de Movimientos y Filtros */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '1.25rem'
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Libro de Movimientos de Caja y Bancos
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Mostrando {filteredTransactions.length} transacciones registradas
                </span>
              </div>

              {/* Controles de Filtro */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative' }}>
                  <Search
                    size={16}
                    color="var(--text-muted)"
                    style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="text"
                    placeholder="Buscar concepto o ref..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="input"
                    style={{ paddingLeft: '32px', width: '200px', height: '36px', fontSize: '0.85rem' }}
                  />
                </div>

                <select
                  value={dateRange}
                  onChange={e => setDateRange(e.target.value as any)}
                  className="input"
                  style={{ height: '36px', fontSize: '0.85rem' }}
                >
                  <option value="mes">Este Mes</option>
                  <option value="semana">Últimos 7 Días</option>
                  <option value="hoy">Hoy</option>
                  <option value="todo">Todo el Periodo</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value as any)}
                  className="input"
                  style={{ height: '36px', fontSize: '0.85rem' }}
                >
                  <option value="todos">Todos los Tipos</option>
                  <option value="income">Solo Ingresos (+)</option>
                  <option value="expense">Solo Egresos (-)</option>
                  <option value="transfer">Traspasos</option>
                </select>

                <select
                  value={accountFilter}
                  onChange={e => setAccountFilter(e.target.value)}
                  className="input"
                  style={{ height: '36px', fontSize: '0.85rem' }}
                >
                  <option value="todos">Todas las Cuentas</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tabla */}
            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%', fontSize: '0.88rem' }}>
                <thead>
                  <tr>
                    <th>Fecha / Hora</th>
                    <th>Tipo</th>
                    <th>Concepto & Beneficiario</th>
                    <th>Categoría</th>
                    <th>Cuenta</th>
                    <th>Método / Ref</th>
                    <th style={{ textAlign: 'right' }}>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No se encontraron movimientos con los filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map(txn => {
                      const isIncome = txn.type === 'income';
                      const isExpense = txn.type === 'expense';
                      const accObj = accounts.find(a => a.id === txn.accountId);
                      const destAccObj = accounts.find(a => a.id === txn.destinationAccountId);

                      return (
                        <tr key={txn.id}>
                          <td>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{txn.date}</div>
                            {txn.time && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{txn.time} hrs</div>}
                          </td>
                          <td>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                fontSize: '11px',
                                fontWeight: 700,
                                padding: '3px 8px',
                                borderRadius: '12px',
                                background: isIncome
                                  ? 'var(--success-light)'
                                  : isExpense
                                  ? 'var(--danger-light)'
                                  : 'var(--primary-light)',
                                color: isIncome
                                  ? 'var(--success)'
                                  : isExpense
                                  ? 'var(--danger)'
                                  : 'var(--primary)'
                              }}
                            >
                              {isIncome && <ArrowDownRight size={12} />}
                              {isExpense && <ArrowUpRight size={12} />}
                              {txn.type === 'transfer' && <ArrowLeftRight size={12} />}
                              {isIncome ? 'Ingreso' : isExpense ? 'Egreso' : 'Traspaso'}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{txn.concept}</div>
                            {txn.beneficiary && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                {txn.beneficiary}
                              </div>
                            )}
                          </td>
                          <td>
                            <span
                              style={{
                                fontSize: '11px',
                                background: 'var(--bg-surface-3)',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                color: 'var(--text-secondary)',
                                fontWeight: 500
                              }}
                            >
                              {getCategoryLabel(txn.category)}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.82rem', fontWeight: 500 }}>
                              {accObj?.name || txn.accountId}
                              {txn.type === 'transfer' && destAccObj && (
                                <span style={{ color: 'var(--primary)', fontWeight: 600 }}> → {destAccObj.name}</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div style={{ textTransform: 'capitalize', fontSize: '0.82rem' }}>{txn.paymentMethod}</div>
                            {txn.reference && (
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                Ref: {txn.reference}
                              </div>
                            )}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <span
                              style={{
                                fontWeight: 800,
                                fontSize: '0.95rem',
                                color: isIncome
                                  ? 'var(--success)'
                                  : isExpense
                                  ? 'var(--danger)'
                                  : 'var(--text-primary)'
                              }}
                            >
                              {isIncome ? `+${formatMXN(txn.amount)}` : isExpense ? `-${formatMXN(txn.amount)}` : formatMXN(txn.amount)}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          TAB 2: CORTE DE CAJA DIARIO
          ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'cash_close' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header de Estado del Corte */}
          <div
            className="card"
            style={{
              padding: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              background: currentCashClose.status === 'abierta' ? 'var(--bg-surface)' : 'var(--bg-surface-2)',
              borderLeft: `4px solid ${currentCashClose.status === 'abierta' ? 'var(--success)' : 'var(--text-muted)'}`
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Corte de Caja Mostrador: {currentCashClose.id}
                </h2>
                <span
                  style={{
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: currentCashClose.status === 'abierta' ? 'var(--success-light)' : 'var(--bg-surface-3)',
                    color: currentCashClose.status === 'abierta' ? 'var(--success)' : 'var(--text-muted)',
                    textTransform: 'uppercase'
                  }}
                >
                  {currentCashClose.status}
                </span>
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.35rem' }}>
                Fecha: <strong>{currentCashClose.date}</strong> · Apertura: <strong>{currentCashClose.openedAt} hrs</strong>
                {currentCashClose.closedAt && <> · Cierre: <strong>{currentCashClose.closedAt} hrs</strong></>} · Responsable: <strong>{currentCashClose.responsible}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => handlePrintCashClose()}
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Printer size={16} />
                <span>Imprimir Ticket de Corte</span>
              </button>

              {currentCashClose.status === 'abierta' ? (
                <button
                  onClick={() => {
                    if (confirm(`¿Confirmas el cierre del turno de caja por un total contado de ${formatMXN(currentCashClose.countedCash)}?`)) {
                      closeCashDay(currentCashClose.countedCash, 'Myriam Moyro');
                      alert('Corte de caja cerrado con éxito.');
                    }
                  }}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--accent)' }}
                >
                  <Receipt size={16} />
                  <span>Cerrar Turno Oficial</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsOpenCashModalOpen(true)}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Plus size={16} />
                  <span>Aperturar Nuevo Turno</span>
                </button>
              )}
            </div>
          </div>

          {/* Panel de Cálculo de Caja */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.5rem'
            }}
          >
            {/* Columna Izquierda: Flujo Matemático */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                1. Balance Contable del Turno
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Fondo Inicial de Apertura:</span>
                  <span style={{ fontWeight: 700 }}>{formatMXN(currentCashClose.initialCash)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--success)' }}>(+) Ventas en Efectivo (POS):</span>
                  <span style={{ fontWeight: 700, color: 'var(--success)' }}>+{formatMXN(currentCashClose.cashSales)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--success)' }}>(+) Otros Ingresos en Efectivo:</span>
                  <span style={{ fontWeight: 700, color: 'var(--success)' }}>+{formatMXN(currentCashClose.cashIncomes)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--danger)' }}>(-) Gastos / Salidas en Efectivo:</span>
                  <span style={{ fontWeight: 700, color: 'var(--danger)' }}>-{formatMXN(currentCashClose.cashExpenses)}</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-3)',
                    marginTop: '0.5rem'
                  }}
                >
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>EFECTIVO TEÓRICO ESPERADO:</span>
                  <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-primary)' }}>
                    {formatMXN(currentCashClose.expectedCash)}
                  </span>
                </div>

                {/* Resultado del Conteo */}
                <div
                  style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    borderColor:
                      currentCashClose.difference === 0
                        ? 'var(--success)'
                        : currentCashClose.difference > 0
                        ? 'var(--info)'
                        : 'var(--danger)',
                    background:
                      currentCashClose.difference === 0
                        ? 'var(--success-light)'
                        : currentCashClose.difference > 0
                        ? 'var(--info-light)'
                        : 'var(--danger-light)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {currentCashClose.difference === 0 ? (
                        <CheckCircle size={20} color="var(--success)" />
                      ) : (
                        <AlertTriangle size={20} color={currentCashClose.difference > 0 ? 'var(--info)' : 'var(--danger)'} />
                      )}
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                        {currentCashClose.difference === 0
                          ? 'Caja Cuadrada Exacta'
                          : currentCashClose.difference > 0
                          ? 'Sobrante en Caja'
                          : 'Faltante en Caja'}
                      </span>
                    </div>

                    <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                      {currentCashClose.difference === 0
                        ? '$0.00'
                        : currentCashClose.difference > 0
                        ? `+${formatMXN(currentCashClose.difference)}`
                        : formatMXN(currentCashClose.difference)}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.8rem', marginTop: '0.4rem', color: 'var(--text-secondary)' }}>
                    Efectivo físico contado: <strong>{formatMXN(currentCashClose.countedCash)}</strong> vs Esperado: <strong>{formatMXN(currentCashClose.expectedCash)}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Calculadora de Billetes y Monedas */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  2. Conteo Físico de Billetes y Monedas
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                  Total: {formatMXN(currentCashClose.countedCash)}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[
                  { label: '$1,000', key: 'b1000', val: 1000 },
                  { label: '$500', key: 'b500', val: 500 },
                  { label: '$200', key: 'b200', val: 200 },
                  { label: '$100', key: 'b100', val: 100 },
                  { label: '$50', key: 'b50', val: 50 },
                  { label: '$20', key: 'b20', val: 20 }
                ].map(den => {
                  const qty = (currentCashClose.denominations as any)?.[den.key] || 0;
                  return (
                    <div
                      key={den.key}
                      style={{
                        padding: '0.5rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-surface-2)',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{den.label}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {formatMXN(qty * den.val)}
                        </div>
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={qty}
                        disabled={currentCashClose.status !== 'abierta'}
                        onChange={e => {
                          const valNum = parseInt(e.target.value) || 0;
                          const currentDen = currentCashClose.denominations || {
                            b1000: 0, b500: 0, b200: 0, b100: 0, b50: 0, b20: 0, coins: 0
                          };
                          updateCashCloseDenominations({
                            ...currentDen,
                            [den.key]: valNum
                          });
                        }}
                        className="input"
                        style={{ width: '64px', height: '32px', textAlign: 'center', fontSize: '0.85rem' }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Monedas */}
              <div
                style={{
                  marginTop: '0.75rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-2)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Monedas (Monto total en pesos)</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Fracción en monedas de $10, $5, $2, $1</div>
                </div>
                <input
                  type="number"
                  min="0"
                  value={currentCashClose.denominations?.coins || 0}
                  disabled={currentCashClose.status !== 'abierta'}
                  onChange={e => {
                    const valNum = parseFloat(e.target.value) || 0;
                    const currentDen = currentCashClose.denominations || {
                      b1000: 0, b500: 0, b200: 0, b100: 0, b50: 0, b20: 0, coins: 0
                    };
                    updateCashCloseDenominations({
                      ...currentDen,
                      coins: valNum
                    });
                  }}
                  className="input"
                  style={{ width: '90px', height: '32px', textAlign: 'center', fontSize: '0.85rem' }}
                />
              </div>

              {/* Notas de cierre */}
              <div style={{ marginTop: '1rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Observaciones / Notas del Corte de Caja:
                </label>
                <textarea
                  value={currentCashClose.notes || ''}
                  disabled={currentCashClose.status !== 'abierta'}
                  onChange={e => {
                    const den = currentCashClose.denominations || {
                      b1000: 0, b500: 0, b200: 0, b100: 0, b50: 0, b20: 0, coins: 0
                    };
                    updateCashCloseDenominations(den, e.target.value);
                  }}
                  rows={2}
                  className="input"
                  style={{ width: '100%', marginTop: '0.25rem', fontSize: '0.82rem' }}
                  placeholder="Ej. Se apartaron $2,000 para depósito bancario al cierre..."
                />
              </div>
            </div>
          </div>

          {/* Historial de Cortes de Caja Pasados */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Historial de Cortes de Caja Anteriores
            </h3>

            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%', fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th>Folio</th>
                    <th>Fecha</th>
                    <th>Horario</th>
                    <th>Responsable</th>
                    <th>Fondo Inicial</th>
                    <th>Ventas Efec</th>
                    <th>Total Esperado</th>
                    <th>Total Físico</th>
                    <th>Diferencia</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {closeHistory.map(item => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 700 }}>{item.id}</td>
                      <td>{item.date}</td>
                      <td>{item.openedAt} - {item.closedAt || 'Abierto'}</td>
                      <td>{item.responsible}</td>
                      <td>{formatMXN(item.initialCash)}</td>
                      <td style={{ color: 'var(--success)' }}>+{formatMXN(item.cashSales)}</td>
                      <td>{formatMXN(item.expectedCash)}</td>
                      <td style={{ fontWeight: 700 }}>{formatMXN(item.countedCash)}</td>
                      <td>
                        <span
                          style={{
                            fontWeight: 700,
                            color: item.difference === 0 ? 'var(--success)' : item.difference > 0 ? 'var(--info)' : 'var(--danger)'
                          }}
                        >
                          {item.difference === 0 ? '$0.00' : formatMXN(item.difference)}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '10px',
                            background: item.status === 'cerrada' ? 'var(--bg-surface-3)' : 'var(--success-light)',
                            color: item.status === 'cerrada' ? 'var(--text-muted)' : 'var(--success)'
                          }}
                        >
                          {item.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          TAB 3: ESTADO DE RESULTADOS OPERATIVO (P&L)
          ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'pnl' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Tarjetas Superiores P&L */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem'
            }}
          >
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                INGRESOS BRUTOS
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
                {formatMXN(pnlData.totalVentas + pnlData.otrosIngresos)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Ventas mostrador + Cobranza CxC
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                COSTO DE VENTAS (COGS)
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--danger)', marginTop: '0.35rem' }}>
                -{formatMXN(pnlData.cogs)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Compras de mercancía e insumos directos
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                UTILIDAD BRUTA (MARGEN)
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.35rem' }}>
                {formatMXN(pnlData.grossProfit)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, marginTop: '0.25rem' }}>
                {pnlData.grossMargin.toFixed(1)}% Margen Bruto
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                UTILIDAD OPERATIVA NETA
              </div>
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: pnlData.netOperatingProfit >= 0 ? 'var(--success)' : 'var(--danger)',
                  marginTop: '0.35rem'
                }}
              >
                {formatMXN(pnlData.netOperatingProfit)}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, marginTop: '0.25rem', color: pnlData.netOperatingProfit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                {pnlData.netMargin.toFixed(1)}% Rendimiento Neto
              </div>
            </div>
          </div>

          {/* Desglose Estructurado P&L */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.5rem'
            }}
          >
            {/* Cascada de Resultados */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
                Estado de Pérdidas y Ganancias (P&L Express)
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Ventas Industriales & POS:</span>
                  <span style={{ fontWeight: 600 }}>{formatMXN(pnlData.totalVentas)}</span>
                </div>
                {pnlData.otrosIngresos > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Otros Ingresos Operativos:</span>
                    <span style={{ fontWeight: 600 }}>{formatMXN(pnlData.otrosIngresos)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--danger)' }}>
                  <span>(-) Costo de Mercancía / Proveedores:</span>
                  <span style={{ fontWeight: 600 }}>-{formatMXN(pnlData.cogs)}</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0',
                    borderTop: '1px solid var(--border)',
                    borderBottom: '1px solid var(--border)',
                    fontWeight: 700,
                    color: 'var(--text-primary)'
                  }}
                >
                  <span>(=) Margen Operativo Bruto:</span>
                  <span style={{ color: 'var(--primary)' }}>{formatMXN(pnlData.grossProfit)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--danger)', marginTop: '0.25rem' }}>
                  <span>(-) Gastos de Operación y Administración:</span>
                  <span style={{ fontWeight: 600 }}>-{formatMXN(pnlData.totalOpExpenses)}</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    background: pnlData.netOperatingProfit >= 0 ? 'var(--success-light)' : 'var(--danger-light)',
                    marginTop: '0.5rem',
                    fontWeight: 800,
                    fontSize: '1rem',
                    color: pnlData.netOperatingProfit >= 0 ? 'var(--success)' : 'var(--danger)'
                  }}
                >
                  <span>(=) UTILIDAD NETA DEL PERIODO:</span>
                  <span>{formatMXN(pnlData.netOperatingProfit)}</span>
                </div>
              </div>
            </div>

            {/* Desglose de Gastos por Categoría */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                Distribución de Gastos Operativos
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {Object.keys(pnlData.expensesByCategory).length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    No hay gastos registrados en el periodo.
                  </div>
                ) : (
                  Object.entries(pnlData.expensesByCategory).map(([cat, amount]) => {
                    const pct = pnlData.totalOpExpenses > 0 ? (amount / pnlData.totalOpExpenses) * 100 : 0;
                    return (
                      <div key={cat}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{getCategoryLabel(cat)}</span>
                          <span style={{ color: 'var(--text-secondary)' }}>
                            {formatMXN(amount)} ({pct.toFixed(0)}%)
                          </span>
                        </div>
                        <div style={{ height: '8px', background: 'var(--bg-surface-3)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${pct}%`,
                              height: '100%',
                              background: 'var(--accent)',
                              borderRadius: '4px'
                            }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          TAB 4: RADAR DE LIQUIDEZ (CxC vs CxP)
          ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'liquidity' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem'
            }}
          >
            <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--info)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--info)' }}>
                <ShieldCheck size={20} />
                <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>LIQUIDEZ INMEDIATA DISPONIBLE</span>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--text-primary)' }}>
                {formatMXN(liquidityRadar.liquidezInmediata)}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Fondos en banco y efectivo listos para operar hoy.
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--success)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)' }}>
                <TrendingUp size={20} />
                <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>CARTERA POR COBRAR (CxC CLIENTES)</span>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--success)' }}>
                {formatMXN(liquidityRadar.totalCxC)}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {formatMXN(liquidityRadar.vigenteCxC)} vigente · {formatMXN(liquidityRadar.vencidoCxC)} vencida
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--warning)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning)' }}>
                <TrendingDown size={20} />
                <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>COMPROMISOS ESTIMADOS PROVEEDORES</span>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--warning)' }}>
                {formatMXN(liquidityRadar.cxpEstimada)}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Pasivos estimados en órdenes de compra de taller.
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--primary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                <Activity size={20} />
                <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>PROYECCIÓN DE FLUJO (30 DÍAS)</span>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--primary)' }}>
                {formatMXN(liquidityRadar.liquidezProyectada30Dias)}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Saldo actual + CxC vigente - Compromisos proveedores.
              </div>
            </div>
          </div>

          {/* Recomendaciones Operativas */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              Diagnóstico de Salud Financiera & Recomendaciones
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-2)',
                  border: '1px solid var(--border)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.35rem' }}>
                  <CheckCircle size={18} />
                  <span>Cobertura de Liquidez Inmediata</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  La tesorería disponible ({formatMXN(liquidityRadar.liquidezInmediata)}) cubre más de 2 meses promedio de gastos operativos fijos.
                </p>
              </div>

              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-2)',
                  border: '1px solid var(--border)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--warning)', marginBottom: '0.35rem' }}>
                  <AlertTriangle size={18} />
                  <span>Atención a Cartera Vencida</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  Existe un saldo de {formatMXN(liquidityRadar.vencidoCxC)} en cuentas vencidas. Se recomienda enviar los Estados de Cuenta generados en el módulo de Clientes.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          MODAL: NUEVO MOVIMIENTO (GASTO / INGRESO)
          ══════════════════════════════════════════════════════════════════════════ */}
      {isNewTxnModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '520px',
              padding: '1.5rem',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Registrar Movimiento Financiero</h2>
              <button
                onClick={() => setIsNewTxnModalOpen(false)}
                style={{ border: 'none', background: 'transparent', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Selector de Tipo (Ingreso o Egreso) */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setNewTxnType('expense');
                    setNewTxnCategory('nomina_sueldos');
                  }}
                  style={{
                    flex: 1,
                    padding: '0.65rem',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: newTxnType === 'expense' ? 'var(--danger)' : 'var(--bg-surface-3)',
                    color: newTxnType === 'expense' ? '#fff' : 'var(--text-secondary)'
                  }}
                >
                  Gasto / Egreso (-)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewTxnType('income');
                    setNewTxnCategory('venta_pos');
                  }}
                  style={{
                    flex: 1,
                    padding: '0.65rem',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: newTxnType === 'income' ? 'var(--success)' : 'var(--bg-surface-3)',
                    color: newTxnType === 'income' ? '#fff' : 'var(--text-secondary)'
                  }}
                >
                  Ingreso Extra (+)
                </button>
              </div>

              {/* Monto y Cuenta */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Monto en Pesos ($):</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={newTxnAmount}
                    onChange={e => setNewTxnAmount(e.target.value)}
                    className="input"
                    style={{ width: '100%', marginTop: '0.25rem', fontWeight: 700 }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Cuenta / Caja:</label>
                  <select
                    value={newTxnAccount}
                    onChange={e => {
                      setNewTxnAccount(e.target.value);
                      if (e.target.value === 'caja_mostrador') {
                        setNewTxnMethod('efectivo');
                      } else {
                        setNewTxnMethod('transferencia');
                      }
                    }}
                    className="input"
                    style={{ width: '100%', marginTop: '0.25rem' }}
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Categoría */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Categoría:</label>
                <select
                  value={newTxnCategory}
                  onChange={e => setNewTxnCategory(e.target.value)}
                  className="input"
                  style={{ width: '100%', marginTop: '0.25rem' }}
                >
                  {newTxnType === 'expense' ? (
                    <>
                      <option value="nomina_sueldos">Nómina & Sueldos de Taller</option>
                      <option value="proveedores_mercancia">Proveedores / Mercancía e Insumos</option>
                      <option value="renta_inmueble">Renta de Nave / Local</option>
                      <option value="servicios_luz_agua_net">Servicios (CFE Luz, Agua, Internet)</option>
                      <option value="fletes_logistica">Fletes & Envíos de Material</option>
                      <option value="mantenimiento_maquinaria">Mantenimiento de Tornos / Prensa / Equipo</option>
                      <option value="combustible_vehiculos">Combustible & Viáticos</option>
                      <option value="impuestos_derechos">Impuestos / Derechos / Contabilidad</option>
                      <option value="papeleria_consumibles">Consumibles & Papelería</option>
                      <option value="otros_gastos">Otros Gastos Varios</option>
                    </>
                  ) : (
                    <>
                      <option value="venta_pos">Venta Mostrador Extraordinaria</option>
                      <option value="abono_cxc">Abono de Cliente Directo</option>
                      <option value="anticipo_cliente">Anticipo por Fabricación Especial</option>
                      <option value="venta_activos">Venta de Scrap / Chatarra / Retazos</option>
                      <option value="inyeccion_capital">Aportación / Inyección de Capital</option>
                      <option value="otros_ingresos">Otros Ingresos Extraordinarios</option>
                    </>
                  )}
                </select>
              </div>

              {/* Concepto */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Concepto / Descripción:</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Pago de luz CFE taller de maquinados..."
                  value={newTxnConcept}
                  onChange={e => setNewTxnConcept(e.target.value)}
                  className="input"
                  style={{ width: '100%', marginTop: '0.25rem' }}
                />
              </div>

              {/* Beneficiario y Referencia */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Beneficiario / Proveedor:</label>
                  <input
                    type="text"
                    placeholder="Ej. Transportes Castores..."
                    value={newTxnBeneficiary}
                    onChange={e => setNewTxnBeneficiary(e.target.value)}
                    className="input"
                    style={{ width: '100%', marginTop: '0.25rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Factura / Ref / Comprobante:</label>
                  <input
                    type="text"
                    placeholder="Ej. FAC-10294..."
                    value={newTxnRef}
                    onChange={e => setNewTxnRef(e.target.value)}
                    className="input"
                    style={{ width: '100%', marginTop: '0.25rem' }}
                  />
                </div>
              </div>

              {/* Método de Pago */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Método de Pago:</label>
                <select
                  value={newTxnMethod}
                  onChange={e => setNewTxnMethod(e.target.value as any)}
                  className="input"
                  style={{ width: '100%', marginTop: '0.25rem' }}
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia SPEI</option>
                  <option value="tarjeta">Tarjeta Débito/Crédito</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsNewTxnModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Guardar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          MODAL: TRASPASO DE FONDOS
          ══════════════════════════════════════════════════════════════════════════ */}
      {isTransferModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '460px',
              padding: '1.5rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ArrowLeftRight size={20} color="var(--primary)" />
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Traspaso Entre Cuentas</h2>
              </div>
              <button
                onClick={() => setIsTransferModalOpen(false)}
                style={{ border: 'none', background: 'transparent', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Cuenta de Origen (Sale dinero):</label>
                <select
                  value={transferFrom}
                  onChange={e => setTransferFrom(e.target.value)}
                  className="input"
                  style={{ width: '100%', marginTop: '0.25rem' }}
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({formatMXN(acc.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Cuenta de Destino (Entra dinero):</label>
                <select
                  value={transferTo}
                  onChange={e => setTransferTo(e.target.value)}
                  className="input"
                  style={{ width: '100%', marginTop: '0.25rem' }}
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({formatMXN(acc.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Monto a Transferir ($):</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={transferAmount}
                  onChange={e => setTransferAmount(e.target.value)}
                  className="input"
                  style={{ width: '100%', marginTop: '0.25rem', fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Concepto del Traspaso:</label>
                <input
                  type="text"
                  required
                  value={transferConcept}
                  onChange={e => setTransferConcept(e.target.value)}
                  className="input"
                  style={{ width: '100%', marginTop: '0.25rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Efectuar Traspaso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          MODAL: APERTURA DE NUEVO TURNO DE CAJA
          ══════════════════════════════════════════════════════════════════════════ */}
      {isOpenCashModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '420px',
              padding: '1.5rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calculator size={20} color="var(--primary)" />
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Apertura de Turno de Caja</h2>
              </div>
              <button
                onClick={() => setIsOpenCashModalOpen(false)}
                style={{ border: 'none', background: 'transparent', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                const amountNum = parseFloat(openCashAmount);
                if (isNaN(amountNum) || amountNum < 0) {
                  alert('Ingresa un monto de fondo válido.');
                  return;
                }
                openNewCashDay(amountNum, cashResponsible);
                setIsOpenCashModalOpen(false);
                alert('Turno de caja aperturado correctamente.');
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
            >
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Fondo Inicial en Efectivo ($):</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={openCashAmount}
                  onChange={e => setOpenCashAmount(e.target.value)}
                  className="input"
                  style={{ width: '100%', marginTop: '0.25rem', fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Responsable de Turno:</label>
                <input
                  type="text"
                  required
                  value={cashResponsible}
                  onChange={e => setCashResponsible(e.target.value)}
                  className="input"
                  style={{ width: '100%', marginTop: '0.25rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsOpenCashModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Iniciar Turno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
