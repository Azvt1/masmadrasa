import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { format, parseISO, startOfDay } from 'date-fns'
import { buttonVariants } from '@/components/ui/button'
import { ArrowLeft, Plus, Pencil } from 'lucide-react'
import HomeworkFeedbackForm from './HomeworkFeedbackForm'
import DeleteHomeworkButton from './DeleteHomeworkButton'
import WhatsAppButton from '@/components/shared/WhatsAppButton'
import HomeworkWhatsAppButton from '@/components/shared/HomeworkWhatsAppButton'

export default async function StudentHomeworkPage({
  params,
}: {
  params: Promise<{ studentId: string }>
}) {
  const { studentId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify student belongs to this teacher
  const { data: student } = await supabase
    .from('students')
    .select('id, student_type, profile_id, parent_phone')
    .eq('id', studentId)
    .eq('teacher_id', user.id)
    .single()

  if (!student) redirect('/teacher/homework')

  // Get student name
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('full_name')
    .eq('id', student.profile_id)
    .single()
  const studentName = profile?.full_name ?? '—'

  // All assignments
  const { data: assignments } = await supabase
    .from('homework_assignments')
    .select('id, is_completed, completed_at, assigned_at, behavior_satisfactory, teacher_feedback, homework:homework_id(id, title, due_date, book_reference, surah_number)')
    .eq('student_id', studentId)
    .order('assigned_at', { ascending: false })

  const today = startOfDay(new Date())
  const pending   = (assignments ?? []).filter(a => !a.is_completed)
  const completed = (assignments ?? []).filter(a => a.is_completed)

  return (
    <div className="space-y-6 max-w-xl">
      {/* Header */}
      <div>
        <Link
          href="/teacher/homework"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-3"
        >
          <ArrowLeft size={14} />
          All students
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{studentName}</h1>
            <p className="text-sm text-slate-400 capitalize mt-0.5">{student.student_type} student</p>
          </div>
          <Link
            href={`/teacher/homework/student/${studentId}/new`}
            className={buttonVariants({ size: 'sm', className: 'bg-teal-600 hover:bg-teal-700' })}
          >
            <Plus size={14} className="mr-1.5" />
            Assign homework
          </Link>
        </div>
        {/* WhatsApp parent contact */}
        <div className="mt-4">
          <WhatsAppButton
            parentPhone={(student as any).parent_phone ?? null}
            studentName={studentName}
          />
        </div>
      </div>

      {/* Pending */}
      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
          Pending ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-slate-400">No pending homework — all caught up!</p>
        ) : (
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100">
            {pending.map(a => {
              const hw = a.homework as any
              const isOverdue = hw.due_date
                ? startOfDay(parseISO(hw.due_date)) < today
                : false
              return (
                <div key={a.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{hw.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {hw.due_date && (
                          <span className={`text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                            {isOverdue ? 'Overdue · ' : 'Due '}
                            {format(parseISO(hw.due_date), 'd MMM yyyy')}
                          </span>
                        )}
                        {hw.book_reference && (
                          <span className="text-xs text-slate-300">· {hw.book_reference}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <HomeworkWhatsAppButton
                        parentPhone={(student as any).parent_phone ?? null}
                        studentName={studentName}
                        homeworkTitle={hw.title}
                        isCompleted={a.is_completed}
                        behaviorSatisfactory={a.behavior_satisfactory ?? null}
                        teacherFeedback={a.teacher_feedback ?? null}
                      />
                      <Link
                        href={`/teacher/homework/student/${studentId}/${a.id}/edit`}
                        title="Edit homework"
                        className="p-1.5 text-slate-300 hover:text-teal-500 transition-colors rounded"
                      >
                        <Pencil size={14} />
                      </Link>
                      <DeleteHomeworkButton assignmentId={a.id} studentId={studentId} />
                    </div>
                  </div>
                  {/* Feedback form */}
                  <div className="mt-3">
                    <HomeworkFeedbackForm
                      assignmentId={a.id}
                      studentId={studentId}
                      isCompleted={false}
                      existingFeedback={{
                        behavior_satisfactory: a.behavior_satisfactory ?? null,
                        teacher_feedback: a.teacher_feedback ?? null,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Completed */}
      {completed.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
            Completed ({completed.length})
          </h2>
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100">
            {completed.map(a => {
              const hw = a.homework as any
              return (
                <div key={a.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm text-slate-400 line-through truncate">{hw.title}</p>
                      <div className="flex items-center gap-2 flex-wrap mt-0.5">
                        {hw.book_reference && (
                          <p className="text-xs text-slate-300">{hw.book_reference}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <HomeworkWhatsAppButton
                        parentPhone={(student as any).parent_phone ?? null}
                        studentName={studentName}
                        homeworkTitle={hw.title}
                        isCompleted={a.is_completed}
                        behaviorSatisfactory={a.behavior_satisfactory ?? null}
                        teacherFeedback={a.teacher_feedback ?? null}
                      />
                      <Link
                        href={`/teacher/homework/student/${studentId}/${a.id}/edit`}
                        title="Edit homework"
                        className="p-1.5 text-slate-300 hover:text-teal-500 transition-colors rounded"
                      >
                        <Pencil size={14} />
                      </Link>
                      <DeleteHomeworkButton assignmentId={a.id} studentId={studentId} />
                    </div>
                  </div>
                  {/* Feedback form — shows as "Completed" chip with expand */}
                  <div className="mt-2">
                    <HomeworkFeedbackForm
                      assignmentId={a.id}
                      studentId={studentId}
                      isCompleted={true}
                      existingFeedback={{
                        behavior_satisfactory: a.behavior_satisfactory ?? null,
                        teacher_feedback: a.teacher_feedback ?? null,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {assignments?.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-6">No homework assigned yet.</p>
      )}
    </div>
  )
}
