import React, { forwardRef } from 'react';
import type { CartItem } from '../../hooks/usePOS';

interface QuoteDocumentProps {
  cart: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  clientName: string;
  clientCompany?: string;
  clientEmail?: string;
  clientPhone?: string;
}

export const QuoteDocument = forwardRef<HTMLDivElement, QuoteDocumentProps>(({
  cart, subtotal, tax, total, clientName, clientCompany, clientEmail, clientPhone
}, ref) => {
  const today = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
  const quoteNumber = `COT-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;

  return (
    <div style={{ display: 'none' }}>
      <div 
        ref={ref} 
        style={{ 
          padding: '40px', 
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: '#333',
          backgroundColor: '#fff',
          width: '100%',
          maxWidth: '800px',
          margin: '0 auto'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #00A99D', paddingBottom: '20px', marginBottom: '30px' }}>
          <div>
            <h1 style={{ color: '#00A99D', margin: 0, fontSize: '28px', fontWeight: 800 }}>MOYRO</h1>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>Sistemas Hidráulicos y Neumáticos</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Torreón, Coahuila | Tel: (871) 123-4567</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ margin: 0, fontSize: '24px', color: '#FF5722' }}>COTIZACIÓN</h2>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}><strong>Folio:</strong> {quoteNumber}</p>
            <p style={{ margin: 0, fontSize: '14px' }}><strong>Fecha:</strong> {today}</p>
            <p style={{ margin: 0, fontSize: '14px' }}><strong>Vigencia:</strong> 15 días</p>
          </div>
        </div>

        {/* Client Info */}
        <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '30px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', textTransform: 'uppercase', color: '#64748b' }}>Preparado para:</h3>
          <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{clientName}</p>
          {clientCompany && <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>{clientCompany}</p>}
          {(clientEmail || clientPhone) && (
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
              {clientPhone && `Tel: ${clientPhone}`} {clientEmail && clientPhone && '|'} {clientEmail && `Email: ${clientEmail}`}
            </p>
          )}
        </div>

        {/* Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '14px' }}>CANT</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '14px' }}>CÓDIGO/SKU</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '14px' }}>DESCRIPCIÓN</th>
              <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: '14px' }}>P. UNITARIO</th>
              <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: '14px' }}>IMPORTE</th>
            </tr>
          </thead>
          <tbody>
            {cart.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px 8px', fontSize: '14px', textAlign: 'center' }}>{item.cartQuantity}</td>
                <td style={{ padding: '12px 8px', fontSize: '14px', color: '#64748b' }}>{item.id}</td>
                <td style={{ padding: '12px 8px', fontSize: '14px' }}>{item.name}</td>
                <td style={{ padding: '12px 8px', fontSize: '14px', textAlign: 'right' }}>
                  ${item.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </td>
                <td style={{ padding: '12px 8px', fontSize: '14px', textAlign: 'right', fontWeight: 500 }}>
                  ${(item.price * item.cartQuantity).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ color: '#64748b' }}>Subtotal</span>
              <span>${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ color: '#64748b' }}>IVA (16%)</span>
              <span>${tax.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontWeight: 'bold', fontSize: '18px', color: '#00A99D' }}>
              <span>Total</span>
              <span>${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '50px', paddingTop: '20px', borderTop: '1px solid #e2e8f0', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
          <p>Condiciones de venta: Precios sujetos a cambios sin previo aviso. La disponibilidad de la mercancía puede variar.</p>
          <p>¡Gracias por su preferencia!</p>
        </div>
      </div>
    </div>
  );
});

QuoteDocument.displayName = 'QuoteDocument';
