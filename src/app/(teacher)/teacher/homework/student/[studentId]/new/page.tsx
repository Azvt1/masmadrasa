'use client'

import { useActionState, useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createHomeworkAction } from './actions'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Search, CheckCircle2 } from 'lucide-react'
import { SURAHS } from '@/lib/quran/surahs'
import AyahRangePicker from '@/components/shared/AyahRangePicker'

type Mode = 'surah' | 'surah-range' | 'juz' | 'juz-range'
type Surah = { num: number; name: string; ayahs: number; juz: number }

const JUZS = Array.from({ length: 30 }, (_, i) => i + 1)
const allSurahs: Surah[] = SURAHS.map(([num, name, ayahs, juz]) => ({ num, name, ayahs, juz }))

const MODE_LABELS: { key: Mode; label: string }[] = [
  { key: 'surah',       label: 'Single Surah'  },
  { key: 'surah-range', label: 'Surah Range'   },
  { key: 'juz',         label: 'Single Juz'    },
  { key: 'juz-range',   label: 'Juz Range'     },
]

function SurahRow({ s, selected, onSelect }: {
  s: Surah; selected: boolean; onSelect: () => void
}) {
  return (
    <button type="button" onClick={onSelect}
      className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors ${selected ? 'bg-teal-50' : 'hover:bg-slate-50'}`}
    >
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-400 w-6 text-right tabular-nums">{s.num}</span>
        <span className={`text-sm font-medium ${selected ? 'text-teal-700' : 'text-slate-900'}`}>{s.name}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400">{s.ayahs} ayahs</span>
        {selected && <CheckCircle2 size={14} className="text-teal-600" />}
      </div>
    </button>
  )
}

function SurahPicker({ label, value, onSelect }: {
  label: string; value: Surah | null; onSelect: (s: Surah) => void
}) {
  const [search, setSearch] = useState('')
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return allSurahs.filter(s => s.name.toLowerCase().includes(q) || String(s.num).includes(q))
  }, [search])
  return (
    <div className="flex-1 min-w-0">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide px-1 mb-2">{label}</p>
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-3 py-2 border-b border-slate-100">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-7 pr-2 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="overflow-y-auto max-h-44 divide-y divide-slate-50">
          {filtered.map(s => (
            <SurahRow key={s.num} s={s} selected={value?.num === s.num} onSelect={() => onSelect(s)} />
          ))}
        </div>
      </div>
      {value && (
        <p className="text-xs text-teal-700 font-medium mt-1.5 px-1">
          ✓ {value.name}
        </p>
      )}
    </div>
  )
}

function JuzSelector({ label, value, onChange }: {
  label: string; value: number | null; onChange: (j: number) => void
}) {
  return (
    <div className="flex-1">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{label}</p>
      <div className="border border-slate-200 rounded-xl overflow-y-auto" style={{ maxHeight: '11rem' }}>
        {JUZS.map(j => (
          <button key={j} type="button" onClick={() => onChange(j)}
            className={`w-full text-left px-4 py-2 text-sm transition-colors ${
              value === j ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Juz {j}
          </button>
        ))}
      </div>
      {value && <p className="text-xs text-teal-700 font-medium mt-1.5 px-1">✓ Juz {value}</p>}
    </div>
  )
}

