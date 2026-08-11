import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ProgressForm from './ProgressForm'
import AdvanceForm from './AdvanceForm'

export default async function StudentProgressPage({
  params,
}: {
  params: Promise<{ studentId: string }>
}) {
  const { studentId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify student belongs to teacher
  const { data: student } = await supabase
    .from('students')
    .select('id, student_type, profile_id, ready_to_advance, advance_note, advance_requested_at')
    .eq('id', studentId)
    .eq('teacher_id', user.id)
    .single()

  if (!student) redirect('/teacher/progress')

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles').select('full_name').eq('id', student.profile_id).single()
  const studentName = profile?.full_name ?? '—'

  const studentType = student.student_type as 'iqra' | 'quran'

  // Fetch current progress
  const progressQuery = studentType === 'iqra'
    ? supabase.from('iqra_progress').select('current_book, current_page, updated_at').eq('student_id', studentId).single()
    : supabase.from('quran_progress').select('current_surah, current_juz, current_page, updated_at').eq('student_id', studentId).single()

  const { data: currentProgress } = await progressQuery

  // Last 8 snapshots for history
  const { data: snapshots } = await supabase
    .from('progress_snapshots')
    .select('id, data, recorded_at')
    .eq('student_id', studentId)
    .order('recorded_at', { ascending: false })
    .limit(8)

  // Build current values for the form
  let formCurrent: { book?: number; page?: number; surah?: number; juz?: number } | null = null
  if (currentProgress) {
    if (studentType === 'iqra') {
      const p = currentProgress as any
      formCurrent = { book: p.current_book, page: p.current_page }
    } else {
      const p = currentProgress as any
      formCurrent = { surah: p.current_surah, juz: p.current_juz, page: p.current_page }
    }
  }

  function snapshotLabel(data: any): string {
    if (data.book !== undefined) return `Book ${data.book}, Page ${data.page}`
    return `Surah ${data.surah} · Juz ${data.juz} · Page ${data.page}`
  }

  return (
    <div className="space-y-6 max-w-xl">
      {/* Header */}
      <div>
        <Link
          href="/teacher/progress"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-3"
        >
          <ArrowLeft size={14} />
          All students
        </Link>
        <h1 className="text-xl font-semibold text-slate-900">{studentName}</h1>
        <p className="text-sm text-slate-400 capitalize mt-0.5">{studentType} student</p>
      </div>

      {/* Current position summary */}
      {currentProgress && (
        <div className="bg-teal-50 border border-teal-100 rounded-lg px-4 py-3">
          <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-1">Current position</p>
          {studentType === 'iqra' ? (
            <p className="text-sm font-medium text-teal-900">
              Book {(currentProgress as any).current_book} · Page {(currentProgress as any).current_page}
            </p>
          ) : (
            <p className="text-sm font-medium text-teal-900">
              Surah {(currentProgress as any).current_surah} · Juz {(currentProgress as any).current_juz} · Page {(currentProgress as any).current_page}
            </p>
          )}
          <p className="text-xs text-teal-500 mt-0.5">
            Last updated {format(new Date((currentProgress as any).updated_at), 'd MMM yyyy')}
          </p>
        </div>
      )}

      {/* Update form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Update progress</CardTitle>
        </CardHeader>
        <CardContent>
          <ProgressForm
            studentId={studentId}
            studentType={studentType}
            current={formCurrent}
          />
        </CardContent>
      </Card>

      {/* Advance to next level — Iqra only */}
      {studentType === 'iqra' && (
        <AdvanceForm
          studentId={studentId}
          readyToAdvance={student.ready_to_advance ?? false}
          advanceNote={student.advance_note ?? null}
          advanceRequestedAt={student.advance_requested_at ?? null}
        />
      )}

      {/* History */}
      {snapshots && snapshots.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">History</h2>
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100">
            {snapshots.map(snap => (
              <div key={snap.id} className="flex items-center justify-between px-4 py-2.5">
                <p className="text-sm text-slate-700">{snapshotLabel(snap.data)}</p>
                <p className="text-xs text-slate-400">
                  {format(new Date(snap.recorded_at), 'd MMM yyyy, h:mm a')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
