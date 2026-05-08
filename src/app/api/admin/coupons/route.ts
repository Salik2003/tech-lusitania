import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { createSupabaseServerClient } from '@/lib/supabase'
import { couponSchema } from '@/lib/validations'

export async function GET() {
  const admin = createSupabaseAdminClient()
  const { data: coupons, error } = await admin.from('coupons').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ coupons })
}

export async function POST(req: NextRequest) {
  const auth = await createSupabaseServerClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = couponSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const admin = createSupabaseAdminClient()
  const { count } = await admin.from('coupons').select('id', { count: 'exact', head: true }).eq('code', parsed.data.code)
  if (count && count > 0) return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 })

  const { data: coupon, error } = await admin.from('coupons').insert(parsed.data).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ coupon }, { status: 201 })
}
