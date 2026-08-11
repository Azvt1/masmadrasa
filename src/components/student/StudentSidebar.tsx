'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookOpen, CalendarCheck, TrendingUp, Library, Settings, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types/app.types'

interface StudentSidebarProps {
  profile: Profile
}

const navItems = [
  { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard, active: true },
  { href: '/student/homework',  label: 'Homework',  icon: BookOpen,         active: true },
  { href: '/student/progress',  label: 'Progress',  icon: TrendingUp,       active: true },
  { href: '/student/attendance',label: 'Attendance',icon: CalendarCheck,    active: true },
  { href: '/student/library',   label: 'Library',   icon: Library,          active: true },
  { href: '/student/settings',  label: 'Settings',  icon: Settings,         active: true },
]

export default function StudentSidebar({ profile }: StudentSidebarProps) {
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
        <p className="text-xs text-slate-400 mt-0.5 ml-6">Student</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon, active: isBuilt }) => {
          const isCurrent = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={isBuilt ? href : '#'}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                !isBuilt
                  ? 'text-slate-300 cursor-not-allowed'
                  : isCurrent
                  ? 'bg-teal-50 text-teal-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
              onClick={e => !isBuilt && e.preventDefault()}
            >
              <Icon size={15} />
              <span>{label}</span>
              {!isBuilt && (
                <span className="ml-auto text-[10px] text-slate-300 font-medium">Soon</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t border-slate-200">
        <div className="px-3 py-2">
          <p className="text-sm font-medium text-slate-900 truncate">{profile.full_name}</p>
          <p className="text-xs text-slate-400">Student</p>
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
