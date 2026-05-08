'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Trash2, X } from 'lucide-react'
import { Coupon } from '@/types'

interface CouponFormData {
  code: string
  discount_type: 'percent' | 'fixed'
  discount_value: string
  min_order: string
  expires_at: string
  active: boolean
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CouponFormData>({
    code: '',
    discount_type: 'percent',
    discount_value: '',
    min_order: '',
    expires_at: '',
    active: true,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/coupons')
      .then((r) => r.json())
      .then((d) => { setCoupons(d.coupons ?? []); setLoading(false) })
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const body = {
      code: form.code.toUpperCase(),
      discount_type: form.discount_type,
      discount_value: parseFloat(form.discount_value),
      min_order: form.min_order ? parseFloat(form.min_order) : undefined,
      expires_at: form.expires_at || null,
      active: form.active,
    }

    const res = await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      const data = await res.json()
      setCoupons((prev) => [...prev, data.coupon])
      toast.success('Coupon created')
      setShowForm(false)
      setForm({ code: '', discount_type: 'percent', discount_value: '', min_order: '', expires_at: '', active: true })
    } else {
      const data = await res.json()
      toast.error(data.error || 'Failed to create coupon')
    }

    setSaving(false)
  }

  async function toggleActive(id: string, active: boolean) {
    const res = await fetch(`/api/admin/coupons/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !active }),
    })
    if (res.ok) {
      setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, active: !active } : c)))
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setCoupons((prev) => prev.filter((c) => c.id !== id))
      toast.success('Coupon deleted')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Coupons</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition"
        >
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">New Coupon</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
              <input
                required
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="SAVE10"
                pattern="[A-Z0-9]{4,20}"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type *</label>
              <select
                value={form.discount_type}
                onChange={(e) => setForm((f) => ({ ...f, discount_type: e.target.value as 'percent' | 'fixed' }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="percent">Percentage (%)</option>
                <option value="fixed">Fixed Amount (€)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Value * {form.discount_type === 'percent' ? '(%)' : '(€)'}
              </label>
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={form.discount_value}
                onChange={(e) => setForm((f) => ({ ...f, discount_value: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Value (€)</label>
              <input
                type="number"
                min="0"
                value={form.min_order}
                onChange={(e) => setForm((f) => ({ ...f, min_order: e.target.value }))}
                placeholder="Optional"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
              <input
                type="date"
                value={form.expires_at}
                onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <button
                type="button"
                role="switch"
                aria-checked={form.active}
                onClick={() => setForm((f) => ({ ...f, active: !f.active }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${form.active ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${form.active ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className="text-sm font-medium text-gray-700">Active</span>
            </div>

            <div className="sm:col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white rounded-lg px-6 py-2.5 text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60"
              >
                {saving ? 'Creating…' : 'Create Coupon'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="border border-gray-300 text-gray-700 rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 text-sm">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Code</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Value</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Min Order</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Expires</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Active</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500 text-sm">No coupons yet.</td>
                  </tr>
                ) : (
                  coupons.map((coupon) => (
                    <tr key={coupon.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono font-semibold text-gray-900">{coupon.code}</td>
                      <td className="py-3 px-4 capitalize text-gray-600">{coupon.discount_type}</td>
                      <td className="py-3 px-4 text-gray-900">
                        {coupon.discount_type === 'percent' ? `${coupon.discount_value}%` : `€${coupon.discount_value}`}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {coupon.min_order ? `€${coupon.min_order}` : '—'}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleActive(coupon.id, coupon.active)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${coupon.active ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition ${coupon.active ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => handleDelete(coupon.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
