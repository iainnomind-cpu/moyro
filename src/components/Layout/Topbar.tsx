import React, { useState } from 'react';
import { Bell, Search, Sun, Moon, ChevronDown } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import './Layout.css';
import { useReceivables } from '../../context/ReceivableContext';
import { useInventory } from '../../context/InventoryContext';

const routeNames: Record<string, string> = {
  '/': 'Dashboard',
  '/pos': 'Punto de Venta',
  '/inventory': 'Inventario',
  '/purchases': 'Catálogo y Compras',
  '/receivables': 'Cuentas por Cobrar',
  '/clients': 'Clientes',
  '/reports': 'Reportes',
  '/settings': 'Configuración',
};

export const Topbar: React.FC = () => {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(true);
  const { receivables } = useReceivables();
  const { products } = useInventory();

  const overdueCount = receivables.filter(r => r.status === 'vencido').length;
  const criticalCount = products.filter(p => p.stock <= p.minStock).length;
  const totalAlerts = overdueCount + criticalCount;

  const currentPage = routeNames[location.pathname] || 'Moyro';

  return (
    <header className="topbar">
      {/* Breadcrumb */}
      <div className="topbar-left">
        <div className="breadcrumb">
          <span>Moyro ERP</span>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">{currentPage}</span>
        </div>
      </div>

      {/* Search */}
      <div className="topbar-center">
        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar productos, clientes, folios..."
            className="input-field"
            style={{ fontSize: '0.8rem' }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="topbar-right">
        <button
          className="icon-btn"
          title="Cambiar tema"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <button className="icon-btn" title={`${totalAlerts} alertas activas`} style={{ position: 'relative' }}>
          <Bell size={17} />
          {totalAlerts > 0 && (
            <span
              className="notification-dot"
              style={{ background: overdueCount > 0 ? 'var(--danger)' : 'var(--warning)' }}
            />
          )}
        </button>

        <div className="topbar-divider" />

        <div className="topbar-profile">
          <div className="topbar-avatar">M</div>
          <div className="topbar-user-info">
            <span className="topbar-user-name">Myriam</span>
            <span className="topbar-user-role">Administrador</span>
          </div>
          <ChevronDown size={13} color="var(--text-muted)" />
        </div>
      </div>
    </header>
  );
};
