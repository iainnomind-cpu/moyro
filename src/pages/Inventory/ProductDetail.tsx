import React, { useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useInventory } from '../../context/InventoryContext';
import { ArrowLeft, Edit, MapPin, Box, Printer, AlertTriangle } from 'lucide-react';
import BarcodeLib from 'react-barcode';
import QRCodeLib from 'react-qr-code';

// Resolución segura para CommonJS en Vite
const Barcode: any = typeof BarcodeLib === 'function' ? BarcodeLib : (BarcodeLib as any).default;
const QRCode: any = typeof QRCodeLib === 'function' ? QRCodeLib : (QRCodeLib as any).default;

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { products } = useInventory();
  
  const product = products.find(p => p.id === id);

  if (!product) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>Producto no encontrado</h2>
        <p className="text-muted" style={{ margin: '1rem 0' }}>El producto que intentas buscar no existe.</p>
        <Link to="/inventory" className="btn btn-primary">Volver al Inventario</Link>
      </div>
    );
  }

  const isCritical = product.stock <= product.minStock;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link to="/inventory" className="icon-btn" style={{ backgroundColor: 'var(--bg-surface)' }}>
          <ArrowLeft size={20} />
        </Link>
        <div style={{ flexGrow: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{ marginBottom: 0 }}>{product.name}</h1>
            {isCritical && (
              <span className="badge badge-warning" style={{ color: 'var(--danger)' }}>Stock Crítico</span>
            )}
          </div>
          <p className="text-muted" style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Categoría: {product.category} | SKU: <span style={{ fontFamily: 'monospace' }}>{product.id}</span>
          </p>
        </div>
        <button className="btn btn-outline" onClick={handlePrint}>
          <Printer size={18} /> Imprimir Etiquetas
        </button>
        <button className="btn btn-primary">
          <Edit size={18} /> Editar Producto
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        
        {/* Detalles Generales y Precio */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Box size={18} className="text-primary" /> Detalles del Producto
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              {product.description}
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ backgroundColor: 'var(--bg-surface-hover)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Precio de Venta</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--primary)' }}>
                  ${product.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div style={{ backgroundColor: 'var(--bg-surface-hover)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Costo Proveedor</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                  ${product.cost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>

          {/* Inventario y Ubicación */}
          <div className="card" style={{ border: isCritical ? '1px solid var(--danger)' : '' }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: isCritical ? 'var(--danger)' : 'inherit' }}>
              {isCritical ? <AlertTriangle size={18} /> : <MapPin size={18} className="text-primary" />}
              Niveles y Ubicación
            </h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Stock Actual</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: isCritical ? 'var(--danger)' : 'inherit' }}>{product.stock}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Mínimo</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 500, color: 'var(--text-muted)' }}>{product.minStock}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Último Resurtido</div>
                <div style={{ fontSize: '1rem', fontWeight: 500, marginTop: '0.5rem' }}>{product.lastRestockDate || 'N/D'}</div>
              </div>
            </div>

            <h4 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem' }}>Ubicación Física</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              <div style={{ padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Anaquel</div>
                <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>{product.location.anaquel}</div>
              </div>
              <div style={{ padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fila</div>
                <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>{product.location.fila}</div>
              </div>
              <div style={{ padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Caja/Cajón</div>
                <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>{product.location.caja_cajon}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Generador de Etiquetas (Print Area) */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Printer size={18} className="text-primary" /> Etiquetas de Identificación
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.875rem' }}>
            Generación automática de códigos para facilitar el escaneo en el Punto de Venta. 
            Puedes imprimir estas etiquetas para pegarlas en el anaquel o en el producto.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, gap: '3rem' }}>
            
            <div style={{ textAlign: 'center' }}>
              <h4 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Código de Barras (SKU)</h4>
              <div style={{ padding: '1rem', backgroundColor: '#fff', borderRadius: '8px', display: 'inline-block' }}>
                {/* React-barcode expects string, use product.barcode if exists, else internal ID */}
                <Barcode value={product.barcode || product.id} width={2} height={60} fontSize={14} />
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <h4 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Código QR</h4>
              <div style={{ padding: '1rem', backgroundColor: '#fff', borderRadius: '8px', display: 'inline-block' }}>
                {/* QR Code can store more complex info, let's put a JSON string or URL */}
                <QRCode value={JSON.stringify({ sku: product.id, name: product.name, price: product.price })} size={150} />
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
};
