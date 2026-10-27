import { forwardRef } from 'react';
import type { CashClose } from '../../types/finance';

interface CashCloseDocumentProps {
  cashClose: CashClose;
}

export const CashCloseDocument = forwardRef<HTMLDivElement, CashCloseDocumentProps>(
  ({ cashClose }, ref) => {
    const formatMXN = (val: number) =>
      new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);

    return (
      <div
        ref={ref}
        style={{
          padding: '24px',
          width: '320px',
          fontFamily: 'monospace, sans-serif',
          fontSize: '12px',
          color: '#000',
          background: '#fff',
          margin: '0 auto',
          lineHeight: '1.4'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 'bold' }}>MOYRO INDUSTRIAL</h2>
          <div style={{ fontSize: '11px', color: '#555' }}>Suministros & Maquinados Industriales</div>
          <div style={{ fontSize: '11px', color: '#555' }}>COMPROBANTE DE CORTE DE CAJA</div>
          <div style={{ borderBottom: '1px dashed #000', margin: '10px 0' }} />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <div><strong>Folio:</strong> {cashClose.id}</div>
          <div><strong>Fecha:</strong> {cashClose.date}</div>
          <div><strong>Apertura:</strong> {cashClose.openedAt} hrs</div>
          {cashClose.closedAt && <div><strong>Cierre:</strong> {cashClose.closedAt} hrs</div>}
          <div><strong>Responsable:</strong> {cashClose.responsible}</div>
          <div><strong>Estado:</strong> {cashClose.status.toUpperCase()}</div>
        </div>

        <div style={{ borderBottom: '1px dashed #000', margin: '10px 0' }} />

        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Fondo Inicial:</span>
            <span>{formatMXN(cashClose.initialCash)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>(+) Ventas Efectivo:</span>
            <span>{formatMXN(cashClose.cashSales)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>(+) Otros Ingresos Efec:</span>
            <span>{formatMXN(cashClose.cashIncomes)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>(-) Salidas / Gastos Efec:</span>
            <span>{formatMXN(cashClose.cashExpenses)}</span>
          </div>
          <div style={{ borderBottom: '1px solid #000', margin: '6px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
            <span>TOTAL ESPERADO:</span>
            <span>{formatMXN(cashClose.expectedCash)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginTop: '4px' }}>
            <span>TOTAL CONTADO (FÍSICO):</span>
            <span>{formatMXN(cashClose.countedCash)}</span>
          </div>
          <div style={{ borderBottom: '1px solid #000', margin: '6px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
            <span>DIFERENCIA:</span>
            <span>
              {cashClose.difference === 0
                ? '$0.00 (EXACTO)'
                : cashClose.difference > 0
                ? `+${formatMXN(cashClose.difference)} (SOBRANTE)`
                : `${formatMXN(cashClose.difference)} (FALTANTE)`}
            </span>
          </div>
        </div>

        {cashClose.denominations && (
          <>
            <div style={{ borderBottom: '1px dashed #000', margin: '10px 0' }} />
            <div style={{ fontSize: '11px', marginBottom: '8px' }}>
              <strong>Desglose de Efectivo:</strong>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Billetes $1,000:</span>
                <span>{cashClose.denominations.b1000} ({formatMXN(cashClose.denominations.b1000 * 1000)})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Billetes $500:</span>
                <span>{cashClose.denominations.b500} ({formatMXN(cashClose.denominations.b500 * 500)})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Billetes $200:</span>
                <span>{cashClose.denominations.b200} ({formatMXN(cashClose.denominations.b200 * 200)})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Billetes $100:</span>
                <span>{cashClose.denominations.b100} ({formatMXN(cashClose.denominations.b100 * 100)})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Billetes $50:</span>
                <span>{cashClose.denominations.b50} ({formatMXN(cashClose.denominations.b50 * 50)})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Billetes $20:</span>
                <span>{cashClose.denominations.b20} ({formatMXN(cashClose.denominations.b20 * 20)})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Monedas Total:</span>
                <span>{formatMXN(cashClose.denominations.coins)}</span>
              </div>
            </div>
          </>
        )}

        {cashClose.notes && (
          <div style={{ marginTop: '10px', fontSize: '11px', fontStyle: 'italic' }}>
            <strong>Notas:</strong> {cashClose.notes}
          </div>
        )}

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '10px' }}>
          <div style={{ borderTop: '1px solid #000', width: '80%', margin: '0 auto 4px auto' }} />
          <div>Firma del Responsable</div>
          <div style={{ color: '#666', marginTop: '12px' }}>Sistema Moyro ERP Industrial</div>
        </div>
      </div>
    );
  }
);

CashCloseDocument.displayName = 'CashCloseDocument';
