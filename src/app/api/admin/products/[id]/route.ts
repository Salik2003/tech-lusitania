import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { createSupabaseServerClient } from '@/lib/supabase'
import { productSchema } from '@/lib/validations'

interface Params { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params
  const auth = await createSupabaseServerClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = productSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const admin = createSupabaseAdminClient()
  const { data: old } = await admin.from('products').select().eq('id', id).single()
  const { data: product, error } = await admin.from('products').update(parsed.data).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await admin.from('admin_audit_log').insert({
    admin_id: user.id, action: 'UPDATE', table_name: 'products',
    record_id: id, old_values: old, new_values: parsed.data,
  })
  return NextResponse.json({ product })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const auth = await createSupabaseServerClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createSupabaseAdminClient()
  const { data: images } = await admin.from('product_images').select('url').eq('product_id', id)

  if (images?.length) {
    const paths = images.map((img: { url: string }) => img.url.split('/product-images/')[1]).filter(Boolean)
    if (paths.length) await admin.storage.from('product-images').remove(paths)
  }

  const { error } = await admin.from('products').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await admin.from('admin_audit_log').insert({
    admin_id: user.id, action: 'DELETE', table_name: 'products', record_id: id,
  })
  return NextResponse.json({ success: true })
}
