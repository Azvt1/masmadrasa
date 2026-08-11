import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, ChevronRight } from 'lucide-react'

export default async function TeacherHomeworkPage() {
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
        <h1 className="text-xl font-semibold text-slate-900">Homework</h1>
        <p className="text-sm text-slate-500">No active students yet.</p>
      </div>
    )
  }

  const admin      = createAdminClient()
  const profileIds = studentRows.map(s => s.profile_id)
  const studentIds = studentRows.map(s => s.id)

  // Parallel: profile names + pending homework counts
  const [{ data: profileRows }, { data: pendingRows }] = await Promise.all([
    admin.from('profiles').select('id, full_name').in('id', profileIds),
    supabase.from('homework_assignments').select('student_id')
      .in('student_id', studentIds).eq('is_completed', false),
  ])
  const profileMap = new Map((profileRows ?? []).map(p => [p.id, p.full_name]))

  const pendingMap = new Map<string, number>()
  pendingRows?.forEach(a => {
    pendingMap.set(a.student_id, (pendingMap.get(a.student_id) ?? 0) + 1)
  })

  const students = studentRows.map(s => ({
    id:           s.id,
    full_name:    profileMap.get(s.profile_id) ?? '—',
    student_type: s.student_type as string,
    pending:      pendingMap.get(s.id) ?? 0,
  }))

  const iqra  = students.filter(s => s.student_type === 'iqra')
  const quran = students.filter(s => s.student_type === 'quran')

  const StudentList = ({ items }: { items: typeof students }) => (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100">
      {items.map(s => (
        <Link
          key={s.id}
          href={`/teacher/homework/student/${s.id}`}
          className="flex items-center justify-between px-4 py-3.5 hover:bg-slate-50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
              <BookOpen size={14} className="text-teal-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">{s.full_name}</p>
              <p className="text-xs text-slate-400 capitalize mt-0.5">{s.student_type}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            {s.pending > 0 && (
              <span className="text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full">
                {s.pending} pending
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
        <h1 className="text-xl font-semibold text-slate-900">Homework</h1>
        <p className="text-sm text-slate-500 mt-0.5">Select a student to view or assign homework.</p>
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
