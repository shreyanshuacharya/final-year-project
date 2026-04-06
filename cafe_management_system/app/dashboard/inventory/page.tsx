import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import InventoryClient from './InventoryClient'

export default async function InventoryPage() {
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

  // Fetch menu items with stock
  const { data: menuItems } = await supabase
    .from('menu_items')
    .select('*')
    .order('name', { ascending: true })

  return <InventoryClient menuItems={menuItems || []} />
}