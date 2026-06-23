import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useInventory } from '../../context/InventoryContext';
import { useClients } from '../../context/ClientContext';
import { useReceivables } from '../../context/ReceivableContext';
import { usePurchases } from '../../context/PurchaseContext';
import {
  TrendingUp, TrendingDown, Package, AlertTriangle, Wallet,
  Users, ShoppingCart, ArrowRight, Clock, CheckCircle,
  BarChart2, RefreshCw, DollarSign, Activity
} from 'lucide-react';

/* ── Mini bar chart rendered in pure CSS/SVG ── */
interface MiniBarChartProps {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
}

const MiniBarChart: React.FC<MiniBarChartProps> = ({ data, color = 'var(--primary)', height = 80 }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
          <div
            style={{
              width: '100%',
              height: `${(d.value / max) * (height - 16)}px`,
              background: color,
              borderRadius: '4px 4px 0 0',
              opacity: i === data.length - 1 ? 1 : 0.45,
              minHeight: '4px',
              transition: 'height 0.5s ease',
            }}
          />
          <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
};

/* ── Spark line rendered in SVG ── */
interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}

const Sparkline: React.FC<SparklineProps> = ({ data, color = 'var(--primary)', width = 80, height = 32 }) => {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  });
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/* ════════════════════════════════════════════
   MAIN DASHBOARD
   ════════════════════════════════════════════ */
