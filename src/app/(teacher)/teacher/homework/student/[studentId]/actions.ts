'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleCompletionAction(formData: FormData) {
  const assignmentId  = formData.get('assignmentId') as string
  const currentState  = formData.get('currentState') === 'true'
  const studentId     = formData.get('studentId') as string

  const supabase = await createClient()
  await supabase
    .from('homework_assignments')
    .update({
      is_completed: !currentState,
      completed_at: !currentState ? new Date().toISOString() : null,
    })
    .eq('id', assignmentId)

  revalidatePath(`/teacher/homework/student/${studentId}`)
}

interface SaveFeedbackArgs {
  assignmentId: string
  studentId: string
  isCompleted: boolean
  behaviorSatisfactory: boolean
  teacherFeedback: string | null
}

export async function saveFeedbackAction({
  assignmentId,
  studentId,
  isCompleted,
  behaviorSatisfactory,
  teacherFeedback,
}: SaveFeedbackArgs) {
  const supabase = await createClient()

  await supabase
    .from('homework_assignments')
    .update({
      is_completed:           isCompleted,
      completed_at:           isCompleted ? new Date().toISOString() : null,
      behavior_satisfactory:  behaviorSatisfactory,
      teacher_feedback:       teacherFeedback,
    })
    .eq('id', assignmentId)

  revalidatePath(`/teacher/homework/student/${studentId}`)
}
