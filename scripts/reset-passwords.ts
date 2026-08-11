/**
 * Reset all teacher/student passwords to the default: Madrasa2026!
 *
 * Run from the project root:
 *   npx tsx --env-file=.env.local scripts/reset-passwords.ts
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const DEFAULT_PASSWORD = 'Madrasa2026!'

// Use supabase-js only for PostgREST (DB queries) — auth admin calls go raw HTTP
const db = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function updatePassword(userId: string): Promise<{ ok: boolean; body: string }> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'apikey': SERVICE_KEY,
    },
    body: JSON.stringify({ password: DEFAULT_PASSWORD }),
  })
  const text = await res.text()
  return { ok: res.ok, body: text }
}

async function main() {
  // 1. Get all teacher + student profiles
  const { data: profiles, error } = await db
    .from('profiles')
    .select('id, full_name, role')
    .in('role', ['teacher', 'student'])

  if (error) { console.error('Could not load profiles:', error.message); process.exit(1) }

  console.log(`Resetting password for ${profiles?.length ?? 0} accounts:\n`)

  for (const profile of profiles ?? []) {
    const { ok, body } = await updatePassword(profile.id)
    if (ok) {
      console.log(`  ✓  ${profile.full_name} (${profile.role})`)
    } else {
      console.error(`  ✗  ${profile.full_name} (${profile.role})  —  ${body}`)
    }
  }

  console.log('\nDone!')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
