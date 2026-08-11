'use client'

import { useActionState, useState } from 'react'
import { saveProgressAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle2 } from 'lucide-react'

interface Props {
  studentId:   string
  studentType: 'iqra' | 'quran'
  current?: {
    book?:  number
    page?:  number
    surah?: number
    juz?:   number
  } | null
}

export default function ProgressForm({ studentId, studentType, current }: Props) {
  const [state, action, isPending] = useActionState(saveProgressAction, {})
  const [selectedBook, setSelectedBook] = useState<number>(current?.book ?? 1)

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="student_id"   value={studentId} />
      <input type="hidden" name="student_type" value={studentType} />

      {studentType === 'iqra' ? (
        <>
          {/* Book selector */}
          <div className="space-y-2">
            <Label>Current book</Label>
            <input type="hidden" name="current_book" value={selectedBook} />
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setSelectedBook(n)}
                  className={`w-10 h-10 rounded-lg text-sm font-semibold border transition-colors ${
                    selectedBook === n
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:text-teal-700'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Page */}
          <div className="space-y-1.5">
            <Label htmlFor="current_page">Current page</Label>
            <Input
              id="current_page"
              name="current_page"
              type="number"
              min={1}
              defaultValue={current?.page ?? ''}
              placeholder="e.g. 15"
              className="w-32"
              required
            />
          </div>
        </>
      ) : (
        <>
          {/* Surah */}
          <div className="space-y-1.5">
            <Label htmlFor="current_surah">Current surah <span className="text-slate-400 font-normal">(1–114)</span></Label>
            <Input
              id="current_surah"
              name="current_surah"
              type="number"
              min={1}
              max={114}
              defaultValue={current?.surah ?? ''}
              placeholder="e.g. 36"
              className="w-32"
              required
            />
          </div>

          {/* Juz */}
          <div className="space-y-1.5">
            <Label htmlFor="current_juz">Current juz <span className="text-slate-400 font-normal">(1–30)</span></Label>
            <Input
              id="current_juz"
              name="current_juz"
              type="number"
              min={1}
              max={30}
              defaultValue={current?.juz ?? ''}
              placeholder="e.g. 22"
              className="w-32"
              required
            />
          </div>

          {/* Page */}
          <div className="space-y-1.5">
            <Label htmlFor="current_page">Current page <span className="text-slate-400 font-normal">(1–604)</span></Label>
            <Input
              id="current_page"
              name="current_page"
              type="number"
              min={1}
              max={604}
              defaultValue={current?.page ?? ''}
              placeholder="e.g. 440"
              className="w-32"
              required
            />
          </div>
        </>
      )}

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-md">
          {state.error}
        </p>
      )}

      {state?.success && (
        <p className="text-sm text-teal-700 bg-teal-50 border border-teal-100 px-3 py-2 rounded-md flex items-center gap-2">
          <CheckCircle2 size={14} /> Progress saved successfully.
        </p>
      )}

      <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={isPending}>
        {isPending ? 'Saving…' : 'Save progress'}
      </Button>
    </form>
  )
}
