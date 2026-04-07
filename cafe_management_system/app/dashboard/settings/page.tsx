import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SettingsClient from './SettingsClient'

export default async function SettingsPage() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  const userRole = user.user_metadata?.role || 'staff'

  // Only admin can access
  if (userRole !== 'admin') {
    redirect('/dashboard')
  }

  return <SettingsClient />
}