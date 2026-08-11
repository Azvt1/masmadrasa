'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, CalendarCheck, Library, BarChart2, CreditCard, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types/app.types'

interface AdminSidebarProps {
  profile: Profile
}

const navItems = [
  { href: '/admin/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/admin/users',      label: 'Users',      icon: Users },
  { href: '/admin/attendance', label: 'Attendance', icon: CalendarCheck },
  { href: '/admin/library',    label: 'Library',    icon: Library },
  { href: '/admin/analytics',  label: 'Analytics',  icon: BarChart2 },
  { href: '/admin/payments',   label: 'Payments',   icon: CreditCard },
]

export default function AdminSidebar({ profile }: AdminSidebarProps) {
  const pathname = usePathname()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <aside className="w-56 shrink-0 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      {/* Brand */}
      <div className="px-4 py-5 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-teal-600 text-lg select-none">☽</span>
          <span className="font-semibold text-slate-900 text-sm leading-tight">Quran Madrasa</span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5 ml-6">Admin</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                active
                  ? 'bg-teal-50 text-teal-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t border-slate-200">
        <div className="px-3 py-2">
          <p className="text-sm font-medium text-slate-900 truncate">{profile.full_name}</p>
          <p className="text-xs text-slate-400">Administrator</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-sm text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors mt-0.5"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
