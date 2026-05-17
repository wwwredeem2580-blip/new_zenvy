export type AppState = 'SPLASH' | 'ONBOARDING' | 'OTP' | 'STORE_DETAILS' | 'CONGRATULATIONS' | 'DASHBOARD';

export interface ProductVariant {
  id: string;
  color: string;
  ram: string;
  storage: string;
  quantity: number;
  buyingPrice: number;
  sellingPrice: number;
  image?: string;
  sku?: string;
}


export interface ProductFormData {
  name: string;
  brand: string;
  description: string;
  variants: ProductVariant[];
  lowStockThreshold: number;
}

export interface Product {
  id: number | string;
  name: string;
  stock: number;
  status: string;
  image: string;
  brand?: string;
  variants?: ProductVariant[];
  lowStockThreshold?: number;
}