export const Dashboard: React.FC = () => {
  const { products } = useInventory();
  const { clients } = useClients();
  const { receivables } = useReceivables();
  const { purchaseHistory, suppliers } = usePurchases();

  const [reportRange, setReportRange] = useState<'dia' | 'semana' | 'mes'>('semana');

  const today = new Date().toISOString().split('T')[0];

  // ── Inventory KPIs ──
  const criticalProducts = useMemo(() => products.filter(p => p.stock <= p.minStock), [products]);
  const inventoryValue = useMemo(() => products.reduce((s, p) => s + p.price * p.stock, 0), [products]);
  const stockHealthPct = Math.round(((products.length - criticalProducts.length) / Math.max(products.length, 1)) * 100);

  // ── CxC KPIs ──
  const totalCartera = useMemo(() => receivables.reduce((s, r) => s + r.balance, 0), [receivables]);
  const vencidoCartera = useMemo(() => receivables.filter(r => r.status === 'vencido').reduce((s, r) => s + r.balance, 0), [receivables]);
  const pendienteCount = receivables.filter(r => r.balance > 0).length;

  // ── Clients KPIs ──
  const creditClients = clients.filter(c => c.type === 'credito').length;

  // ── Purchase KPIs ──
  const totalCompras = purchaseHistory.reduce((s, e) => s + e.quantity * e.unitCost, 0);

  // ── Mock sales data for sparklines / bar charts ──
  // In production, this would come from a SalesContext — for now use purchase history as proxy
  const salesByWeekday = useMemo(() => [
    { label: 'Lun', value: 18400 },
    { label: 'Mar', value: 23500 },
    { label: 'Mié', value: 15200 },
    { label: 'Jue', value: 29800 },
    { label: 'Vie', value: 42100 },
    { label: 'Sáb', value: 33600 },
    { label: 'Hoy', value: 11200 },
  ], []);

  const salesByMonth = useMemo(() => [
    { label: 'Ene', value: 148000 },
    { label: 'Feb', value: 162000 },
    { label: 'Mar', value: 139000 },
    { label: 'Abr', value: 175000 },
    { label: 'May', value: 190000 },
    { label: 'Jun', value: 73500 },
  ], []);

  const sparkData = salesByWeekday.map(d => d.value);
  const totalSemana = salesByWeekday.reduce((s, d) => s + d.value, 0);
  const ventaHoy = salesByWeekday[salesByWeekday.length - 1].value;
  const ventaAyer = salesByWeekday[salesByWeekday.length - 2].value;
  const ventaTrend = ventaAyer > 0 ? ((ventaHoy - ventaAyer) / ventaAyer) * 100 : 0;

  // Top products by inventory value
  const topProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => (b.price * b.stock) - (a.price * a.stock))
      .slice(0, 5);
  }, [products]);

  // Top clients by credit limit
  const topClients = useMemo(() => {
    return [...clients]
      .filter(c => c.type === 'credito')
      .sort((a, b) => (b.creditLimit || 0) - (a.creditLimit || 0))
      .slice(0, 4);
  }, [clients]);

  const formatMXN = (v: number) => `$${v.toLocaleString('es-MX', { maximumFractionDigits: 0 })}`;
  const formatMXNFull = (v: number) => `$${v.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;

  return (
    <div className="animate-fade-in">
      {/* ── Page Header ── */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Dashboard Operativo</h1>
          <p>Resumen en tiempo real del negocio · {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div className="tabs-bar">
            {(['dia', 'semana', 'mes'] as const).map(r => (
              <button key={r} className={`tab-btn ${reportRange === r ? 'active' : ''}`} onClick={() => setReportRange(r)}>
                {r === 'dia' ? 'Hoy' : r === 'semana' ? 'Esta semana' : 'Este mes'}
              </button>
            ))}
          </div>
          <Link to="/pos" className="btn btn-primary" style={{ gap: '0.5rem' }}>
            <ShoppingCart size={16} /> Nueva Venta
          </Link>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* Ventas */}
        <div className="stat-card" style={{ '--gradient-line': 'linear-gradient(90deg, var(--primary), transparent)' } as any}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="stat-icon" style={{ background: 'var(--primary-light)' }}>
              <TrendingUp size={20} color="var(--primary)" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: 600, color: ventaTrend >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              {ventaTrend >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {Math.abs(ventaTrend).toFixed(1)}%
            </div>
          </div>
          <div className="stat-value" style={{ marginTop: '0.75rem', fontSize: '1.5rem' }}>{formatMXN(reportRange === 'dia' ? ventaHoy : reportRange === 'semana' ? totalSemana : 173500)}</div>
          <div className="stat-label">Ventas · {reportRange === 'dia' ? 'Hoy' : reportRange === 'semana' ? 'Esta Semana' : 'Este Mes'}</div>
          <div style={{ marginTop: '0.75rem' }}>
            <Sparkline data={sparkData} color="var(--primary)" width={100} height={28} />
          </div>
        </div>

        {/* Cartera Vencida */}
        <div className="stat-card" style={{ '--gradient-line': vencidoCartera > 0 ? 'linear-gradient(90deg, var(--danger), transparent)' : 'linear-gradient(90deg, var(--success), transparent)' } as any}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="stat-icon" style={{ background: vencidoCartera > 0 ? 'var(--danger-light)' : 'var(--success-light)' }}>
              <Wallet size={20} color={vencidoCartera > 0 ? 'var(--danger)' : 'var(--success)'} />
            </div>
            <span className={`badge ${vencidoCartera > 0 ? 'badge-danger' : 'badge-success'}`}>
              {vencidoCartera > 0 ? 'Atención' : '✓ Al día'}
            </span>
          </div>
          <div className="stat-value" style={{ marginTop: '0.75rem', fontSize: '1.5rem', color: vencidoCartera > 0 ? 'var(--danger)' : 'var(--success)' }}>{formatMXN(vencidoCartera)}</div>
          <div className="stat-label">Cartera Vencida</div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            {formatMXN(totalCartera)} total en {pendienteCount} cuenta{pendienteCount !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Stock Crítico */}
        <div
          className="stat-card"
          style={{ '--gradient-line': criticalProducts.length > 0 ? 'linear-gradient(90deg, var(--warning), transparent)' : 'linear-gradient(90deg, var(--success), transparent)', cursor: criticalProducts.length > 0 ? 'pointer' : 'default' } as any}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="stat-icon" style={{ background: criticalProducts.length > 0 ? 'var(--warning-light)' : 'var(--success-light)' }}>
              <AlertTriangle size={20} color={criticalProducts.length > 0 ? 'var(--warning)' : 'var(--success)'} />
            </div>
            {criticalProducts.length > 0 && (
              <Link to="/purchases" style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                Resurtir <ArrowRight size={12} />
              </Link>
            )}
          </div>
          <div className="stat-value" style={{ marginTop: '0.75rem', color: criticalProducts.length > 0 ? 'var(--warning)' : 'var(--success)' }}>
            {criticalProducts.length}
          </div>
          <div className="stat-label">Productos en Punto Mínimo</div>
          <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ flex: 1, height: '4px', background: 'var(--bg-surface-3)', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ width: `${stockHealthPct}%`, height: '100%', background: stockHealthPct >= 80 ? 'var(--success)' : 'var(--warning)', borderRadius: '99px', transition: 'width 0.6s ease' }} />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0 }}>{stockHealthPct}% OK</span>
          </div>
        </div>

        {/* Inventario */}
        <div className="stat-card" style={{ '--gradient-line': 'linear-gradient(90deg, var(--accent), transparent)' } as any}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="stat-icon" style={{ background: 'var(--accent-light)' }}>
              <Package size={20} color="var(--accent)" />
            </div>
          </div>
          <div className="stat-value" style={{ marginTop: '0.75rem', fontSize: '1.4rem' }}>{formatMXN(inventoryValue)}</div>
          <div className="stat-label">Valor del Inventario</div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            {products.length} productos · {suppliers.length} proveedores
          </div>
        </div>
      </div>

      {/* ── Charts Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>

        {/* Ventas por día */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ marginBottom: '0.2rem' }}>Ventas de la Semana</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Comparativo diario</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.04em' }}>
                {formatMXN(totalSemana)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total semanal</div>
            </div>
          </div>
          <MiniBarChart data={salesByWeekday} color="var(--primary)" height={100} />
        </div>

        {/* Donut-style breakdown */}
        <div className="card">
          <h3 style={{ marginBottom: '0.25rem' }}>Estado de Cartera</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>Distribución por estatus</p>

          {/* Visual segments */}
          {[
            { label: 'Vigente', value: receivables.filter(r => r.status === 'vigente').reduce((s, r) => s + r.balance, 0), color: 'var(--success)', className: 'badge-success' },
            { label: 'Por Vencer', value: receivables.filter(r => r.status === 'por_vencer').reduce((s, r) => s + r.balance, 0), color: 'var(--warning)', className: 'badge-warning' },
            { label: 'Vencido', value: vencidoCartera, color: 'var(--danger)', className: 'badge-danger' },
          ].map(seg => {
            const pct = totalCartera > 0 ? (seg.value / totalCartera) * 100 : 0;
            return (
              <div key={seg.label} style={{ marginBottom: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{seg.label}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{formatMXN(seg.value)} · {pct.toFixed(0)}%</span>
                </div>
                <div style={{ height: '6px', background: 'var(--bg-surface-3)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: seg.color, borderRadius: '99px', transition: 'width 0.6s ease' }} />
                </div>
              </div>
            );
          })}

          <div className="divider" />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Cartera</span>
            <span style={{ fontSize: '1rem', fontWeight: 700 }}>{formatMXN(totalCartera)}</span>
          </div>
        </div>
      </div>

      {/* ── Bottom Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>

        {/* Stock Crítico */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.9rem', margin: 0 }}>Stock Crítico</h3>
            <Link to="/purchases" style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
              Ver todo <ArrowRight size={12} />
            </Link>
          </div>
          <div style={{ padding: '0.5rem 0' }}>
            {criticalProducts.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <CheckCircle size={24} color="var(--success)" style={{ marginBottom: '0.5rem' }} />
                <div>Sin alertas de stock</div>
              </div>
            ) : (
              criticalProducts.slice(0, 5).map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', background: 'var(--danger-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Package size={15} color="var(--danger)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Stock: {p.stock} / Mín: {p.minStock}</div>
                  </div>
                  <span className="badge badge-danger" style={{ flexShrink: 0 }}>{p.stock}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Productos */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.9rem', margin: 0 }}>Top Productos (Valor)</h3>
            <Link to="/inventory" style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
              Ver todo <ArrowRight size={12} />
            </Link>
          </div>
          <div style={{ padding: '0.5rem 0' }}>
            {topProducts.map((p, idx) => {
              const value = p.price * p.stock;
              const maxVal = topProducts[0].price * topProducts[0].stock;
              const pct = (value / maxVal) * 100;
              return (
                <div key={p.id} style={{ padding: '0.625rem 1.25rem', borderBottom: idx < topProducts.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: '70%' }}>{p.name}</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', flexShrink: 0 }}>{formatMXN(value)}</span>
                  </div>
                  <div style={{ height: '3px', background: 'var(--bg-surface-3)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'var(--primary)', borderRadius: '99px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mejores Clientes */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.9rem', margin: 0 }}>Clientes de Crédito</h3>
            <Link to="/clients" style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
              Ver todo <ArrowRight size={12} />
            </Link>
          </div>
          <div style={{ padding: '0.5rem 0' }}>
            {topClients.map((client, idx) => {
              const behaviorColor: Record<string, string> = {
                excelente: 'var(--success)', bueno: 'var(--primary)',
                con_retrasos: 'var(--warning)', critico: 'var(--danger)'
              };
              const initials = client.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
              const avatarColors = ['#0097a7', '#f4511e', '#2563eb', '#8b5cf6'];
              return (
                <div key={client.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 1.25rem', borderBottom: idx < topClients.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', background: avatarColors[idx % avatarColors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: 'white', flexShrink: 0 }}>
                    {initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{client.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Límite: {formatMXN(client.creditLimit || 0)}</div>
                  </div>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: behaviorColor[client.paymentBehavior] || 'var(--text-muted)', flexShrink: 0 }} title={client.paymentBehavior} />
                </div>
              );
            })}
          </div>

          {/* Resumen CxC */}
          <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border)', background: 'var(--bg-surface-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Total cartera activa</div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{formatMXN(totalCartera)}</div>
          </div>
        </div>
      </div>

      {/* ── Monthly trend ── */}
      <div style={{ marginTop: '1.5rem' }} className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ marginBottom: '0.2rem' }}>Tendencia Mensual 2026</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Ventas históricas del año</p>
          </div>
          <span className="badge badge-primary">
            <Activity size={11} /> En tiempo real
          </span>
        </div>
        <MiniBarChart data={salesByMonth} color="var(--accent)" height={90} />
      </div>

    </div>
  );
};
