'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { X, Plus } from 'lucide-react'
import { Product } from '@/types'

type ProductFormData = {
  name: string
  slug: string
  description: string
  price: string
  category: 'smartphones' | 'laptops' | 'tablets'
  brand: string
  storage_options: string[]
  specs: { key: string; value: string }[]
  badge: 'New' | 'Sale' | 'Hot' | ''
  in_stock: boolean
}

interface ProductFormProps {
  initialData?: Partial<Product>
  productId?: string
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export default function ProductForm({ initialData, productId }: ProductFormProps) {
  const router = useRouter()
  const isEdit = !!productId

  const [form, setForm] = useState<ProductFormData>({
    name: initialData?.name ?? '',
    slug: initialData?.slug ?? '',
    description: initialData?.description ?? '',
    price: initialData?.price?.toString() ?? '',
    category: initialData?.category ?? 'smartphones',
    brand: initialData?.brand ?? '',
    storage_options: initialData?.storage_options ?? [],
    specs: Object.entries(initialData?.specs ?? {}).map(([key, value]) => ({ key, value })),
    badge: initialData?.badge ?? '',
    in_stock: initialData?.in_stock ?? true,
  })
  const [storageInput, setStorageInput] = useState('')
  const [loading, setLoading] = useState(false)

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value
    setForm((f) => ({ ...f, name, slug: slugify(name) }))
  }

  function addStorage() {
    const val = storageInput.trim()
    if (val && !form.storage_options.includes(val)) {
      setForm((f) => ({ ...f, storage_options: [...f.storage_options, val] }))
    }
    setStorageInput('')
  }

  function removeStorage(s: string) {
    setForm((f) => ({ ...f, storage_options: f.storage_options.filter((x) => x !== s) }))
  }

  function addSpec() {
    setForm((f) => ({ ...f, specs: [...f.specs, { key: '', value: '' }] }))
  }

  function updateSpec(index: number, field: 'key' | 'value', val: string) {
    setForm((f) => {
      const specs = [...f.specs]
      specs[index] = { ...specs[index], [field]: val }
      return { ...f, specs }
    })
  }

  function removeSpec(index: number) {
    setForm((f) => ({ ...f, specs: f.specs.filter((_, i) => i !== index) }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const specsObj = form.specs.reduce<Record<string, string>>((acc, { key, value }) => {
      if (key.trim()) acc[key.trim()] = value
      return acc
    }, {})

    const body = {
      name: form.name,
      slug: form.slug,
      description: form.description || undefined,
      price: parseFloat(form.price),
      category: form.category,
      brand: form.brand,
      storage_options: form.storage_options,
      specs: specsObj,
      badge: form.badge || null,
      in_stock: form.in_stock,
    }

    const url = isEdit ? `/api/admin/products/${productId}` : '/api/admin/products'
    const method = isEdit ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const data = await res.json()
      toast.error(data.error || 'Failed to save product')
      setLoading(false)
      return
    }

    toast.success(isEdit ? 'Product updated!' : 'Product created!')
    router.push('/admin/products')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
          <input
            required
            value={form.name}
            onChange={handleNameChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
          <input
            required
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            pattern="[a-z0-9-]+"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
          <select
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ProductFormData['category'] }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="smartphones">Smartphones</option>
            <option value="laptops">Laptops</option>
            <option value="tablets">Tablets</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
          <input
            required
            value={form.brand}
            onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
            placeholder="Apple, Samsung, Dell…"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price (€) *</label>
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Badge</label>
          <select
            value={form.badge}
            onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value as ProductFormData['badge'] }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">None</option>
            <option value="New">New</option>
            <option value="Sale">Sale</option>
            <option value="Hot">Hot</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Storage Options *</label>
        <div className="flex gap-2 mb-2">
          <input
            value={storageInput}
            onChange={(e) => setStorageInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addStorage())}
            placeholder="e.g. 256GB"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={addStorage}
            className="bg-gray-100 text-gray-700 rounded-lg px-3 py-2 text-sm hover:bg-gray-200 transition"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {form.storage_options.map((s) => (
            <span key={s} className="flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-md px-2 py-1 text-sm">
              {s}
              <button type="button" onClick={() => removeStorage(s)} className="hover:text-red-500">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Specs</label>
          <button
            type="button"
            onClick={addSpec}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <Plus size={14} /> Add Row
          </button>
        </div>
        <div className="space-y-2">
          {form.specs.map((spec, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={spec.key}
                onChange={(e) => updateSpec(i, 'key', e.target.value)}
                placeholder="Spec name"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                value={spec.value}
                onChange={(e) => updateSpec(i, 'value', e.target.value)}
                placeholder="Spec value"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => removeSpec(i)}
                className="text-gray-400 hover:text-red-500 px-2"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          rows={4}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={form.in_stock}
          onClick={() => setForm((f) => ({ ...f, in_stock: !f.in_stock }))}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
            form.in_stock ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
              form.in_stock ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <span className="text-sm font-medium text-gray-700">In Stock</span>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white rounded-lg px-6 py-2.5 text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60"
        >
          {loading ? 'Saving…' : isEdit ? 'Update Product' : 'Create Product'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/products')}
          className="border border-gray-300 text-gray-700 rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-gray-50 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
