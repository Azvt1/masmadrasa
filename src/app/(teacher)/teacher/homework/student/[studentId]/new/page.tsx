'use client'

import { useActionState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createHomeworkAction } from './actions'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

export default function NewHomeworkPage() {
  const params = useParams<{ studentId: string }>()
  const studentId = params.studentId
  const [state, action, isPending] = useActionState(createHomeworkAction, {})

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <Link
          href={`/teacher/homework/student/${studentId}`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to student
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Assign homework</CardTitle>
          <CardDescription>This homework will be assigned to this student only.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-5">
            <input type="hidden" name="student_id" value={studentId} />

            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" placeholder="e.g. Revise Surah Al-Fatiha" required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="instructions">
                Instructions <span className="text-slate-400 font-normal">(optional)</span>
              </Label>
              <textarea
                id="instructions"
                name="instructions"
                rows={3}
                placeholder="What should the student do? Any specific guidance?"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="book_reference">
                Book reference <span className="text-slate-400 font-normal">(optional)</span>
              </Label>
              <Input id="book_reference" name="book_reference" placeholder="e.g. Iqra Book 2, Page 15" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="due_date">
                Due date <span className="text-slate-400 font-normal">(optional)</span>
              </Label>
              <Input id="due_date" name="due_date" type="date" />
            </div>

            {state?.error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-md">
                {state.error}
              </p>
            )}

            <div className="flex gap-3 pt-1">
              <Button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700"
                disabled={isPending}
              >
                {isPending ? 'Assigning…' : 'Assign homework'}
              </Button>
              <Link
                href={`/teacher/homework/student/${studentId}`}
                className={buttonVariants({ variant: 'outline' })}
              >
                Cancel
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
