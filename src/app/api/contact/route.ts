import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { contactSchema } from '@/lib/validations'

// Rate limiter: 3 per 10 minutes per IP
const contactLimits = new Map<string, { count: number; reset: number }>()

function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = contactLimits.get(ip)
  if (!entry || entry.reset < now) {
    contactLimits.set(ip, { count: 1, reset: now + 10 * 60_000 })
    return true
  }
  if (entry.count >= 3) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests. Try again later.' }, {
      status: 429,
      headers: { 'Retry-After': '600' },
    })
  }

  const body = await req.json()
  const parsed = contactSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  // Honeypot check
  if (parsed.data.honeypot) {
    return NextResponse.json({ success: true })
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from('enquiries').insert({
    customer_name: parsed.data.name,
    created_at: new Date().toISOString(),
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
