import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'

export default async function TeacherProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: studentRows } = await supabase
    .from('students')
    .select('id, student_type, profile_id')
    .eq('teacher_id', user.id)
    .eq('is_active', true)
    .order('enrollment_date')

  if (!studentRows || studentRows.length === 0) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-slate-900">Progress</h1>
        <p className="text-sm text-slate-500">No active students yet.</p>
      </div>
    )
  }

  const admin      = createAdminClient()
  const profileIds = studentRows.map(s => s.profile_id)
  const studentIds = studentRows.map(s => s.id)

  // All parallel: profiles + iqra progress + quran progress
  const [{ data: profileRows }, { data: iqraRows }, { data: quranRows }] = await Promise.all([
    admin.from('profiles').select('id, full_name').in('id', profileIds),
    supabase.from('iqra_progress').select('student_id, current_book, current_page, updated_at').in('student_id', studentIds),
    supabase.from('quran_progress').select('student_id, current_surah, current_juz, current_page, updated_at').in('student_id', studentIds),
  ])
  const profileMap = new Map((profileRows ?? []).map(p => [p.id, p.full_name]))

  const iqraMap  = new Map((iqraRows  ?? []).map(r => [r.student_id, r]))
  const quranMap = new Map((quranRows ?? []).map(r => [r.student_id, r]))

  const students = studentRows.map(s => ({
    id:           s.id,
    full_name:    profileMap.get(s.profile_id) ?? '—',
    student_type: s.student_type as string,
    progress:     s.student_type === 'iqra' ? iqraMap.get(s.id) : quranMap.get(s.id),
  }))

  const iqra  = students.filter(s => s.student_type === 'iqra')
  const quran = students.filter(s => s.student_type === 'quran')

  function progressSummary(s: typeof students[number]) {
    if (!s.progress) return 'Not started'
    if (s.student_type === 'iqra') {
      const p = s.progress as any
      return `Book ${p.current_book}, Page ${p.current_page}`
    }
    const p = s.progress as any
    return `Surah ${p.current_surah} · Juz ${p.current_juz} · Page ${p.current_page}`
  }

  const StudentList = ({ items }: { items: typeof students }) => (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100">
      {items.map(s => (
        <Link
          key={s.id}
          href={`/teacher/progress/${s.id}`}
          className="flex items-center justify-between px-4 py-3.5 hover:bg-slate-50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
              <TrendingUp size={14} className="text-teal-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">{s.full_name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{progressSummary(s)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            {s.progress && (
              <span className="text-xs text-slate-300">
                {format(new Date((s.progress as any).updated_at), 'd MMM')}
              </span>
            )}
            {!s.progress && (
              <span className="text-xs text-amber-500 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full font-medium">
                Not set
              </span>
            )}
            <ChevronRight size={15} className="text-slate-300 group-hover:text-slate-400 transition-colors" />
          </div>
        </Link>
      ))}
    </div>
  )

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Progress</h1>
        <p className="text-sm text-slate-500 mt-0.5">Select a student to update their progress.</p>
      </div>

      {iqra.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Iqra</p>
          <StudentList items={iqra} />
        </div>
      )}

      {quran.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Quran</p>
          <StudentList items={quran} />
        </div>
      )}
    </div>
  )
}
