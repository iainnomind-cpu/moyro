import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Supplier, PurchaseHistory } from '../types/supplier';
import { mockSuppliers, mockPurchaseHistory } from '../mocks/supplierMock';
import { useInventory } from './InventoryContext';

interface PurchaseContextType {
  suppliers: Supplier[];
  purchaseHistory: PurchaseHistory[];
  registerPurchase: (
    productId: string,
    supplierId: string,
    quantity: number,
    unitCost: number,
    invoiceNumber: string
  ) => void;
}

const PurchaseContext = createContext<PurchaseContextType | undefined>(undefined);

export const PurchaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [suppliers] = useState<Supplier[]>(mockSuppliers);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistory[]>(mockPurchaseHistory);
  
  const { products, updateProduct } = useInventory();

  const registerPurchase = (
    productId: string,
    supplierId: string,
    quantity: number,
    unitCost: number,
    invoiceNumber: string
  ) => {
    // 1. Guardar el historial de compra
    const newHistory: PurchaseHistory = {
      id: `PUR-${Math.floor(Math.random() * 100000)}`,
      productId,
      supplierId,
      date: new Date().toISOString().split('T')[0],
      quantity,
      unitCost,
      invoiceNumber
    };
    
    setPurchaseHistory(prev => [newHistory, ...prev]);

    // 2. Sumar al stock del inventario
    const product = products.find(p => p.id === productId);
    if (product) {
      updateProduct(productId, { 
        stock: product.stock + quantity,
        cost: unitCost, // Actualizar último costo
        lastRestockDate: newHistory.date
      });
    }
  };

  return (
    <PurchaseContext.Provider value={{ suppliers, purchaseHistory, registerPurchase }}>
      {children}
    </PurchaseContext.Provider>
  );
};

export const usePurchases = () => {
  const context = useContext(PurchaseContext);
  if (context === undefined) {
    throw new Error('usePurchases must be used within a PurchaseProvider');
  }
  return context;
};
