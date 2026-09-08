import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { format, parseISO, isAfter, startOfDay } from 'date-fns'
import AttendanceTabs, { type StudentStat, type SessionRow } from './AttendanceTabs'

export default async function AdminAttendancePage() {
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Active term
  const { data: term } = await supabase
    .from('terms')
    .select('*')
    .eq('is_active', true)
    .single()

  if (!term) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-slate-900">Attendance</h1>
        <p className="text-sm text-slate-500">No active term found.</p>
      </div>
    )
  }

  // All sessions for this term
  const { data: allSessions } = await supabase
    .from('class_sessions')
    .select('id, session_date, day_of_week')
    .eq('term_id', term.id)
    .order('session_date')

  const today = startOfDay(new Date())
  const pastSessions = (allSessions ?? []).filter(s => !isAfter(parseISO(s.session_date), today))
  const pastSessionIds = pastSessions.map(s => s.id)

  // Students + profiles via admin client
  const { data: studentRows } = await admin
    .from('students')
    .select('id, student_type, profile_id, teacher_id')
    .eq('is_active', true)

  const allProfileIds = [
    ...(studentRows ?? []).map(s => s.profile_id),
    ...(studentRows ?? []).map(s => s.teacher_id).filter(Boolean),
  ]

  const { data: profileRows } = await admin
    .from('profiles')
    .select('id, full_name')
    .in('id', allProfileIds)

  const profileMap = new Map((profileRows ?? []).map(p => [p.id, p.full_name]))

  // Attendance records for past sessions
  const { data: records } = pastSessionIds.length > 0
    ? await admin
        .from('attendance_records')
        .select('session_id, student_id, status')
        .in('session_id', pastSessionIds)
    : { data: [] }

  // ── Build student stats ───────────────────────────────────────────────────
  const statsMap = new Map<string, StudentStat>()
  for (const s of studentRows ?? []) {
    statsMap.set(s.id, {
      id:             s.id,
      name:           profileMap.get(s.profile_id) ?? '—',
      teacherName:    profileMap.get(s.teacher_id)  ?? '—',
      studentType:    s.student_type,
      present: 0, late: 0, absent: 0,
      attendanceRate: pastSessions.length === 0 ? 100 : 0,
    })
  }

  for (const r of records ?? []) {
    const s = statsMap.get(r.student_id)
    if (!s) continue
    s[r.status as 'present' | 'late' | 'absent']++
  }

  for (const s of statsMap.values()) {
    if (pastSessions.length > 0) {
      s.attendanceRate = Math.round(((s.present + s.late) / pastSessions.length) * 100)
    }
  }

  const students: StudentStat[] = Array.from(statsMap.values()).sort(
    (a, b) => a.attendanceRate - b.attendanceRate
  )

  // ── Build session rows ────────────────────────────────────────────────────
  type StatusMap = { present: number; late: number; absent: number }
  const sessionStatsMap = new Map<string, StatusMap>()
  for (const r of records ?? []) {
    if (!sessionStatsMap.has(r.session_id)) {
      sessionStatsMap.set(r.session_id, { present: 0, late: 0, absent: 0 })
    }
    sessionStatsMap.get(r.session_id)![r.status as keyof StatusMap]++
  }

  const sessionRows: SessionRow[] = (allSessions ?? []).map(s => {
    const stats = sessionStatsMap.get(s.id)
    return {
      id:           s.id,
      session_date: s.session_date,
      day_of_week:  s.day_of_week,
      present:      stats?.present  ?? 0,
      late:         stats?.late     ?? 0,
      absent:       stats?.absent   ?? 0,
      isPast:       !isAfter(parseISO(s.session_date), today),
    }
  })

  const atRiskCount = students.filter(
    s => pastSessions.length > 0 && s.attendanceRate < 80
  ).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Attendance</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {term.name} · {format(parseISO(term.start_date), 'd MMM')} – {format(parseISO(term.end_date), 'd MMM yyyy')}
          · {pastSessions.length} of {allSessions?.length ?? 0} sessions completed
        </p>
      </div>

      <AttendanceTabs
        students={students}
        sessions={sessionRows}
        totalStudents={students.length}
        pastSessionCount={pastSessions.length}
        atRiskCount={atRiskCount}
      />
    </div>
  )
}
