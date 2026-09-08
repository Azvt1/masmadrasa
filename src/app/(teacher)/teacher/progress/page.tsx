import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, TrendingUp } from 'lucide-react'
import { surahName, juzProgress } from '@/lib/quran/surahs'

export default async function TeacherProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: studentRows } = await supabase
    .from('students')
    .select('id, student_type, profile_id')
    .eq('teacher_id', user.id)
    .eq('is_active', true)
    .order('enrollment_date')

  if (!studentRows || studentRows.length === 0) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-slate-900">Progress</h1>
        <p className="text-sm text-slate-500">No active students yet.</p>
      </div>
    )
  }

  const admin      = createAdminClient()
  const profileIds = studentRows.map(s => s.profile_id)
  const studentIds = studentRows.map(s => s.id)
  const iqraIds    = studentRows.filter(s => s.student_type === 'iqra').map(s => s.id)
  const quranIds   = studentRows.filter(s => s.student_type === 'quran').map(s => s.id)

  const [{ data: profileRows }, { data: iqraRows }, { data: hwRows }] = await Promise.all([
    admin.from('profiles').select('id, full_name').in('id', profileIds),
    iqraIds.length
      ? supabase.from('iqra_progress').select('student_id, current_book, current_page').in('student_id', iqraIds)
      : Promise.resolve({ data: [] }),
    quranIds.length
      ? supabase.from('homework_assignments')
          .select('student_id, homework:homework_id(surah_number)')
          .in('student_id', quranIds)
      : Promise.resolve({ data: [] }),
  ])

  const profileMap = new Map((profileRows ?? []).map(p => [p.id, p.full_name]))
  const iqraMap    = new Map((iqraRows  ?? []).map(r => [r.student_id, r]))

  // Compute current surah per Quran student = MIN surah_number assigned
  const quranSurahMap = new Map<string, number>()
  for (const row of (hwRows ?? []) as any[]) {
    const sn: number | null = row.homework?.surah_number
    if (!sn) continue
    const curr = quranSurahMap.get(row.student_id)
    if (!curr || sn < curr) quranSurahMap.set(row.student_id, sn)
  }

  const students = studentRows.map(s => ({
    id:           s.id,
    full_name:    profileMap.get(s.profile_id) ?? '—',
    student_type: s.student_type as 'iqra' | 'quran',
    iqraProgress: iqraMap.get(s.id) ?? null,
    currentSurah: quranSurahMap.get(s.id) ?? null,
  }))

  const iqra  = students.filter(s => s.student_type === 'iqra')
  const quran = students.filter(s => s.student_type === 'quran')

  const StudentList = ({ items }: { items: typeof students }) => (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100">
      {items.map(s => {
        const hasProgress = s.student_type === 'iqra' ? !!s.iqraProgress : !!s.currentSurah
        const jp = s.student_type === 'quran' && s.currentSurah
          ? juzProgress(s.currentSurah)
          : null

        const progressLine = s.student_type === 'iqra'
          ? s.iqraProgress ? `Book ${(s.iqraProgress as any).current_book} · Page ${(s.iqraProgress as any).current_page}` : null
          : s.currentSurah ? `Surah ${surahName(s.currentSurah)}` : null

        return (
          <Link
            key={s.id}
            href={`/teacher/progress/${s.id}`}
            className="flex items-center justify-between px-4 py-3.5 hover:bg-slate-50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                <TrendingUp size={14} className="text-teal-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">{s.full_name}</p>
                {progressLine ? (
                  <p className="text-xs text-slate-400 mt-0.5">{progressLine}</p>
                ) : (
                  <p className="text-xs text-slate-400 mt-0.5">No homework assigned yet</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              {jp && (
                <div className="flex items-center gap-1.5">
                  <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${jp.pct}%` }} />
                  </div>
                  <span className="text-xs text-slate-400">Juz {jp.juz}</span>
                </div>
              )}
              {!hasProgress && (
                <span className="text-xs text-amber-500 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full font-medium">
                  Not started
                </span>
              )}
              <ChevronRight size={15} className="text-slate-300 group-hover:text-slate-400 transition-colors" />
            </div>
          </Link>
        )
      })}
    </div>
  )

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Progress</h1>
        <p className="text-sm text-slate-500 mt-0.5">Quran students' progress is tracked automatically from homework.</p>
      </div>

      {iqra.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Iqra</p>
          <StudentList items={iqra} />
        </div>
      )}

      {quran.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Quran</p>
          <StudentList items={quran} />
        </div>
      )}
    </div>
  )
}
