'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react'
import { Category } from '@/types'

interface CategoryFormData {
  name: string
  slug: string
  icon_url: string
  display_order: string
}

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState<CategoryFormData>({ name: '', slug: '', icon_url: '', display_order: '' })

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((r) => r.json())
      .then((d) => { setCategories(d.categories ?? []); setLoading(false) })
  }, [])

  function startEdit(cat: Category) {
    setEditing(cat.id)
    setForm({ name: cat.name, slug: cat.slug, icon_url: cat.icon_url ?? '', display_order: cat.display_order.toString() })
    setAdding(false)
  }

  function startAdd() {
    setAdding(true)
    setEditing(null)
    setForm({ name: '', slug: '', icon_url: '', display_order: '' })
  }

  async function handleSave(categoryId?: string) {
    const body = {
      name: form.name,
      slug: form.slug,
      icon_url: form.icon_url || undefined,
      display_order: parseInt(form.display_order) || 0,
    }

    const res = await fetch(
      categoryId ? `/api/admin/categories/${categoryId}` : '/api/admin/categories',
      {
        method: categoryId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    )

    if (res.ok) {
      const data = await res.json()
      if (categoryId) {
        setCategories((prev) => prev.map((c) => (c.id === categoryId ? data.category : c)))
      } else {
        setCategories((prev) => [...prev, data.category])
      }
      toast.success(categoryId ? 'Category updated' : 'Category created')
      setEditing(null)
      setAdding(false)
    } else {
      const data = await res.json()
      toast.error(data.error || 'Failed to save category')
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setCategories((prev) => prev.filter((c) => c.id !== id))
      toast.success('Category deleted')
    } else {
      const data = await res.json()
      toast.error(data.error || 'Failed to delete category')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Categories</h1>
        <button
          onClick={startAdd}
          className="flex items-center gap-2 bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 text-sm">Loading…</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Slug</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Order</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {adding && (
                <tr className="border-b border-blue-100 bg-blue-50">
                  <td className="py-2 px-4">
                    <input
                      autoFocus
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))}
                      placeholder="Category name"
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input
                      value={form.slug}
                      onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="number"
                      value={form.display_order}
                      onChange={(e) => setForm((f) => ({ ...f, display_order: e.target.value }))}
                      className="w-20 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleSave()} className="p-1.5 text-green-600 hover:text-green-700">
                        <Check size={16} />
                      </button>
                      <button onClick={() => setAdding(false)} className="p-1.5 text-gray-400 hover:text-red-500">
                        <X size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )}
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    {editing === cat.id ? (
                      <input
                        autoFocus
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="font-medium text-gray-900">{cat.name}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-gray-600">{cat.slug}</td>
                  <td className="py-3 px-4 text-gray-600">{cat.display_order}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      {editing === cat.id ? (
                        <>
                          <button onClick={() => handleSave(cat.id)} className="p-1.5 text-green-600 hover:text-green-700">
                            <Check size={16} />
                          </button>
                          <button onClick={() => setEditing(null)} className="p-1.5 text-gray-400 hover:text-red-500">
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(cat)} className="p-1.5 text-gray-400 hover:text-blue-600 transition">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-gray-400 hover:text-red-600 transition">
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && categories.length === 0 && !adding && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500 text-sm">No categories yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
