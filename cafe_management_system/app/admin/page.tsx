import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminPanel from './AdminPanel'

export default async function AdminPage() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()

  // Only allow admins to access this page
  if (!user || user.user_metadata?.role !== 'admin') {
    redirect('/login')
  }

  return <AdminPanel adminUser={user} />
}
