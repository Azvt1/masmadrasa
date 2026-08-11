import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CalendarCheck, CheckCircle2, Circle, ChevronRight } from 'lucide-react'
import { format, parseISO } from 'date-fns'

export default async function TeacherAttendancePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Batch 1 — parallel: active term + teacher's students
  const [{ data: term }, { data: students }] = await Promise.all([
    supabase.from('terms').select('*').eq('is_active', true).single(),
    supabase.from('students').select('id').eq('teacher_id', user.id).eq('is_active', true),
  ])

  if (!term) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-slate-900">Attendance</h1>
        <p className="text-sm text-slate-500">No active term. Ask your admin to set one up.</p>
      </div>
    )
  }

  const studentIds    = students?.map(s => s.id) ?? []
  const totalStudents = studentIds.length

  // Batch 2 — parallel: sessions + attendance records
  const [{ data: sessions }, { data: records }] = await Promise.all([
    supabase.from('class_sessions').select('id, session_date, day_of_week')
      .eq('term_id', term.id).order('session_date'),
    studentIds.length > 0
      ? supabase.from('attendance_records').select('session_id, student_id').in('student_id', studentIds)
      : Promise.resolve({ data: [] }),
  ])

  // Map: sessionId → count of marked students
  const markedBySession = new Map<string, number>()
  records?.forEach(r => {
    markedBySession.set(r.session_id, (markedBySession.get(r.session_id) ?? 0) + 1)
  })

  // Group sessions by month
  const grouped = new Map<string, typeof sessions>()
  sessions?.forEach(s => {
    const month = format(parseISO(s.session_date), 'MMMM yyyy')
    if (!grouped.has(month)) grouped.set(month, [])
    grouped.get(month)!.push(s)
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Attendance</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {term.name} · {format(parseISO(term.start_date), 'd MMM')} – {format(parseISO(term.end_date), 'd MMM yyyy')}
        </p>
      </div>

      {totalStudents === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700">
          You have no students assigned yet. Ask your admin to enrol students under your name.
        </div>
      ) : (
        <div className="space-y-6">
          {Array.from(grouped.entries()).map(([month, monthSessions]) => (
            <div key={month}>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">{month}</h2>
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100">
                {monthSessions!.map(session => {
                  const sessionDate = parseISO(session.session_date)
                  const markedCount = markedBySession.get(session.id) ?? 0
                  const isFullyMarked = markedCount >= totalStudents
                  const isPartiallyMarked = markedCount > 0 && !isFullyMarked
                  const isPast = sessionDate < today

                  return (
                    <Link
                      key={session.id}
                      href={`/teacher/attendance/${session.id}`}
                      className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        {isFullyMarked ? (
                          <CheckCircle2 size={17} className="text-teal-500 shrink-0" />
                        ) : isPartiallyMarked ? (
                          <CheckCircle2 size={17} className="text-amber-400 shrink-0" />
                        ) : (
                          <Circle size={17} className={isPast ? 'text-slate-300 shrink-0' : 'text-slate-200 shrink-0'} />
                        )}
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {format(sessionDate, 'EEE, d MMM')}
                          </p>
                          <p className="text-xs text-slate-400 capitalize">{session.day_of_week}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {isFullyMarked ? (
                          <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                            Marked · {markedCount}/{totalStudents}
                          </span>
                        ) : isPartiallyMarked ? (
                          <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                            Partial · {markedCount}/{totalStudents}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">
                            {isPast ? 'Not marked' : 'Upcoming'}
                          </span>
                        )}
                        <ChevronRight size={15} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
