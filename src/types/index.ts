export interface Product {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  category: 'smartphones' | 'laptops' | 'tablets'
  brand: string
  storage_options: string[]
  specs?: Record<string, string>
  badge?: 'New' | 'Sale' | 'Hot' | null
  in_stock: boolean
  created_at: string
  images?: ProductImage[]
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  alt?: string
  is_primary: boolean
  sort_order: number
}

export interface Category {
  id: string
  name: string
  slug: string
  icon_url?: string
  display_order: number
}

export interface Coupon {
  id: string
  code: string
  discount_type: 'percent' | 'fixed'
  discount_value: number
  min_order?: number
  active: boolean
  expires_at?: string
}

export interface CartItem {
  product_id: string
  product_name: string
  slug: string
  image_url?: string
  price: number
  storage: string
  quantity: number
}

export interface Enquiry {
  id: string
  product_id?: string
  product_name?: string
  customer_name?: string
  whatsapp_number?: string
  storage?: string
  price?: number
  created_at: string
}

export interface AdminAuditLog {
  id: string
  admin_id: string
  action: string
  table_name: string
  record_id?: string
  old_values?: Record<string, unknown>
  new_values?: Record<string, unknown>
  created_at: string
}
