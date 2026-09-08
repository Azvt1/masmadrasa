import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, ChevronRight, AlertTriangle } from 'lucide-react'

function CompletionBar({ rate, atRisk }: { rate: number; atRisk: boolean }) {
  const color = atRisk ? 'bg-red-400' : rate >= 80 ? 'bg-teal-500' : 'bg-amber-400'
  const textColor = atRisk ? 'text-red-600' : rate >= 80 ? 'text-teal-600' : 'text-amber-600'
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${rate}%` }} />
      </div>
      <span className={`text-xs font-semibold tabular-nums ${textColor}`}>{rate}%</span>
      {atRisk && <AlertTriangle size={12} className="text-red-400 shrink-0" />}
    </div>
  )
}

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

  // Parallel: profile names + ALL homework assignments (to derive pending + completion rate)
  const [{ data: profileRows }, { data: allAssignments }] = await Promise.all([
    admin.from('profiles').select('id, full_name').in('id', profileIds),
    supabase.from('homework_assignments')
      .select('student_id, is_completed')
      .in('student_id', studentIds),
  ])
  const profileMap = new Map((profileRows ?? []).map(p => [p.id, p.full_name]))

  // Derive per-student stats
  const statsMap = new Map<string, { total: number; completed: number }>()
  studentIds.forEach(id => statsMap.set(id, { total: 0, completed: 0 }))
  allAssignments?.forEach(a => {
    const s = statsMap.get(a.student_id)
    if (!s) return
    s.total++
    if (a.is_completed) s.completed++
  })

  const students = studentRows.map(s => {
    const stats   = statsMap.get(s.id) ?? { total: 0, completed: 0 }
    const pending = stats.total - stats.completed
    const rate    = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : null
    const atRisk  = rate !== null && stats.total >= 3 && rate < 80
    return {
      id:           s.id,
      full_name:    profileMap.get(s.profile_id) ?? '—',
      student_type: s.student_type as string,
      pending,
      total:        stats.total,
      completed:    stats.completed,
      rate,
      atRisk,
    }
  })

  const atRiskCount = students.filter(s => s.atRisk).length
  const iqra  = students.filter(s => s.student_type === 'iqra')
  const quran = students.filter(s => s.student_type === 'quran')

  const StudentList = ({ items }: { items: typeof students }) => (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100">
      {items.map(s => (
        <Link
          key={s.id}
          href={`/teacher/homework/student/${s.id}`}
          className={`flex items-center justify-between px-4 py-3.5 hover:bg-slate-50 transition-colors group ${
            s.atRisk ? 'bg-red-50/40 hover:bg-red-50/60' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              s.atRisk ? 'bg-red-50' : 'bg-teal-50'
            }`}>
              <BookOpen size={14} className={s.atRisk ? 'text-red-500' : 'text-teal-600'} />
            </div>
            <div>
              <p className={`text-sm font-medium ${s.atRisk ? 'text-red-700' : 'text-slate-900'}`}>
                {s.full_name}
              </p>
              <p className="text-xs text-slate-400 capitalize mt-0.5">{s.student_type}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Completion bar — only if any homework assigned */}
            {s.rate !== null && (
              <CompletionBar rate={s.rate} atRisk={s.atRisk} />
            )}

            {/* Pending badge */}
            {s.pending > 0 && (
              <span className="text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full">
                {s.pending} pending
              </span>
            )}
            {s.total === 0 && (
              <span className="text-xs text-slate-300">No homework yet</span>
            )}

            <ChevronRight size={15} className="text-slate-300 group-hover:text-slate-400 transition-colors" />
          </div>
        </Link>
      ))}
    </div>
  )

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Homework</h1>
          <p className="text-sm text-slate-500 mt-0.5">Select a student to view or assign homework.</p>
        </div>
        {atRiskCount > 0 && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-100 px-2.5 py-1.5 rounded-lg">
            <AlertTriangle size={13} />
            {atRiskCount} student{atRiskCount !== 1 ? 's' : ''} below 80%
          </div>
        )}
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
