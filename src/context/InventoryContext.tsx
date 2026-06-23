import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Product } from '../types/inventory';
import { mockProducts } from '../mocks/inventoryMock';

interface InventoryContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  importProducts: (newProducts: Product[]) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(mockProducts);

  const addProduct = (newProductData: Omit<Product, 'id'>) => {
    // Generar un SKU interno sencillo (ej. MANG-005)
    const categoryPrefix = newProductData.category.substring(0, 4).toUpperCase();
    const sequence = (products.length + 1).toString().padStart(3, '0');
    const id = `${categoryPrefix}-${sequence}`;
    
    const newProduct: Product = {
      ...newProductData,
      id
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: string, updatedData: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedData } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const importProducts = (newProducts: Product[]) => {
    // En un escenario real, esto validaría si existen o actualizaría el stock
    setProducts(prev => [...prev, ...newProducts]);
  };

  return (
    <InventoryContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, importProducts }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within a InventoryProvider');
  }
  return context;
};
