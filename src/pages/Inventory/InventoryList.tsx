import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { Search, Plus, AlertTriangle, Upload, Box, MapPin, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const InventoryList: React.FC = () => {
  const { products } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStock, setFilterStock] = useState<'todos' | 'critico' | 'normal'>('todos');
  const [showImportModal, setShowImportModal] = useState(false);

  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.barcode && product.barcode.includes(searchTerm));
    const isCritical = product.stock <= product.minStock;
    const matchesStock =
      filterStock === 'todos' ||
      (filterStock === 'critico' && isCritical) ||
      (filterStock === 'normal' && !isCritical);
    return matchesSearch && matchesStock;
  });

  const criticalCount = products.filter(p => p.stock <= p.minStock).length;
  const totalValue = products.reduce((s, p) => s + p.price * p.stock, 0);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Catálogo e Inventario</h1>
          <p>{products.length.toLocaleString()} piezas registradas · Valor estimado: ${totalValue.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-outline" onClick={() => setShowImportModal(true)}>
            <Upload size={16} /> Importar Excel
          </button>
          <button className="btn btn-primary">
            <Plus size={16} /> Nuevo Producto
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="stat-card" style={{ '--gradient-line': 'linear-gradient(90deg, var(--primary), transparent)' } as any}>
          <div className="stat-icon" style={{ background: 'var(--primary-light)' }}>
            <Box size={22} color="var(--primary)" />
          </div>
          <div className="stat-value">{products.length}</div>
          <div className="stat-label">Total en Catálogo</div>
        </div>
        <div
          className="stat-card"
          style={{ '--gradient-line': criticalCount > 0 ? 'linear-gradient(90deg, var(--danger), transparent)' : 'linear-gradient(90deg, var(--success), transparent)', cursor: criticalCount > 0 ? 'pointer' : 'default' } as any}
          onClick={() => criticalCount > 0 && setFilterStock(filterStock === 'critico' ? 'todos' : 'critico')}
        >
          <div className="stat-icon" style={{ background: criticalCount > 0 ? 'var(--danger-light)' : 'var(--success-light)' }}>
            <AlertTriangle size={22} color={criticalCount > 0 ? 'var(--danger)' : 'var(--success)'} />
          </div>
          <div className="stat-value" style={{ color: criticalCount > 0 ? 'var(--danger)' : 'var(--success)' }}>
            {criticalCount}
          </div>
          <div className="stat-label">{criticalCount > 0 ? 'Piezas en Stock Crítico (clic)' : 'Sin Alertas de Stock'}</div>
        </div>
        <div className="stat-card" style={{ '--gradient-line': 'linear-gradient(90deg, var(--accent), transparent)' } as any}>
          <div className="stat-icon" style={{ background: 'var(--accent-light)' }}>
            <MapPin size={22} color="var(--accent)" />
          </div>
          <div className="stat-value" style={{ fontSize: '1.25rem' }}>
            ${totalValue.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
          </div>
          <div className="stat-label">Valor del Inventario</div>
        </div>
      </div>

      {/* Alert Banner */}
      {criticalCount > 0 && filterStock === 'critico' && (
        <div style={{ background: 'var(--danger-light)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 'var(--radius-md)', padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <AlertTriangle size={18} color="var(--danger)" />
          <span style={{ fontSize: '0.875rem', color: 'var(--danger)', fontWeight: 500 }}>
            Mostrando {criticalCount} productos por debajo de su punto de reorden.
          </span>
          <button className="btn btn-sm btn-ghost" style={{ marginLeft: 'auto', color: 'var(--danger)' }} onClick={() => setFilterStock('todos')}>
            Quitar filtro ×
          </button>
        </div>
      )}

      {/* Table Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: '0.75rem', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface-2)' }}>
          <div className="search-bar" style={{ flex: 1 }}>
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por descripción, SKU o código de barras..."
              className="input-field"
              style={{ borderRadius: '999px' }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="input-field"
            style={{ width: '180px', borderRadius: 'var(--radius-md)' }}
            value={filterStock}
            onChange={e => setFilterStock(e.target.value as any)}
          >
            <option value="todos">Todos los niveles</option>
            <option value="critico">Stock Crítico</option>
            <option value="normal">Stock Normal</option>
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Producto / SKU</th>
                <th>Ubicación</th>
                <th style={{ textAlign: 'right' }}>Precio</th>
                <th style={{ textAlign: 'right' }}>Stock</th>
                <th style={{ textAlign: 'right' }}>Mínimo</th>
                <th style={{ textAlign: 'center' }}>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => {
                const isCritical = product.stock <= product.minStock;
                const stockPct = Math.min(100, (product.stock / Math.max(product.minStock * 3, 1)) * 100);
                return (
                  <tr key={product.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-md)', background: isCritical ? 'var(--danger-light)' : 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Box size={18} color={isCritical ? 'var(--danger)' : 'var(--primary)'} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, maxWidth: '260px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.875rem' }}>
                            {product.name}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                            {product.id}{product.barcode ? ` · ${product.barcode}` : ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MapPin size={13} color="var(--text-muted)" />
                        <span style={{ fontSize: '0.8rem' }}>Anq.{product.location.anaquel} · F{product.location.fila}</span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '1px' }}>{product.location.caja_cajon}</div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, fontSize: '0.875rem' }}>
                      ${product.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: isCritical ? 'var(--danger)' : 'var(--success)' }}>
                        {product.stock}
                      </div>
                      <div style={{ width: '50px', height: '3px', borderRadius: '99px', background: 'var(--bg-surface-3)', marginTop: '4px', marginLeft: 'auto' }}>
                        <div style={{ width: `${stockPct}%`, height: '100%', background: isCritical ? 'var(--danger)' : 'var(--success)', borderRadius: '99px', transition: 'width 0.4s ease' }} />
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      {product.minStock}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={isCritical ? 'badge badge-danger' : 'badge badge-success'}>
                        {isCritical ? '⚠ Reordenar' : '✓ OK'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/inventory/${product.id}`} className="btn btn-ghost btn-sm" style={{ gap: '0.25rem' }}>
                        Detalle <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <Box size={40} />
                      <h3>Sin resultados</h3>
                      <p>No se encontraron productos con los filtros actuales.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border)', background: 'var(--bg-surface-2)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Mostrando {filteredProducts.length} de {products.length} productos
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <h2 style={{ marginBottom: '0.5rem' }}>Importar desde Drive / Excel</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Sube tu archivo .xlsx o .csv. El sistema generará SKUs automáticamente para productos sin código.
            </p>
            <div style={{ border: '2px dashed var(--border-strong)', borderRadius: 'var(--radius-lg)', padding: '2.5rem', textAlign: 'center', marginBottom: '1.5rem', cursor: 'pointer', background: 'var(--bg-surface-2)', transition: 'all var(--transition-fast)' }}>
              <Upload size={32} color="var(--primary)" style={{ marginBottom: '0.75rem' }} />
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Haz clic para seleccionar archivo</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>O arrástralo y suéltalo aquí · .xlsx / .csv</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-outline" onClick={() => setShowImportModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={() => { alert('Importación simulada exitosa.'); setShowImportModal(false); }}>
                Iniciar Importación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
