import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { notFound } from 'next/navigation'
import ProductForm from '@/components/admin/ProductForm'

interface Props { params: Promise<{ id: string }> }

export default async function EditProductPage({ params }: Props) {
  const { id } = await params
  const admin = createSupabaseAdminClient()
  const { data: product } = await admin.from('products').select('*').eq('id', id).single()
  if (!product) notFound()

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Edit Product</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <ProductForm initialData={product} productId={id} />
      </div>
    </div>
  )
}
