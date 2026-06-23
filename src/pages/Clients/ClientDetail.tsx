import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useClients } from '../../context/ClientContext';
import { useReceivables } from '../../context/ReceivableContext';
import { ArrowLeft, Edit, Mail, Phone, MapPin, CreditCard, Clock, FileText, Download, User, ShoppingCart } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { StatementDocument } from './StatementDocument';

export const ClientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { clients, getClientTransactions } = useClients();
  const { receivables } = useReceivables();
  
  const client = clients.find(c => c.id === id);
  const transactions = getClientTransactions(id || '');
  const clientReceivables = receivables.filter(r => r.clientId === id);

  const printComponentRef = React.useRef<HTMLDivElement>(null);
  const handlePrintStatement = useReactToPrint({
    contentRef: printComponentRef,
    documentTitle: `Estado_De_Cuenta_${client?.name.replace(/\s+/g, '_')}`,
  });

  if (!client) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>Cliente no encontrado</h2>
        <p className="text-muted" style={{ margin: '1rem 0' }}>El cliente que intentas buscar no existe o fue eliminado.</p>
        <Link to="/clients" className="btn btn-primary">Volver al Directorio</Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link to="/clients" className="icon-btn" style={{ backgroundColor: 'var(--bg-surface)' }}>
          <ArrowLeft size={20} />
        </Link>
        <div style={{ flexGrow: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{ marginBottom: 0 }}>{client.name}</h1>
            <span className={`badge ${client.type === 'credito' ? 'badge-warning' : 'badge-success'}`} style={{ textTransform: 'capitalize' }}>
              {client.type}
            </span>
          </div>
          <p className="text-muted" style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>ID: {client.id} | Registrado: {client.createdAt}</p>
        </div>
        <button className="btn btn-outline">
          <Edit size={18} /> Editar Cliente
        </button>
        {client.type === 'credito' && (
          <button className="btn btn-secondary" onClick={() => handlePrintStatement()}>
            <Download size={18} /> Estado de Cuenta
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Columna Izquierda: Info y Métricas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} className="text-primary" /> Información de Contacto
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <Phone size={18} style={{ color: 'var(--text-muted)' }} />
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>Teléfono</div>
                  <div style={{ color: 'var(--text-muted)' }}>{client.phone}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <Mail size={18} style={{ color: 'var(--text-muted)' }} />
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>Email</div>
                  <div style={{ color: 'var(--text-muted)' }}>{client.email || 'No registrado'}</div>
                </div>
              </div>
              {client.rfc && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <FileText size={18} style={{ color: 'var(--text-muted)' }} />
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>RFC</div>
                    <div style={{ color: 'var(--text-muted)' }}>{client.rfc}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="card" style={{ background: client.type === 'credito' ? 'linear-gradient(135deg, var(--bg-surface) 0%, rgba(255, 87, 34, 0.05) 100%)' : 'var(--bg-surface)' }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={18} className="text-primary" /> Información Financiera
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Compras Totales</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>${client.totalPurchases.toLocaleString('es-MX')}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Última Compra</div>
                <div style={{ fontSize: '1rem', fontWeight: 500 }}>{client.lastPurchaseDate || 'N/A'}</div>
              </div>
            </div>

            {client.type === 'credito' && (
              <>
                <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '1rem 0' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Saldo Pendiente</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: (client.currentBalance || 0) > (client.creditLimit || 0) ? 'var(--danger)' : 'var(--text-main)' }}>
                      ${(client.currentBalance || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Límite de Crédito</div>
                    <div style={{ fontSize: '1rem', fontWeight: 500 }}>${(client.creditLimit || 0).toLocaleString('es-MX')}</div>
                  </div>
                </div>
                
                {/* Barra de progreso de crédito */}
                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden', marginBottom: '1rem' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${Math.min(((client.currentBalance || 0) / (client.creditLimit || 1)) * 100, 100)}%`,
                    backgroundColor: (client.currentBalance || 0) > (client.creditLimit || 1) ? 'var(--danger)' : 'var(--primary)',
                    transition: 'width 0.5s ease'
                  }}></div>
                </div>
                
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Plazo: {client.creditDays} días</span>
                  <span style={{ textTransform: 'capitalize', color: client.paymentBehavior === 'excelente' ? 'var(--success)' : client.paymentBehavior === 'con_retrasos' ? 'var(--warning)' : 'var(--text-muted)' }}>
                    Pago: {client.paymentBehavior.replace('_', ' ')}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Columna Derecha: Historial */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <Clock size={18} className="text-primary" /> Historial Reciente
            </h3>
            <button className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>Ver Todo</button>
          </div>

          {transactions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {transactions.map(trx => (
                <div key={trx.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ 
                    width: '40px', height: '40px', borderRadius: '8px', 
                    backgroundColor: trx.type === 'pago' ? 'rgba(40, 167, 69, 0.1)' : 'rgba(0, 122, 122, 0.1)',
                    color: trx.type === 'pago' ? 'var(--success)' : 'var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {trx.type === 'pago' ? <CreditCard size={20} /> : <ShoppingCart size={20} />}
                  </div>
                  
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600 }}>{trx.type === 'pago' ? 'Pago Recibido' : 'Compra'} ({trx.id})</span>
                      <span style={{ fontWeight: 600, color: trx.type === 'pago' ? 'var(--success)' : 'inherit' }}>
                        {trx.type === 'pago' ? '+' : ''}${trx.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      {trx.date} • {trx.description}
                    </div>
                    <div>
                      <span className={`badge ${trx.status === 'vencido' ? 'badge-warning' : trx.status === 'completado' ? 'badge-success' : ''}`} style={{ fontSize: '0.65rem' }}>
                        {trx.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              <FileText size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
              <p>No hay transacciones recientes para este cliente.</p>
            </div>
          )}
        </div>
      </div>

      <StatementDocument 
        ref={printComponentRef}
        client={client}
        receivables={clientReceivables}
      />
    </div>
  );
};
