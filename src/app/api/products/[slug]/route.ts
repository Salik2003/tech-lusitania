import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'

interface Params {
  params: Promise<{ slug: string }>
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: product, error } = await supabase
    .from('products')
    .select('*, images:product_images(id, url, alt, is_primary, sort_order)')
    .eq('slug', slug)
    .single()

  if (error || !product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  return NextResponse.json({ product })
}
