import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import ReassignForm from './ReassignForm'

export default async function ReassignStudentPage({
  params,
}: {
  params: Promise<{ studentId: string }>
}) {
  const { studentId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Must be admin
  const { data: adminProfile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (adminProfile?.role !== 'admin') redirect('/admin/dashboard')

  // Get student
  const { data: student } = await supabase
    .from('students')
    .select('id, student_type, profile_id, teacher_id, advance_note, advance_requested_at')
    .eq('id', studentId)
    .single()

  if (!student) redirect('/admin/dashboard')

  const adminClient = createAdminClient()

  // Student name
  const { data: studentProfile } = await adminClient
    .from('profiles').select('full_name').eq('id', student.profile_id).single()

  // Current teacher name
  const { data: currentTeacherProfile } = student.teacher_id
    ? await adminClient.from('profiles').select('full_name').eq('id', student.teacher_id).single()
    : { data: null }

  // All teachers for dropdown
  const { data: teacherProfiles } = await supabase
    .from('profiles').select('id, full_name').eq('role', 'teacher').order('full_name')

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-3"
        >
          <ArrowLeft size={14} /> Back to dashboard
        </Link>
        <h1 className="text-xl font-semibold text-slate-900">Reassign student</h1>
        <p className="text-sm text-slate-500 mt-0.5">{studentProfile?.full_name ?? '—'}</p>
      </div>

      {/* Current info */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Current teacher</span>
          <span className="font-medium text-slate-900">{currentTeacherProfile?.full_name ?? '—'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Student type</span>
          <span className="font-medium text-slate-900 capitalize">{student.student_type}</span>
        </div>
        {student.advance_note && (
          <div className="pt-1 border-t border-slate-200 mt-1">
            <span className="text-slate-500">Teacher's note: </span>
            <span className="italic text-slate-700">"{student.advance_note}"</span>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Assign new teacher</CardTitle>
          <CardDescription>
            Select the new teacher. If promoting from Iqra Book 6, also change the student type to Quran.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReassignForm
            studentId={studentId}
            currentStudentType={student.student_type as 'iqra' | 'quran'}
            currentTeacherId={student.teacher_id ?? null}
            teachers={teacherProfiles ?? []}
          />
        </CardContent>
      </Card>
    </div>
  )
}
