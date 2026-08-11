import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StudentSidebar from '@/components/student/StudentSidebar'
import type { Profile } from '@/lib/types/app.types'

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'student') redirect('/login')

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <StudentSidebar profile={profile as Profile} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
