import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { createSupabaseServerClient } from '@/lib/supabase'
import { fileTypeFromBuffer } from 'file-type'
import { randomUUID } from 'crypto'

const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const uploadCounts = new Map<string, { count: number; reset: number }>()
function checkRateLimit(userId: string) {
  const now = Date.now()
  const entry = uploadCounts.get(userId)
  if (!entry || entry.reset < now) { uploadCounts.set(userId, { count: 1, reset: now + 60_000 }); return true }
  if (entry.count >= 20) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  const auth = await createSupabaseServerClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!checkRateLimit(user.id)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': '60' } })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const productId = formData.get('productId') as string | null
  if (!file || !productId) return NextResponse.json({ error: 'Missing file or productId' }, { status: 400 })
  if (file.size > MAX_SIZE) return NextResponse.json({ error: 'File exceeds 5MB limit' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const detected = await fileTypeFromBuffer(buffer)
  if (!detected || !ALLOWED_TYPES.includes(detected.mime)) {
    return NextResponse.json({ error: 'Invalid file type. Only JPG, PNG, WebP allowed.' }, { status: 400 })
  }

  const filename = `${randomUUID()}.${detected.ext}`
  const storagePath = `products/${productId}/${filename}`
  const admin = createSupabaseAdminClient()

  const { error: uploadError } = await admin.storage
    .from('product-images')
    .upload(storagePath, buffer, { contentType: detected.mime, upsert: false })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: { publicUrl } } = admin.storage.from('product-images').getPublicUrl(storagePath)

  const { count } = await admin
    .from('product_images')
    .select('id', { count: 'exact', head: true })
    .eq('product_id', productId)

  const { data: image, error: insertError } = await admin
    .from('product_images')
    .insert({ product_id: productId, url: publicUrl, is_primary: count === 0, sort_order: count ?? 0 })
    .select().single()

  if (insertError) {
    await admin.storage.from('product-images').remove([storagePath])
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ image }, { status: 201 })
}
