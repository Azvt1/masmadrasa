'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleCompletionAction(
  assignmentId: string,
  studentId: string,
  homeworkId: string,
  currentValue: boolean
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const newValue = !currentValue

  const { error } = await supabase
    .from('homework_assignments')
    .update({
      is_completed: newValue,
      completed_at: newValue ? new Date().toISOString() : null,
    })
    .eq('id', assignmentId)

  if (error) return { error: error.message }

  revalidatePath(`/teacher/homework/${homeworkId}`)
  revalidatePath('/teacher/homework')
  return {}
}
