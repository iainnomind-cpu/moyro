import React, { useState } from 'react';
import { useClients } from '../../context/ClientContext';
import { Search, Plus, CreditCard, User, ChevronRight, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ClientsList: React.FC = () => {
  const { clients } = useClients();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'todos' | 'contado' | 'credito'>('todos');

  const filteredClients = clients.filter(client => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'todos' || client.type === filterType;
    return matchesSearch && matchesType;
  });

  const creditClients = clients.filter(c => c.type === 'credito');
  const totalBalance = clients.reduce((s, c) => s + (c.currentBalance || 0), 0);

  const behaviorConfig: Record<string, { label: string; color: string; className: string }> = {
    excelente: { label: 'Excelente', color: 'var(--success)', className: 'badge-success' },
    bueno: { label: 'Bueno', color: 'var(--primary)', className: 'badge-primary' },
    con_retrasos: { label: 'Con Retrasos', color: 'var(--warning)', className: 'badge-warning' },
    critico: { label: 'Crítico', color: 'var(--danger)', className: 'badge-danger' },
  };

  // Generate initials for avatar
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  const avatarColors = ['#00c4b4', '#ff6b35', '#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b'];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Directorio de Clientes</h1>
          <p>Gestiona tus clientes de mostrador y crédito.</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={16} /> Nuevo Cliente
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="stat-card" style={{ '--gradient-line': 'linear-gradient(90deg, var(--primary), transparent)' } as any}>
          <div className="stat-icon" style={{ background: 'var(--primary-light)' }}>
            <Users size={22} color="var(--primary)" />
          </div>
          <div className="stat-value">{clients.length}</div>
          <div className="stat-label">Total de Clientes</div>
        </div>
        <div className="stat-card" style={{ '--gradient-line': 'linear-gradient(90deg, var(--accent), transparent)' } as any}>
          <div className="stat-icon" style={{ background: 'var(--accent-light)' }}>
            <CreditCard size={22} color="var(--accent)" />
          </div>
          <div className="stat-value">{creditClients.length}</div>
          <div className="stat-label">Clientes con Línea de Crédito</div>
        </div>
        <div className="stat-card" style={{ '--gradient-line': totalBalance > 0 ? 'linear-gradient(90deg, var(--warning), transparent)' : 'linear-gradient(90deg, var(--success), transparent)' } as any}>
          <div className="stat-icon" style={{ background: totalBalance > 0 ? 'var(--warning-light)' : 'var(--success-light)' }}>
            <User size={22} color={totalBalance > 0 ? 'var(--warning)' : 'var(--success)'} />
          </div>
          <div className="stat-value" style={{ fontSize: '1.2rem' }}>${totalBalance.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</div>
          <div className="stat-label">Saldo Total Pendiente</div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: '0.75rem', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface-2)', alignItems: 'center' }}>
          <div className="search-bar" style={{ flex: 1 }}>
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono o email..."
              className="input-field"
              style={{ borderRadius: '999px' }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="tabs-bar">
            {(['todos', 'contado', 'credito'] as const).map(t => (
              <button key={t} className={`tab-btn ${filterType === t ? 'active' : ''}`} onClick={() => setFilterType(t)}>
                {t === 'todos' ? 'Todos' : t === 'contado' ? 'Contado' : 'Crédito'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Contacto</th>
                <th style={{ textAlign: 'center' }}>Tipo</th>
                <th style={{ textAlign: 'right' }}>Saldo Pendiente</th>
                <th style={{ textAlign: 'center' }}>Comportamiento</th>
                <th style={{ textAlign: 'right' }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client, idx) => {
                const behavior = behaviorConfig[client.paymentBehavior];
                const initials = getInitials(client.name);
                const avatarColor = avatarColors[idx % avatarColors.length];
                return (
                  <tr key={client.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-md)', background: avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800, color: 'white', flexShrink: 0 }}>
                          {initials}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{client.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{client.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.875rem' }}>{client.phone}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{client.email}</div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${client.type === 'credito' ? 'badge-warning' : 'badge-success'}`}>
                        {client.type === 'credito' ? '💳 Crédito' : '💵 Contado'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      {client.currentBalance && client.currentBalance > 0 ? (
                        <span style={{ color: client.currentBalance > (client.creditLimit || 0) ? 'var(--danger)' : 'var(--text-primary)' }}>
                          ${client.currentBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>—</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {behavior && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}>
                          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: behavior.color }} />
                          <span style={{ fontSize: '0.8rem', color: behavior.color, fontWeight: 600 }}>{behavior.label}</span>
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/clients/${client.id}`} className="btn btn-ghost btn-sm">
                        Ver perfil <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <Users size={40} />
                      <h3>Sin resultados</h3>
                      <p>No se encontraron clientes con los filtros actuales.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border)', background: 'var(--bg-surface-2)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Mostrando {filteredClients.length} de {clients.length} clientes
        </div>
      </div>
    </div>
  );
};
