import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AccountSettings from '@/components/shared/AccountSettings'

export default async function TeacherSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return <AccountSettings />
}
