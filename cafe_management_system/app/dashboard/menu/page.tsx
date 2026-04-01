import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MenuManagementClient from './MenuManagementClient'

export default async function MenuManagementPage() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  const userRole = user.user_metadata?.role || 'staff'

  // Fetch menu items
  const { data: menuItems, error: menuError } = await supabase
    .from('menu_items')
    .select('*')
    .order('category', { ascending: true })

  if (menuError) {
    console.error('Error fetching menu items:', menuError)
  }

  return <MenuManagementClient menuItems={menuItems || []} userRole={userRole} />
}