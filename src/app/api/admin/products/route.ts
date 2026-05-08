import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { createSupabaseServerClient } from '@/lib/supabase'
import { productSchema } from '@/lib/validations'

export async function GET() {
  const admin = createSupabaseAdminClient()
  const { data: products, error } = await admin
    .from('products')
    .select('*, images:product_images(id, url, alt, is_primary, sort_order)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ products })
}

export async function POST(req: NextRequest) {
  const auth = await createSupabaseServerClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = productSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const admin = createSupabaseAdminClient()
  const { data: product, error } = await admin.from('products').insert(parsed.data).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await admin.from('admin_audit_log').insert({
    admin_id: user.id, action: 'CREATE', table_name: 'products',
    record_id: product.id, new_values: parsed.data,
  })

  return NextResponse.json({ product }, { status: 201 })
}
