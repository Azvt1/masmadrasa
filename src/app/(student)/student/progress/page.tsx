import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { BookOpen, TrendingUp } from 'lucide-react'

export default async function StudentProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: student } = await supabase
    .from('students')
    .select('id, student_type')
    .eq('profile_id', user.id)
    .single()

  if (!student) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-slate-900">Progress</h1>
        <p className="text-sm text-slate-500">No student record found. Contact your admin.</p>
      </div>
    )
  }

  const studentType = student.student_type as 'iqra' | 'quran'

  // Fetch current progress
  const progressQuery = studentType === 'iqra'
    ? supabase.from('iqra_progress').select('current_book, current_page, updated_at').eq('student_id', student.id).single()
    : supabase.from('quran_progress').select('current_surah, current_juz, current_page, updated_at').eq('student_id', student.id).single()

  const { data: current } = await progressQuery

  // Last 10 snapshots
  const { data: snapshots } = await supabase
    .from('progress_snapshots')
    .select('id, data, recorded_at')
    .eq('student_id', student.id)
    .order('recorded_at', { ascending: false })
    .limit(10)

  function snapshotLabel(data: any): string {
    if (data.book !== undefined) return `Book ${data.book}, Page ${data.page}`
    return `Surah ${data.surah} · Juz ${data.juz} · Page ${data.page}`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">My Progress</h1>
        <p className="text-sm text-slate-500 mt-0.5 capitalize">{studentType} student</p>
      </div>

      {/* Current position */}
      {current ? (
        <div className={`rounded-xl border px-6 py-5 ${studentType === 'iqra' ? 'bg-teal-50 border-teal-100' : 'bg-indigo-50 border-indigo-100'}`}>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={16} className={studentType === 'iqra' ? 'text-teal-600' : 'text-indigo-600'} />
            <p className={`text-xs font-semibold uppercase tracking-wide ${studentType === 'iqra' ? 'text-teal-600' : 'text-indigo-600'}`}>
              Current position
            </p>
          </div>

          {studentType === 'iqra' ? (
            <div className="flex gap-6">
              <div>
                <p className={`text-3xl font-bold ${studentType === 'iqra' ? 'text-teal-800' : 'text-indigo-800'}`}>
                  {(current as any).current_book}
                </p>
                <p className={`text-xs font-medium mt-0.5 ${studentType === 'iqra' ? 'text-teal-500' : 'text-indigo-500'}`}>Book</p>
              </div>
              <div className={`w-px self-stretch ${studentType === 'iqra' ? 'bg-teal-200' : 'bg-indigo-200'}`} />
              <div>
                <p className={`text-3xl font-bold ${studentType === 'iqra' ? 'text-teal-800' : 'text-indigo-800'}`}>
                  {(current as any).current_page}
                </p>
                <p className={`text-xs font-medium mt-0.5 ${studentType === 'iqra' ? 'text-teal-500' : 'text-indigo-500'}`}>Page</p>
              </div>
            </div>
          ) : (
            <div className="flex gap-6">
              {[
                { label: 'Surah', value: (current as any).current_surah },
                { label: 'Juz',   value: (current as any).current_juz },
                { label: 'Page',  value: (current as any).current_page },
              ].map((item, i, arr) => (
                <div key={item.label} className="flex items-center gap-6">
                  <div>
                    <p className="text-3xl font-bold text-indigo-800">{item.value}</p>
                    <p className="text-xs font-medium text-indigo-500 mt-0.5">{item.label}</p>
                  </div>
                  {i < arr.length - 1 && <div className="w-px self-stretch bg-indigo-200" />}
                </div>
              ))}
            </div>
          )}

          <p className={`text-xs mt-4 ${studentType === 'iqra' ? 'text-teal-400' : 'text-indigo-400'}`}>
            Last updated {format(new Date((current as any).updated_at), 'd MMM yyyy')}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-white border border-slate-200 rounded-xl">
          <div className="p-3 bg-slate-100 rounded-full mb-3">
            <TrendingUp size={20} className="text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-700">No progress recorded yet</p>
          <p className="text-xs text-slate-400 mt-1">Your teacher will update your progress after each class.</p>
        </div>
      )}

      {/* History */}
      {snapshots && snapshots.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">History</h2>
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100">
            {snapshots.map((snap, idx) => (
              <div key={snap.id} className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-2">
                  {idx === 0 && (
                    <span className="text-[10px] font-semibold text-teal-600 bg-teal-50 border border-teal-100 px-1.5 py-0.5 rounded">
                      Latest
                    </span>
                  )}
                  <p className="text-sm text-slate-700">{snapshotLabel(snap.data)}</p>
                </div>
                <p className="text-xs text-slate-400">
                  {format(new Date(snap.recorded_at), 'd MMM yyyy')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
