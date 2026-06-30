'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import {
  LayoutDashboard, Tag, Gift, FolderTree, Clock,
  ChevronLeft, ChevronRight, Shield
} from 'lucide-react'

const adminNav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/vouchers', label: 'Voucher', icon: Tag },
  { href: '/admin/promos', label: 'Promo', icon: Gift },
  { href: '/admin/categories', label: 'Kategori', icon: FolderTree },
  { href: '/admin/time-simulation', label: 'Time Simulation', icon: Clock },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      <Navbar onSearch={() => {}} />

      <div className="flex-1 flex pt-20">
        {/* Sidebar */}
        <aside className={`bg-white border-r border-slate-200 min-h-[calc(100vh-5rem)] transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-white" />
              </div>
              {!collapsed && (
                <div>
                  <h2 className="font-bold text-slate-800">Admin Panel</h2>
                  <p className="text-xs text-slate-500">Seapedia Management</p>
                </div>
              )}
            </div>
          </div>

          <nav className="p-4 space-y-2">
            {adminNav.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/30'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span className="font-medium">{item.label}</span>}
                </Link>
              )
            })}
          </nav>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute bottom-4 right-4 p-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-5 h-5 text-slate-600" /> : <ChevronLeft className="w-5 h-5 text-slate-600" />}
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>

      <Footer />
    </div>
  )
}