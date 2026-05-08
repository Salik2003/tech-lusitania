import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { couponValidateSchema } from '@/lib/validations'

// Simple in-memory rate limiter
const rateLimits = new Map<string, { count: number; reset: number }>()

function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimits.get(ip)
  if (!entry || entry.reset < now) {
    rateLimits.set(ip, { count: 1, reset: now + 60_000 })
    return true
  }
  if (entry.count >= 10) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, {
      status: 429,
      headers: { 'Retry-After': '60' },
    })
  }

  const body = await req.json()
  const parsed = couponValidateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { code, cart_total } = parsed.data
  const supabase = await createSupabaseServerClient()

  const { data: coupon } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('active', true)
    .single()

  if (!coupon) {
    return NextResponse.json({ error: 'Invalid or expired coupon code' }, { status: 400 })
  }

  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Coupon has expired' }, { status: 400 })
  }

  if (coupon.min_order && cart_total < coupon.min_order) {
    return NextResponse.json(
      { error: `Minimum order of €${coupon.min_order} required` },
      { status: 400 }
    )
  }

  const discount =
    coupon.discount_type === 'percent'
      ? (cart_total * coupon.discount_value) / 100
      : coupon.discount_value

  return NextResponse.json({
    valid: true,
    discount: Math.min(discount, cart_total),
    code: coupon.code,
    discount_type: coupon.discount_type,
    discount_value: coupon.discount_value,
  })
}
