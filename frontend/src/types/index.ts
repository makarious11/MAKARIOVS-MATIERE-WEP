// ============================================================
// MAKARIOVS & MATIÈRE — TypeScript Types
// ============================================================

export interface ProductImage {
  id: number;
  product_id: number;
  url: string;
  alt_en: string;
  alt_ar: string;
  sort_order: number;
}

export interface ProductVariant {
  id: number;
  product_id?: number;
  name_en?: string;
  name_ar?: string;
  size_ml: number;
  price: number;
  compare_at_price: number | null;
  stock: number;
  sku: string;
  is_default?: boolean;
}

export interface Product {
  id: number;
  slug: string;
  name_en: string;
  name_ar: string;
  tagline_en: string;
  tagline_ar: string;
  description_en: string;
  description_ar: string;
  notes_en: string[];
  notes_ar: string[];
  family_en: string;
  family_ar: string;
  gender: 'masculine' | 'feminine' | 'unisex';
  images: ProductImage[];
  variants: ProductVariant[];
  reviews_count: number;
  reviews_avg: number;
  is_featured: boolean;
  is_new: boolean;
  is_bestseller: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export interface Coupon {
  id: number;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  min_order: number | null;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  variant_id: number;
  product_name_en: string;
  product_name_ar: string;
  size_ml: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface Order {
  id: number;
  user_id: number | null;
  reference: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping_fee: number;
  total: number;
  coupon_code: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  governorate: string;
  address: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: number;
  product_id: number;
  user_id: number | null;
  author_name: string;
  rating: number;
  body_en: string;
  body_ar: string;
  is_approved: boolean;
  created_at: string;
}

export interface ShippingZone {
  id: number;
  governorate: string;
  fee: number;
  estimated_days_min: number;
  estimated_days_max: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  governorate: string | null;
  address: string | null;
  email_verified_at: string | null;
  created_at: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export type Locale = 'en' | 'ar';
