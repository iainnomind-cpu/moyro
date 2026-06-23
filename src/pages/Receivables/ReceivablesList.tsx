import React, { useState } from 'react';
import { useReceivables } from '../../context/ReceivableContext';
import { useClients } from '../../context/ClientContext';
import { AlertCircle, Clock, Search, Mail, Phone, DollarSign, TrendingDown } from 'lucide-react';
import type { Receivable } from '../../types/receivable';

export const ReceivablesList: React.FC = () => {
  const { receivables, registerPayment, applyInterest } = useReceivables();
  const { clients } = useClients();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceivable, setSelectedReceivable] = useState<Receivable | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({ amount: '', method: 'transferencia' as any, reference: '' });

  const getClient = (clientId: string) => clients.find(c => c.id === clientId);

  const filtered = receivables.filter(r => {
    const client = getClient(r.clientId);
    return (
      client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalCartera = receivables.reduce((s, r) => s + r.balance, 0);
  const totalVencido = receivables.filter(r => r.status === 'vencido').reduce((s, r) => s + r.balance, 0);
  const porVencerCount = receivables.filter(r => r.status === 'por_vencer').length;

  const handleOpenPayment = (r: Receivable) => {
    setSelectedReceivable(r);
    setPaymentData({ amount: r.balance.toString(), method: 'transferencia', reference: '' });
    setShowPaymentModal(true);
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReceivable) return;
    registerPayment(selectedReceivable.id, parseFloat(paymentData.amount), paymentData.method, paymentData.reference);
    setShowPaymentModal(false);
    alert('Abono registrado exitosamente.');
  };

  const handleApplyInterest = (r: Receivable) => {
    const penalty = r.balance * 0.05;
    if (confirm(`¿Aplicar cargo por mora de $${penalty.toFixed(2)} (5%) a esta cuenta?`)) {
      applyInterest(r.id, penalty);
    }
  };

  const statusConfig = {
    vigente: { label: 'Vigente', className: 'badge-success' },
    por_vencer: { label: 'Por Vencer', className: 'badge-warning' },
    vencido: { label: 'Vencido', className: 'badge-danger' },
    pagado: { label: 'Pagado', className: 'badge-muted' },
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Cuentas por Cobrar</h1>
          <p>Gestiona la cartera, registra abonos y envía estados de cuenta.</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="stat-card" style={{ '--gradient-line': 'linear-gradient(90deg, var(--primary), transparent)' } as any}>
          <div className="stat-icon" style={{ background: 'var(--primary-light)' }}>
            <DollarSign size={22} color="var(--primary)" />
          </div>
          <div className="stat-value" style={{ fontSize: '1.3rem' }}>${totalCartera.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</div>
          <div className="stat-label">Cartera Total por Cobrar</div>
        </div>
        <div className="stat-card" style={{ '--gradient-line': totalVencido > 0 ? 'linear-gradient(90deg, var(--danger), transparent)' : 'linear-gradient(90deg, var(--success), transparent)' } as any}>
          <div className="stat-icon" style={{ background: totalVencido > 0 ? 'var(--danger-light)' : 'var(--success-light)' }}>
            <AlertCircle size={22} color={totalVencido > 0 ? 'var(--danger)' : 'var(--success)'} />
          </div>
          <div className="stat-value" style={{ fontSize: '1.3rem', color: totalVencido > 0 ? 'var(--danger)' : 'var(--success)' }}>
            ${totalVencido.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
          </div>
          <div className="stat-label">Cartera Vencida</div>
        </div>
        <div className="stat-card" style={{ '--gradient-line': 'linear-gradient(90deg, var(--warning), transparent)' } as any}>
          <div className="stat-icon" style={{ background: 'var(--warning-light)' }}>
            <Clock size={22} color="var(--warning)" />
          </div>
          <div className="stat-value">{porVencerCount}</div>
          <div className="stat-label">Por Vencer en 3 días</div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: '0.75rem', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface-2)' }}>
          <div className="search-bar" style={{ width: '320px' }}>
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por cliente o folio..."
              className="input-field"
              style={{ borderRadius: '999px' }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Folio</th>
                <th>Cliente</th>
                <th>Vencimiento</th>
                <th style={{ textAlign: 'right' }}>Saldo Pendiente</th>
                <th style={{ textAlign: 'center' }}>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const client = getClient(r.clientId);
                const cfg = statusConfig[r.status];
                return (
                  <tr key={r.id}>
                    <td><span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.id}</span></td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{client?.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{client?.phone}</div>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: r.status === 'vencido' ? 'var(--danger)' : 'var(--text-secondary)' }}>{r.dueDate}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                        ${r.balance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </div>
                      {r.interestApplied && r.interestApplied > 0 && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--danger)' }}>
                          +${r.interestApplied.toFixed(2)} mora
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${cfg.className}`}>{cfg.label}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {r.balance > 0 && (
                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <button className="icon-btn" title="Enviar vía WhatsApp" onClick={() => alert(`Enviando a ${client?.name} por WhatsApp...`)}>
                            <Phone size={15} color="#25D366" />
                          </button>
                          <button className="icon-btn" title="Enviar vía Email" onClick={() => alert(`Enviando a ${client?.name} por Email...`)}>
                            <Mail size={15} />
                          </button>
                          {r.status === 'vencido' && (
                            <button className="icon-btn" title="Aplicar mora" style={{ color: 'var(--danger)' }} onClick={() => handleApplyInterest(r)}>
                              <TrendingDown size={15} />
                            </button>
                          )}
                          <button className="btn btn-primary btn-sm" onClick={() => handleOpenPayment(r)}>
                            Abonar
                          </button>
                        </div>
                      )}
                      {r.balance === 0 && <span className="badge badge-success">✓ Liquidado</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedReceivable && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <h2 style={{ marginBottom: '0.4rem' }}>Registrar Abono</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Folio <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{selectedReceivable.id}</strong> · Saldo actual: <strong style={{ color: 'var(--primary)' }}>${selectedReceivable.balance.toLocaleString('es-MX')}</strong>
            </p>
            <form onSubmit={handleProcessPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.4rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cantidad a Abonar</label>
                <input type="number" step="0.01" max={selectedReceivable.balance} className="input-field" value={paymentData.amount} onChange={e => setPaymentData({ ...paymentData, amount: e.target.value })} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.4rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Método de Pago</label>
                <select className="input-field" value={paymentData.method} onChange={e => setPaymentData({ ...paymentData, method: e.target.value as any })}>
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia Electrónica</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
              {paymentData.method !== 'efectivo' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.4rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Referencia / Folio</label>
                  <input type="text" className="input-field" value={paymentData.reference} onChange={e => setPaymentData({ ...paymentData, reference: e.target.value })} required />
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowPaymentModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Aplicar Abono</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
