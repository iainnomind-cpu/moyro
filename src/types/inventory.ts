export interface Location {
  anaquel: string;
  fila: string;
  caja_cajon: string;
}

export interface Product {
  id: string; // Internal SKU
  name: string;
  category: string;
  description: string;
  
  // Pricing
  price: number;
  cost: number;
  
  // Inventory
  stock: number;
  minStock: number;
  location: Location;
  
  // Barcode / QR
  barcode?: string;
  
  // Supplier
  supplierId?: string;
  lastRestockDate?: string;
}
