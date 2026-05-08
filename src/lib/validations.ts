import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  description: z.string().optional(),
  price: z.number().positive('Price must be a positive number'),
  category: z.enum(['smartphones', 'laptops', 'tablets']),
  brand: z.string().min(1, 'Brand is required'),
  storage_options: z.array(z.string()).min(1, 'At least one storage option required'),
  specs: z.record(z.string(), z.string()).optional(),
  badge: z.enum(['New', 'Sale', 'Hot']).nullable().optional(),
  in_stock: z.boolean(),
})

export const couponSchema = z.object({
  code: z
    .string()
    .min(4, 'Code must be at least 4 characters')
    .max(20, 'Code must be at most 20 characters')
    .regex(/^[A-Z0-9]+$/, 'Code must be uppercase letters and numbers only'),
  discount_type: z.enum(['percent', 'fixed']),
  discount_value: z.number().positive('Discount value must be positive'),
  min_order: z.number().nonnegative().optional(),
  expires_at: z.string().optional().nullable(),
  active: z.boolean(),
})

export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
  honeypot: z.string().max(0, 'Bot detected').optional(),
})

export const couponValidateSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  cart_total: z.number().positive('Cart total must be positive'),
})

export type ProductInput = z.infer<typeof productSchema>
export type CouponInput = z.infer<typeof couponSchema>
export type ContactInput = z.infer<typeof contactSchema>
export type CouponValidateInput = z.infer<typeof couponValidateSchema>
