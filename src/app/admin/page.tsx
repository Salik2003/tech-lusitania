import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import Link from 'next/link'
import { Package, Tag, Ticket, MessageCircle } from 'lucide-react'

async function getStats() {
  const admin = createSupabaseAdminClient()
  const [products, categories, coupons, enquiries, recentEnquiries] = await Promise.all([
    admin.from('products').select('id', { count: 'exact', head: true }),
    admin.from('categories').select('id', { count: 'exact', head: true }),
    admin.from('coupons').select('id', { count: 'exact', head: true }).eq('active', true),
    admin.from('enquiries').select('id', { count: 'exact', head: true }),
    admin.from('enquiries').select('id, product_name, customer_name, created_at')
      .order('created_at', { ascending: false }).limit(10),
  ])
  return {
    products: products.count ?? 0,
    categories: categories.count ?? 0,
    coupons: coupons.count ?? 0,
    enquiries: enquiries.count ?? 0,
    recentEnquiries: recentEnquiries.data ?? [],
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()
  const cards = [
    { label: 'Total Products', value: stats.products, icon: Package, href: '/admin/products' },
    { label: 'Total Categories', value: stats.categories, icon: Tag, href: '/admin/categories' },
    { label: 'Active Coupons', value: stats.coupons, icon: Ticket, href: '/admin/coupons' },
    { label: 'Total Enquiries', value: stats.enquiries, icon: MessageCircle, href: '#' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <div className="flex gap-3">
          <Link href="/admin/products/new" className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition">
            Add New Product
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 hover:shadow-sm transition">
            <div className="bg-blue-50 rounded-lg p-3"><Icon size={22} className="text-blue-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Enquiries</h2>
        {stats.recentEnquiries.length === 0 ? (
          <p className="text-sm text-gray-500">No enquiries yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 pr-4 font-medium text-gray-500">Product</th>
                <th className="text-left py-2 pr-4 font-medium text-gray-500">Customer</th>
                <th className="text-left py-2 font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentEnquiries.map((e: { id: string; product_name?: string; customer_name?: string; created_at: string }) => (
                <tr key={e.id} className="border-b border-gray-50">
                  <td className="py-2.5 pr-4 text-gray-900">{e.product_name || '—'}</td>
                  <td className="py-2.5 pr-4 text-gray-600">{e.customer_name || '—'}</td>
                  <td className="py-2.5 text-gray-500">{new Date(e.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
