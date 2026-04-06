import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import POSClient from './POSClient'

export default async function POSPage() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  const userRole = user.user_metadata?.role || 'staff'

  // Only manager and admin can access
  if (userRole !== 'manager' && userRole !== 'admin') {
    redirect('/dashboard')
  }

  // Fetch available menu items
  const { data: menuItems } = await supabase
    .from('menu_items')
    .select('*')
    .eq('available', true)
    .order('category', { ascending: true })

  return <POSClient menuItems={menuItems || []} staffName={user.user_metadata?.username || user.email?.split('@')[0] || 'Staff'} />
}