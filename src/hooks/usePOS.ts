import { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useClients } from '../context/ClientContext';
import { useReceivables } from '../context/ReceivableContext';
import type { Product } from '../types/inventory';
import type { Client } from '../types/client';

export interface CartItem extends Product {
  cartQuantity: number;
}

export const usePOS = () => {
  const { products, updateProduct } = useInventory();
  const { clients } = useClients();
  const { registerSaleDebt } = useReceivables();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, cartQuantity: item.cartQuantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, cartQuantity: quantity }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, cartQuantity: quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedClient(null);
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.cartQuantity,
    0
  );
  // Asumiendo un 16% de IVA estándar, aunque no emitamos CFDI, es útil para control
  const tax = subtotal * 0.16;
  const total = subtotal + tax;

  const completeSale = (isQuote: boolean = false, isCreditSale: boolean = false, anticipo: number = 0) => {
    if (cart.length === 0) return false;

    if (!isQuote) {
      // Si es una venta real, descontar inventario
      cart.forEach((item) => {
        const newStock = Math.max(0, item.stock - item.cartQuantity);
        updateProduct(item.id, { stock: newStock });
      });

      // Registrar en Cuentas por Cobrar si es cliente a crédito Y eligió pago a crédito
      if (selectedClient && selectedClient.type === 'credito' && isCreditSale) {
        registerSaleDebt(selectedClient.id, total, 'TICKET-AUTO', anticipo);
      }

      // TODO: Guardar transacción en el historial del cliente (Fase 1 extendida)
    }

    clearCart();
    return true;
  };

  return {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    selectedClient,
    setSelectedClient,
    clients,
    products,
    subtotal,
    tax,
    total,
    completeSale,
  };
};
