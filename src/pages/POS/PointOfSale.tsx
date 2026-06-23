import React, { useState, useRef, useEffect } from 'react';
import { usePOS } from '../../hooks/usePOS';
import { Search, ShoppingCart, User, Trash2, FileText, CheckCircle, Plus, Minus, X, Printer } from 'lucide-react';
import type { Product } from '../../types/inventory';
import { useReactToPrint } from 'react-to-print';
import { QuoteDocument } from './QuoteDocument';

export const PointOfSale: React.FC = () => {
  const {
    cart,
    addToCart,
    updateQuantity,
    clearCart,
    selectedClient,
    setSelectedClient,
    clients,
    products,
    subtotal,
    tax,
    total,
    completeSale
  } = usePOS();

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showClientSelector, setShowClientSelector] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const printComponentRef = useRef<HTMLDivElement>(null);

  // Estado para modal de datos manuales de cotización
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [manualQuoteData, setManualQuoteData] = useState({ name: '', company: '', phone: '', email: '' });

  // Estado para tipo de venta y anticipo
  const [saleType, setSaleType] = useState<'contado' | 'credito'>('contado');
  const [anticipo, setAnticipo] = useState<string>('');

  // Actualizar el tipo de venta por defecto cuando se selecciona un cliente
  useEffect(() => {
    if (selectedClient && selectedClient.type === 'credito') {
      setSaleType('credito');
    } else {
      setSaleType('contado');
    }
  }, [selectedClient]);

  const handlePrintQuote = useReactToPrint({
    contentRef: printComponentRef,
    documentTitle: 'Cotizacion_Moyro',
    onAfterPrint: () => {
      setShowQuoteModal(false);
      alert('Cotización generada exitosamente.');
      // Opcional: limpiar carrito después de cotizar
      // clearCart();
    }
  });

  // Escáner de código de barras simulado y búsqueda rápida
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    const results = products.filter(p => 
      p.id.toLowerCase().includes(term) || 
      p.name.toLowerCase().includes(term) || 
      (p.barcode && p.barcode.includes(term))
    );
    
    // Si la búsqueda coincide exactamente con un código de barras (simulando pistola láser)
    // normalmente un escáner envía Enter al final, podríamos interceptar eso,
    // pero para esta demo auto-agregamos si hay coincidencia exacta de código.
    const exactMatch = products.find(p => p.barcode === searchTerm);
    if (exactMatch && searchTerm.length > 5) {
      // addToCart(exactMatch);
      // setSearchTerm('');
      // No lo auto-agregamos aquí para no romper la escritura, mejor con Enter
    }

    setSearchResults(results.slice(0, 5)); // Mostrar solo primeros 5
  }, [searchTerm, products]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const exactMatch = products.find(p => p.barcode === searchTerm || p.id === searchTerm);
      if (exactMatch) {
        addToCart(exactMatch);
        setSearchTerm('');
        setSearchResults([]);
      } else if (searchResults.length > 0) {
        addToCart(searchResults[0]);
        setSearchTerm('');
        setSearchResults([]);
      }
    }
  };

  const handleProductSelect = (product: Product) => {
    addToCart(product);
    setSearchTerm('');
    setSearchResults([]);
    searchInputRef.current?.focus();
  };

  const handleProcessTransaction = (isQuote: boolean) => {
    if (isQuote) {
      if (!selectedClient) {
        // Mostrar modal para meter datos manualmente si no hay cliente registrado
        setShowQuoteModal(true);
      } else {
        // Imprimir directo si ya hay cliente
        handlePrintQuote();
      }
      return;
    }

    const success = completeSale(isQuote, saleType === 'credito', parseFloat(anticipo) || 0);
    if (success) {
      alert('Venta procesada exitosamente.' + (saleType === 'credito' ? ' Se ha registrado en Cuentas por Cobrar.' : ''));
      setAnticipo('');
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', height: 'calc(100vh - 100px)' }}>

      {/* Panel Izquierdo: Productos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minHeight: 0 }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingCart size={20} color="var(--primary)" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Punto de Venta</h2>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Escanea o busca un producto para agregar</p>
            </div>
          </div>
          
          <div style={{ position: 'relative' }}>
            <div className="search-bar">
              <Search size={16} className="search-icon" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Escanea código o busca por nombre / SKU..."
                className="input-field"
                style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 2.75rem', fontSize: '0.95rem', borderRadius: '999px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                autoFocus
              />
            </div>

            {/* Resultados de búsqueda */}
            {searchResults.length > 0 && (
              <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: 'var(--bg-surface-2)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', zIndex: 50, overflow: 'hidden' }}>
                {searchResults.map((product, idx) => (
                  <div
                    key={product.id}
                    style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderBottom: idx < searchResults.length - 1 ? '1px solid var(--border)' : 'none' }}
                    onClick={() => handleProductSelect(product)}
                    className="hover-bg"
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{product.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SKU: {product.id} · Stock: {product.stock} pzs</div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.95rem' }}>
                      ${product.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Catálogo rápido */}
        <div className="card" style={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: '1rem' }}>Acceso Rápido</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem', overflowY: 'auto' }}>
            {products.slice(0, 8).map(product => (
              <div
                key={product.id}
                style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.875rem', cursor: 'pointer', background: 'var(--bg-surface-2)', transition: 'all var(--transition-fast)' }}
                onClick={() => addToCart(product)}
                className="hover-bg"
              >
                <div style={{ height: '48px', background: 'var(--bg-surface-3)', borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                  SKU
                </div>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.3, marginBottom: '0.35rem', height: '2rem' }}>
                  {product.name}
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>
                  ${product.price.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel Derecho: Carrito */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 0, overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}>
        
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface-2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Cliente</span>
            {selectedClient && (
              <button onClick={() => setSelectedClient(null)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.875rem' }}>
                Quitar
              </button>
            )}
          </div>
          
          {selectedClient ? (
            <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: selectedClient.type === 'credito' ? 'var(--accent-light)' : 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={18} color={selectedClient.type === 'credito' ? 'var(--accent)' : 'var(--primary)'} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{selectedClient.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {selectedClient.type === 'credito' ? `Crédito · Límite $${selectedClient.creditLimit?.toLocaleString('es-MX')}` : 'Contado'}
                </div>
              </div>
            </div>
            
            {selectedClient.type === 'credito' && (
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--bg-base)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>CONDICIÓN DE PAGO</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => setSaleType('contado')}
                    style={{ flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: saleType === 'contado' ? '1px solid var(--primary)' : '1px solid var(--border)', background: saleType === 'contado' ? 'var(--primary-light)' : 'transparent', color: saleType === 'contado' ? 'var(--primary-dark)' : 'var(--text-secondary)', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    Contado
                  </button>
                  <button 
                    onClick={() => setSaleType('credito')}
                    style={{ flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: saleType === 'credito' ? '1px solid var(--accent)' : '1px solid var(--border)', background: saleType === 'credito' ? 'var(--accent-light)' : 'transparent', color: saleType === 'credito' ? 'var(--accent-dark)' : 'var(--text-secondary)', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    A Crédito
                  </button>
                </div>
                
                {saleType === 'credito' && (
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>ANTICIPO INICIAL (OPCIONAL)</span>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>$</span>
                      <input 
                        type="number"
                        placeholder="0.00"
                        value={anticipo}
                        onChange={(e) => setAnticipo(e.target.value)}
                        className="input-field"
                        style={{ width: '100%', paddingLeft: '2rem', fontSize: '0.875rem' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
            </>
          ) : (
            <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.875rem', borderStyle: 'dashed' }} onClick={() => setShowClientSelector(true)}>
              <User size={16} /> Público General — Asignar cliente
            </button>
          )}
        </div>

        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '1rem' }}>
          {cart.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', gap: '0.75rem' }}>
              <ShoppingCart size={48} style={{ opacity: 0.12 }} />
              <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>El carrito está vacío</p>
              <p style={{ fontSize: '0.8rem', textAlign: 'center' }}>Busca o escanea un producto para comenzar</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: '0.75rem', padding: '0.875rem', background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div style={{ flexGrow: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>${item.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })} c/u</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem', flexShrink: 0 }}>
                    <div style={{ fontWeight: 700, color: 'var(--primary)' }}>${(item.price * item.cartQuantity).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'var(--bg-surface-3)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                      <button onClick={() => updateQuantity(item.id, item.cartQuantity - 1)} style={{ width: '26px', height: '26px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Minus size={12} />
                      </button>
                      <span style={{ width: '28px', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600 }}>{item.cartQuantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.cartQuantity + 1)} style={{ width: '26px', height: '26px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border)', background: 'var(--bg-surface-2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <span>Subtotal</span><span>${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <span>IVA (16%)</span><span>${tax.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', fontSize: '1.625rem', fontWeight: 800, fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.04em', color: 'var(--primary)' }}>
            <span>Total</span><span>${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button className="btn btn-outline" disabled={cart.length === 0} onClick={() => handleProcessTransaction(true)} style={{ padding: '0.875rem' }}>
              <FileText size={16} /> Cotizar
            </button>
            <button className="btn btn-accent" disabled={cart.length === 0} onClick={() => handleProcessTransaction(false)} style={{ padding: '0.875rem' }}>
              <CheckCircle size={16} /> Cobrar
            </button>
          </div>
          {cart.length > 0 && (
            <button onClick={clearCart} style={{ width: '100%', marginTop: '0.75rem', padding: '0.4rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.35rem' }}>
              <Trash2 size={13} /> Vaciar carrito
            </button>
          )}
        </div>
      </div>

      {/* Modal de Selector de Cliente */}
      {showClientSelector && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card animate-fade-in" style={{ width: '500px', maxWidth: '90%', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Seleccionar Cliente</h2>
              <button onClick={() => setShowClientSelector(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} color="var(--text-muted)" />
              </button>
            </div>
            
            <div style={{ overflowY: 'auto', flexGrow: 1, paddingRight: '0.5rem' }}>
              {clients.map(client => (
                <div 
                  key={client.id}
                  onClick={() => {
                    setSelectedClient(client);
                    setShowClientSelector(false);
                  }}
                  style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  className="hover-bg"
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{client.name}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{client.email}</div>
                  </div>
                  <span className={`badge ${client.type === 'credito' ? 'badge-warning' : 'badge-success'}`}>
                    {client.type === 'credito' ? 'Crédito' : 'Contado'}
                  </span>
                </div>
              ))}
            </div>
            
            <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => setShowClientSelector(false)}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal de Datos Manuales para Cotización */}
      {showQuoteModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card animate-fade-in" style={{ width: '400px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Datos para Cotización</h2>
              <button onClick={() => setShowQuoteModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} color="var(--text-muted)" />
              </button>
            </div>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              El cliente no está registrado. Ingresa opcionalmente sus datos para que aparezcan en el PDF de la cotización, o selecciona uno existente.
            </p>

            <button 
              className="btn btn-outline" 
              style={{ width: '100%', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', borderStyle: 'dashed' }}
              onClick={() => {
                setShowQuoteModal(false);
                setShowClientSelector(true);
              }}
            >
              <User size={16} /> Buscar cliente en el CRM
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>O captura manual</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Nombre del Cliente (Opcional)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Ej. Juan Pérez"
                  value={manualQuoteData.name}
                  onChange={e => setManualQuoteData({...manualQuoteData, name: e.target.value})}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Empresa (Opcional)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Ej. Constructora ABC"
                  value={manualQuoteData.company}
                  onChange={e => setManualQuoteData({...manualQuoteData, company: e.target.value})}
                />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button className="btn btn-outline" onClick={() => setShowQuoteModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={() => handlePrintQuote()}>
                <Printer size={18} /> Generar PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Componente Oculto para Impresión de Cotización */}
      <QuoteDocument 
        ref={printComponentRef}
        cart={cart}
        subtotal={subtotal}
        tax={tax}
        total={total}
        clientName={selectedClient ? selectedClient.name : (manualQuoteData.name || 'Público General')}
        clientCompany={manualQuoteData.company}
        clientEmail={selectedClient ? selectedClient.email : manualQuoteData.email}
        clientPhone={selectedClient ? selectedClient.phone : manualQuoteData.phone}
      />
    </div>
  );
};
