import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, Package,
  Users, FileText, Settings, Wallet, ShoppingBag, ChevronRight
} from 'lucide-react';
import './Layout.css';
import { useReceivables } from '../../context/ReceivableContext';
import { useInventory } from '../../context/InventoryContext';

export const Sidebar: React.FC = () => {
  const { receivables } = useReceivables();
  const { products } = useInventory();

  const overdueCount = receivables.filter(r => r.status === 'vencido').length;
  const criticalStock = products.filter(p => p.stock <= p.minStock).length;

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} />, end: true },
    { name: 'Punto de Venta', path: '/pos', icon: <ShoppingCart size={18} /> },
    { name: 'Inventario', path: '/inventory', icon: <Package size={18} />, badge: criticalStock > 0 ? criticalStock : undefined, badgeColor: 'warning' },
    { name: 'Compras', path: '/purchases', icon: <ShoppingBag size={18} /> },
    { name: 'Cuentas x Cobrar', path: '/receivables', icon: <Wallet size={18} />, badge: overdueCount > 0 ? overdueCount : undefined, badgeColor: 'danger' },
    { name: 'Clientes', path: '/clients', icon: <Users size={18} /> },
    { name: 'Reportes', path: '/reports', icon: <FileText size={18} /> },
  ];

  const bottomItems = [
    { name: 'Configuración', path: '/settings', icon: <Settings size={18} /> },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="logo-mark">M</div>
        <div className="logo-text">
          <span className="logo">Moyro</span>
          <span className="subtitle">Sistema Industrial</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <span className="sidebar-section-label">Principal</span>

        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.name}</span>
            {item.badge !== undefined && (
              <span
                className="nav-item-badge"
                style={{
                  background: item.badgeColor === 'danger' ? 'var(--danger)' : 'var(--warning)',
                }}
              >
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}

        <div className="sidebar-divider" style={{ margin: '0.75rem 0' }} />
        <span className="sidebar-section-label">Sistema</span>

        {bottomItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user-card">
          <div className="user-avatar">M</div>
          <div className="user-info">
            <span className="user-name">Myriam Moyro</span>
            <span className="user-role">Administrador</span>
          </div>
          <ChevronRight size={14} color="var(--text-muted)" />
        </div>
      </div>
    </aside>
  );
};
