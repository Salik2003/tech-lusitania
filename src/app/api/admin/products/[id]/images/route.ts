import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { createSupabaseServerClient } from '@/lib/supabase'

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const admin = createSupabaseAdminClient()
  const { data: images, error } = await admin
    .from('product_images').select('*').eq('product_id', id).order('sort_order')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ images })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params
  const auth = await createSupabaseServerClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const admin = createSupabaseAdminClient()

  if (body.action === 'set_primary') {
    await admin.from('product_images').update({ is_primary: false }).eq('product_id', id)
    await admin.from('product_images').update({ is_primary: true }).eq('id', body.imageId)
    return NextResponse.json({ success: true })
  }

  if (body.action === 'reorder') {
    await Promise.all(
      body.order.map((imgId: string, idx: number) =>
        admin.from('product_images').update({ sort_order: idx }).eq('id', imgId)
      )
    )
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id: _productId } = await params
  const auth = await createSupabaseServerClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { imageId } = await req.json()
  const admin = createSupabaseAdminClient()

  const { data: image } = await admin.from('product_images').select('url').eq('id', imageId).single()
  if (image) {
    const path = image.url.split('/product-images/')[1]
    if (path) await admin.storage.from('product-images').remove([path])
  }

  const { error } = await admin.from('product_images').delete().eq('id', imageId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
