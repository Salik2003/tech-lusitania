-- SmartTech Supabase Schema
-- Safe to run multiple times — all statements are idempotent

-- 1. TABLES

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon_url TEXT,
  display_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('smartphones','laptops','tablets')),
  brand TEXT NOT NULL,
  storage_options TEXT[] NOT NULL DEFAULT '{}',
  specs JSONB DEFAULT '{}',
  badge TEXT CHECK (badge IN ('New','Sale','Hot')),
  in_stock BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent','fixed')),
  discount_value NUMERIC(10,2) NOT NULL,
  min_order NUMERIC(10,2),
  active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT,
  customer_name TEXT,
  whatsapp_number TEXT,
  storage TEXT,
  price NUMERIC(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. ROW LEVEL SECURITY

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first so this script is safe to re-run
DROP POLICY IF EXISTS "Public can read categories" ON categories;
DROP POLICY IF EXISTS "Public can read products" ON products;
DROP POLICY IF EXISTS "Public can read product_images" ON product_images;
DROP POLICY IF EXISTS "Public can read active coupons" ON coupons;
DROP POLICY IF EXISTS "Admin full access categories" ON categories;
DROP POLICY IF EXISTS "Admin full access products" ON products;
DROP POLICY IF EXISTS "Admin full access product_images" ON product_images;
DROP POLICY IF EXISTS "Admin full access coupons" ON coupons;
DROP POLICY IF EXISTS "Admin read delete enquiries" ON enquiries;
DROP POLICY IF EXISTS "Admin delete enquiries" ON enquiries;
DROP POLICY IF EXISTS "Service insert enquiries" ON enquiries;
DROP POLICY IF EXISTS "Admin read audit log" ON admin_audit_log;
DROP POLICY IF EXISTS "Service insert audit log" ON admin_audit_log;

-- Public SELECT policies
CREATE POLICY "Public can read categories" ON categories FOR SELECT TO anon USING (true);
CREATE POLICY "Public can read products" ON products FOR SELECT TO anon USING (true);
CREATE POLICY "Public can read product_images" ON product_images FOR SELECT TO anon USING (true);
CREATE POLICY "Public can read active coupons" ON coupons FOR SELECT TO anon USING (active = true);

-- Authenticated (admin) full access policies
CREATE POLICY "Admin full access categories" ON categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access products" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access product_images" ON product_images FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access coupons" ON coupons FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin read delete enquiries" ON enquiries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin delete enquiries" ON enquiries FOR DELETE TO authenticated USING (true);
CREATE POLICY "Service insert enquiries" ON enquiries FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Admin read audit log" ON admin_audit_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service insert audit log" ON admin_audit_log FOR INSERT TO authenticated WITH CHECK (true);

-- 3. SEED DATA (safe to re-run — ON CONFLICT does nothing if already exists)

INSERT INTO categories (name, slug, display_order) VALUES
  ('Smart Phones', 'smartphones', 1),
  ('Laptops', 'laptops', 2),
  ('Tablets', 'tablets', 3)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, price, category, brand, badge, in_stock, storage_options) VALUES
  ('iPhone 17 Pro Max', 'iphone-17-pro-max', 1200, 'smartphones', 'Apple', 'New', true, ARRAY['256GB','512GB','1TB']),
  ('iPhone 17 Pro', 'iphone-17-pro', 1000, 'smartphones', 'Apple', 'New', true, ARRAY['128GB','256GB','512GB']),
  ('iPhone 16 Pro Max', 'iphone-16-pro-max', 900, 'smartphones', 'Apple', 'New', true, ARRAY['256GB','512GB','1TB']),
  ('iPhone 16 Pro', 'iphone-16-pro', 700, 'smartphones', 'Apple', NULL, true, ARRAY['128GB','256GB','512GB']),
  ('iPhone 15 Pro Max', 'iphone-15-pro-max', 660, 'smartphones', 'Apple', NULL, true, ARRAY['256GB','512GB']),
  ('Samsung Galaxy Z Fold 7', 'samsung-galaxy-z-fold-7', 1000, 'smartphones', 'Samsung', 'New', true, ARRAY['256GB','512GB'])
ON CONFLICT (slug) DO NOTHING;

-- 4. NEXT STEPS (do these manually in Supabase Dashboard)
-- Storage: Create bucket named 'product-images', set to Public
-- Auth: Authentication > Users > Add User (your admin email + password)