export default function NewHomeworkPage() {
  const params = useParams<{ studentId: string }>()
  const studentId = params.studentId
  const [state, action, isPending] = useActionState(createHomeworkAction, {})

  const [mode, setMode] = useState<Mode>('surah')

  // Single surah
  const [selected, setSelected]   = useState<Surah | null>(null)
  const [search, setSearch]       = useState('')
  const [selectedJuzFilter, setSelectedJuzFilter] = useState<number | null>(null)
  const [ayahFrom, setAyahFrom]   = useState(1)
  const [ayahTo, setAyahTo]       = useState(1)
  const [page, setPage]           = useState('')

  // Surah range
  const [surahFrom, setSurahFrom] = useState<Surah | null>(null)
  const [surahTo,   setSurahTo]   = useState<Surah | null>(null)

  // Single juz
  const [singleJuz, setSingleJuz] = useState<number | null>(null)

  // Juz range
  const [juzFrom, setJuzFrom]     = useState<number | null>(null)
  const [juzTo,   setJuzTo]       = useState<number | null>(null)

  const filteredSurahs = useMemo(() => {
    const q = search.toLowerCase()
    return allSurahs.filter(s => s.name.toLowerCase().includes(q) || String(s.num).includes(q))
  }, [search])

  function pick(s: Surah) { setSelected(s); setAyahFrom(1); setAyahTo(s.ayahs) }

  const generatedTitle = useMemo(() => {
    if (mode === 'surah' && selected) {
      let t = `Surah ${selected.name}`
      if (ayahTo > ayahFrom) t += `, Ayah ${ayahFrom}–${ayahTo}`
      else t += `, Ayah ${ayahFrom}`
      return t
    }
    if (mode === 'surah-range' && surahFrom && surahTo) {
      const a = surahFrom.num <= surahTo.num ? surahFrom : surahTo
      const b = surahFrom.num <= surahTo.num ? surahTo   : surahFrom
      return `Surah ${a.name} – Surah ${b.name}`
    }
    if (mode === 'juz' && singleJuz) return `Juz ${singleJuz}`
    if (mode === 'juz-range' && juzFrom && juzTo) {
      const lo = Math.min(juzFrom, juzTo)
      const hi = Math.max(juzFrom, juzTo)
      return `Juz ${lo} – Juz ${hi}`
    }
    return ''
  }, [mode, selected, ayahFrom, ayahTo, surahFrom, surahTo, singleJuz, juzFrom, juzTo])

  const generatedRef = useMemo(() => page ? `Page ${page}` : '', [page])

  const isValid =
    (mode === 'surah'       && selected  !== null) ||
    (mode === 'surah-range' && surahFrom !== null && surahTo !== null) ||
    (mode === 'juz'         && singleJuz !== null) ||
    (mode === 'juz-range'   && juzFrom   !== null && juzTo   !== null)

  function switchMode(m: Mode) {
    setMode(m)
    // reset all selections
    setSelected(null); setSurahFrom(null); setSurahTo(null)
    setSingleJuz(null); setJuzFrom(null); setJuzTo(null)
    setSearch(''); setSelectedJuzFilter(null)
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <Link href={`/teacher/homework/student/${studentId}`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={14} /> Back to student
        </Link>
      </div>

      <form action={action} className="space-y-5">
        <input type="hidden" name="student_id"     value={studentId} />
        <input type="hidden" name="title"          value={generatedTitle} />
        <input type="hidden" name="book_reference" value={generatedRef} />
        <input type="hidden" name="surah_number"   value={mode === 'surah' ? (selected?.num ?? '') : ''} />

        {/* ── Mode selector ── */}
        <div className="bg-white border border-slate-200 rounded-xl p-1 grid grid-cols-2 gap-1 sm:grid-cols-4">
          {MODE_LABELS.map(({ key, label }) => (
            <button key={key} type="button" onClick={() => switchMode(key)}
              className={`py-2 px-2 rounded-lg text-xs font-medium transition-colors text-center ${
                mode === key
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Single Surah ── */}
        {mode === 'surah' && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Search surah…" value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="overflow-y-auto max-h-52 divide-y divide-slate-50">
              {filteredSurahs.map(s => (
                <SurahRow key={s.num} s={s} selected={selected?.num === s.num} onSelect={() => pick(s)} />
              ))}
            </div>
          </div>
        )}

        {/* ── Single Surah: Ayah range ── */}
        {mode === 'surah' && selected && (
          <div className="space-y-3">
            <div className="px-1">
              <p className="text-sm font-semibold text-slate-900">
                Surah {selected.name}
                <span className="text-slate-400 font-normal ml-1">({selected.ayahs} ayahs · Juz {selected.juz})</span>
              </p>
            </div>
            <AyahRangePicker maxAyahs={selected.ayahs} from={ayahFrom} to={ayahTo}
              onFromChange={setAyahFrom} onToChange={setAyahTo} />
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 shrink-0">
                <Label className="text-xs whitespace-nowrap">Page <span className="text-slate-400">(opt.)</span></Label>
                <Input type="number" min="1" placeholder="—" value={page}
                  onChange={e => setPage(e.target.value)} className="text-center w-20" />
              </div>
              {generatedTitle && (
                <div className="flex-1 bg-teal-50 border border-teal-100 rounded-lg px-3 py-2 min-w-0">
                  <p className="text-xs text-teal-600 font-medium truncate">
                    {generatedTitle}{generatedRef ? ` · ${generatedRef}` : ''}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Surah Range ── */}
        {mode === 'surah-range' && (
          <div className="flex gap-3">
            <SurahPicker label="From" value={surahFrom} onSelect={setSurahFrom} />
            <SurahPicker label="To"   value={surahTo}   onSelect={setSurahTo}   />
          </div>
        )}

        {/* ── Single Juz ── */}
        {mode === 'juz' && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-y-auto" style={{ maxHeight: '14rem' }}>
            {JUZS.map(j => (
              <button key={j} type="button" onClick={() => setSingleJuz(j)}
                className={`w-full text-left px-4 py-3 text-sm border-b border-slate-50 last:border-0 transition-colors ${
                  singleJuz === j ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center justify-between">
                  <span>Juz {j}</span>
                  {singleJuz === j && <CheckCircle2 size={14} className="text-teal-600" />}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* ── Juz Range ── */}
        {mode === 'juz-range' && (
          <div className="flex gap-3">
            <JuzSelector label="From" value={juzFrom} onChange={setJuzFrom} />
            <JuzSelector label="To"   value={juzTo}   onChange={setJuzTo}   />
          </div>
        )}

        {/* ── Title preview ── */}
        {generatedTitle && mode !== 'surah' && (
          <div className="bg-teal-50 border border-teal-100 rounded-lg px-3 py-2">
            <p className="text-xs text-teal-600 font-medium">{generatedTitle}</p>
          </div>
        )}

        {/* ── Notes ── */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
          <Label htmlFor="instructions">
            Notes <span className="text-slate-400 font-normal">(optional)</span>
          </Label>
          <textarea id="instructions" name="instructions" rows={3}
            placeholder="Any specific guidance for the student…"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
          />
        </div>

        {/* ── Due date ── */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
          <Label htmlFor="due_date">
            Due date <span className="text-slate-400 font-normal">(optional)</span>
          </Label>
          <Input id="due_date" name="due_date" type="date" />
        </div>

        {state?.error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
            {state.error}
          </p>
        )}

        <div className="flex gap-3">
          <Button type="submit" className="bg-teal-600 hover:bg-teal-700"
            disabled={isPending || !isValid}
          >
            {isPending ? 'Assigning…' : 'Assign homework'}
          </Button>
          <Link href={`/teacher/homework/student/${studentId}`} className={buttonVariants({ variant: 'outline' })}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
