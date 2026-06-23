export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  leadTimeDays: number; // Tiempos de entrega promedio
}

export interface PurchaseHistory {
  id: string;
  productId: string;
  supplierId: string;
  date: string;
  quantity: number;
  unitCost: number;
  invoiceNumber: string;
}
