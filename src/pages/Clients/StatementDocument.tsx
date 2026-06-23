import React, { forwardRef } from 'react';
import type { Client } from '../../types/client';
import type { Receivable } from '../../types/receivable';

interface StatementDocumentProps {
  client: Client;
  receivables: Receivable[];
}

export const StatementDocument = forwardRef<HTMLDivElement, StatementDocumentProps>(({
  client, receivables
}, ref) => {
  const today = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
  const statementNumber = `EDC-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;

  // Filtrar solo las cuentas que tienen saldo pendiente
  const activeReceivables = receivables.filter(r => r.balance > 0);
  
  const totalBalance = activeReceivables.reduce((sum, r) => sum + r.balance, 0);
  const totalVencido = activeReceivables.filter(r => r.status === 'vencido').reduce((sum, r) => sum + r.balance, 0);

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
            <h2 style={{ margin: 0, fontSize: '24px', color: '#0097a7' }}>ESTADO DE CUENTA</h2>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}><strong>Folio:</strong> {statementNumber}</p>
            <p style={{ margin: 0, fontSize: '14px' }}><strong>Fecha Emisión:</strong> {today}</p>
          </div>
        </div>

        {/* Client Info */}
        <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', textTransform: 'uppercase', color: '#64748b' }}>Cliente:</h3>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{client.name}</p>
            {client.rfc && <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>RFC: {client.rfc}</p>}
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
              {client.phone} {client.email && `| ${client.email}`}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', textTransform: 'uppercase', color: '#64748b' }}>Resumen Comercial:</h3>
            <p style={{ margin: 0, fontSize: '14px' }}><strong>Límite de Crédito:</strong> ${client.creditLimit?.toLocaleString('es-MX')}</p>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}><strong>Plazo Acordado:</strong> {client.creditDays} días</p>
          </div>
        </div>

        {/* Resumen General */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
          <div style={{ padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', marginBottom: '5px' }}>Saldo Total Pendiente</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>${totalBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
          </div>
          <div style={{ padding: '15px', border: '1px solid #fecdd3', backgroundColor: '#fff1f2', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#e11d48', textTransform: 'uppercase', marginBottom: '5px', fontWeight: 'bold' }}>Importe Vencido</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e11d48' }}>${totalVencido.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        {/* Table */}
        <h3 style={{ fontSize: '16px', marginBottom: '10px', color: '#333' }}>Desglose de Cargos Pendientes</h3>
        {activeReceivables.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px' }}>FOLIO</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px' }}>FECHA EMISIÓN</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px' }}>VENCIMIENTO</th>
                <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: '12px' }}>IMPORTE ORIGINAL</th>
                <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: '12px' }}>SALDO ACTUAL</th>
                <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '12px' }}>ESTATUS</th>
              </tr>
            </thead>
            <tbody>
              {activeReceivables.map((item, idx) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px 8px', fontSize: '13px', fontWeight: 'bold' }}>{item.id}</td>
                  <td style={{ padding: '12px 8px', fontSize: '13px', color: '#64748b' }}>{item.issueDate}</td>
                  <td style={{ padding: '12px 8px', fontSize: '13px', color: item.status === 'vencido' ? '#e11d48' : '#64748b' }}>{item.dueDate}</td>
                  <td style={{ padding: '12px 8px', fontSize: '13px', textAlign: 'right' }}>
                    ${item.originalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '12px 8px', fontSize: '13px', textAlign: 'right', fontWeight: 'bold' }}>
                    ${item.balance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '12px 8px', fontSize: '13px', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '12px', 
                      fontSize: '11px',
                      fontWeight: 'bold',
                      backgroundColor: item.status === 'vencido' ? '#fee2e2' : item.status === 'por_vencer' ? '#fef3c7' : '#dcfce7',
                      color: item.status === 'vencido' ? '#991b1b' : item.status === 'por_vencer' ? '#92400e' : '#166534'
                    }}>
                      {item.status === 'por_vencer' ? 'POR VENCER' : item.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '30px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', color: '#64748b' }}>
            El cliente no tiene saldo pendiente al día de hoy. ¡Cuenta al corriente!
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: '50px', paddingTop: '20px', borderTop: '1px solid #e2e8f0', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
          <p>Le sugerimos realizar sus pagos puntuales para evitar la suspensión de su línea de crédito y cargos por mora.</p>
          <p>Depósitos a cuenta BANORTE: 0123456789 | CLABE: 072 123 00123456789 0</p>
        </div>
      </div>
    </div>
  );
});

StatementDocument.displayName = 'StatementDocument';
