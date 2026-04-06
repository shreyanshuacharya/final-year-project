import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AnalyticsClient from './AnalyticsClient'

export default async function AnalyticsPage() {
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

  // Fetch all orders
  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*, menu_items(name))')
    .order('created_at', { ascending: false })

  // Fetch menu items
  const { data: menuItems } = await supabase
    .from('menu_items')
    .select('*')

  return <AnalyticsClient orders={orders || []} menuItems={menuItems || []} />
}