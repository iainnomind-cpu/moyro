import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { ClientsList } from './pages/Clients/ClientsList';
import { ClientDetail } from './pages/Clients/ClientDetail';
import { ClientProvider } from './context/ClientContext';
import { InventoryList } from './pages/Inventory/InventoryList';
import { ProductDetail } from './pages/Inventory/ProductDetail';
import { PointOfSale } from './pages/POS/PointOfSale';
import { Purchases } from './pages/Purchases/Purchases';
import { ReceivablesList } from './pages/Receivables/ReceivablesList';
import { Finance } from './pages/Finance/Finance';
import { InventoryProvider } from './context/InventoryContext';
import { PurchaseProvider } from './context/PurchaseContext';
import { ReceivableProvider } from './context/ReceivableContext';
import { FinanceProvider } from './context/FinanceContext';

function App() {
  return (
    <FinanceProvider>
      <InventoryProvider>
        <PurchaseProvider>
          <ClientProvider>
            <ReceivableProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    
                    {/* Clientes */}
                    <Route path="clients" element={<ClientsList />} />
                    <Route path="clients/:id" element={<ClientDetail />} />

                    {/* Inventario */}
                    <Route path="inventory" element={<InventoryList />} />
                    <Route path="inventory/:id" element={<ProductDetail />} />
                    
                    {/* Punto de Venta (M1) */}
                    <Route path="pos" element={<PointOfSale />} />
                    
                    {/* Compras (M3) */}
                    <Route path="purchases" element={<Purchases />} />
                    
                    {/* Cuentas por Cobrar (M4) */}
                    <Route path="receivables" element={<ReceivablesList />} />
                    
                    {/* Finanzas & Flujo de Caja (M7) */}
                    <Route path="finance" element={<Finance />} />
                    
                    {/* Próximamente */}
                    <Route path="settings" element={<div className="card">Configuración (Próximamente)</div>} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </ReceivableProvider>
          </ClientProvider>
        </PurchaseProvider>
      </InventoryProvider>
    </FinanceProvider>
  );
}

export default App;
