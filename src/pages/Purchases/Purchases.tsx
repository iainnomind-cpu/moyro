import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { usePurchases } from '../../context/PurchaseContext';
import { ShoppingBag, AlertTriangle, Truck, FileCheck, CheckCircle } from 'lucide-react';

export const Purchases: React.FC = () => {
  const { products } = useInventory();
  const { suppliers, purchaseHistory, registerPurchase } = usePurchases();

  const [activeTab, setActiveTab] = useState<'reorden' | 'historial'>('reorden');
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [formData, setFormData] = useState({ supplierId: '', quantity: '', unitCost: '', invoiceNumber: '' });

  const criticalProducts = products.filter(p => p.stock <= p.minStock);
  const totalSpend = purchaseHistory.reduce((s, e) => s + e.quantity * e.unitCost, 0);

  const handleOpenReceiveModal = (productId: string, currentCost: number) => {
    setSelectedProductId(productId);
    setFormData({ supplierId: suppliers[0]?.id || '', quantity: '', unitCost: currentCost.toString(), invoiceNumber: '' });
    setShowReceiveModal(true);
  };

  const handleSubmitPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    registerPurchase(selectedProductId, formData.supplierId, parseInt(formData.quantity), parseFloat(formData.unitCost), formData.invoiceNumber);
    setShowReceiveModal(false);
    alert('Entrada registrada. Stock actualizado.');
  };

  const getSupplierName = (id: string) => suppliers.find(s => s.id === id)?.name || '—';
  const getProductName = (id: string) => products.find(p => p.id === id)?.name || id;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Catálogo y Compras</h1>
          <p>Gestiona el reabastecimiento y registra entradas de almacén.</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="stat-card" style={{ '--gradient-line': criticalProducts.length > 0 ? 'linear-gradient(90deg, var(--danger), transparent)' : 'linear-gradient(90deg, var(--success), transparent)' } as any}>
          <div className="stat-icon" style={{ background: criticalProducts.length > 0 ? 'var(--danger-light)' : 'var(--success-light)' }}>
            <AlertTriangle size={22} color={criticalProducts.length > 0 ? 'var(--danger)' : 'var(--success)'} />
          </div>
          <div className="stat-value" style={{ color: criticalProducts.length > 0 ? 'var(--danger)' : 'var(--success)' }}>
            {criticalProducts.length}
          </div>
          <div className="stat-label">Puntos de Reorden Activos</div>
        </div>
        <div className="stat-card" style={{ '--gradient-line': 'linear-gradient(90deg, var(--primary), transparent)' } as any}>
          <div className="stat-icon" style={{ background: 'var(--primary-light)' }}>
            <Truck size={22} color="var(--primary)" />
          </div>
          <div className="stat-value">{suppliers.length}</div>
          <div className="stat-label">Proveedores Activos</div>
        </div>
        <div className="stat-card" style={{ '--gradient-line': 'linear-gradient(90deg, var(--accent), transparent)' } as any}>
          <div className="stat-icon" style={{ background: 'var(--accent-light)' }}>
            <FileCheck size={22} color="var(--accent)" />
          </div>
          <div className="stat-value" style={{ fontSize: '1.2rem' }}>${totalSpend.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</div>
          <div className="stat-label">Gasto Histórico en Compras</div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface-2)' }}>
          <button
            style={{ flex: 1, padding: '1rem', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: activeTab === 'reorden' ? 700 : 500, color: activeTab === 'reorden' ? 'var(--primary)' : 'var(--text-secondary)', borderBottom: activeTab === 'reorden' ? '2px solid var(--primary)' : '2px solid transparent', transition: 'all 0.15s ease', fontSize: '0.875rem' }}
            onClick={() => setActiveTab('reorden')}
          >
            ⚠ Alertas de Reorden ({criticalProducts.length})
          </button>
          <button
            style={{ flex: 1, padding: '1rem', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: activeTab === 'historial' ? 700 : 500, color: activeTab === 'historial' ? 'var(--primary)' : 'var(--text-secondary)', borderBottom: activeTab === 'historial' ? '2px solid var(--primary)' : '2px solid transparent', transition: 'all 0.15s ease', fontSize: '0.875rem' }}
            onClick={() => setActiveTab('historial')}
          >
            Historial de Entradas ({purchaseHistory.length})
          </button>
        </div>

        <div style={{ padding: '1.25rem', overflowX: 'auto' }}>
          {activeTab === 'reorden' && (
            <>
              {criticalProducts.length === 0 ? (
                <div className="empty-state">
                  <CheckCircle size={48} color="var(--success)" />
                  <h3 style={{ color: 'var(--success)' }}>Todo bajo control</h3>
                  <p>No hay piezas por debajo de su stock mínimo configurado.</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th style={{ textAlign: 'center' }}>Stock Actual</th>
                      <th style={{ textAlign: 'center' }}>Mínimo</th>
                      <th>Sugerencia</th>
                      <th style={{ textAlign: 'right' }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {criticalProducts.map(product => (
                      <tr key={product.id}>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{product.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{product.id}</div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ fontWeight: 700, color: 'var(--danger)', fontSize: '1.1rem' }}>{product.stock}</span>
                        </td>
                        <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{product.minStock}</td>
                        <td>
                          <span className="badge badge-warning">Pedir {product.minStock * 2} pzs</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button className="btn btn-primary btn-sm" onClick={() => handleOpenReceiveModal(product.id, product.cost)}>
                            <ShoppingBag size={14} /> Recibir Factura
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}

          {activeTab === 'historial' && (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Factura</th>
                  <th>Producto</th>
                  <th>Proveedor</th>
                  <th style={{ textAlign: 'right' }}>Cant.</th>
                  <th style={{ textAlign: 'right' }}>Costo Unit.</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {purchaseHistory.map(entry => (
                  <tr key={entry.id}>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{entry.date}</td>
                    <td><span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--primary)' }}>{entry.invoiceNumber}</span></td>
                    <td>
                      <div style={{ fontWeight: 500, maxWidth: '180px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontSize: '0.875rem' }}>
                        {getProductName(entry.productId)}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8rem', maxWidth: '150px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', color: 'var(--text-secondary)' }}>
                      {getSupplierName(entry.supplierId)}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{entry.quantity}</td>
                    <td style={{ textAlign: 'right', fontSize: '0.875rem' }}>${entry.unitCost.toFixed(2)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--primary)' }}>
                      ${(entry.quantity * entry.unitCost).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {showReceiveModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <h2 style={{ marginBottom: '0.4rem' }}>Registrar Entrada de Mercancía</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Las piezas se sumarán automáticamente al inventario de <strong style={{ color: 'var(--text-primary)' }}>{getProductName(selectedProductId)}</strong>.
            </p>
            <form onSubmit={handleSubmitPurchase} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.4rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Proveedor</label>
                <select className="input-field" value={formData.supplierId} onChange={e => setFormData({ ...formData, supplierId: e.target.value })} required>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.4rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Folio Factura</label>
                  <input type="text" className="input-field" placeholder="Ej. F-1204" value={formData.invoiceNumber} onChange={e => setFormData({ ...formData, invoiceNumber: e.target.value })} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.4rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cantidad</label>
                  <input type="number" className="input-field" min="1" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} required />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.4rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Costo Unitario (sin IVA)</label>
                <input type="number" step="0.01" className="input-field" value={formData.unitCost} onChange={e => setFormData({ ...formData, unitCost: e.target.value })} required />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowReceiveModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Guardar y Sumar Stock</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
