import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SignupForm from './SignupForm'

export default async function SignupPage() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()

  // Only allow admins to create accounts
  if (!user || user.user_metadata?.role !== 'admin') {
    redirect('/login')
  }

  return <SignupForm adminUser={user} />
}
