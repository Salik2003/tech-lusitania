import ProductForm from '@/components/admin/ProductForm'

export default function NewProductPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Add New Product</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <ProductForm />
      </div>
    </div>
  )
}
