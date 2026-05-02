// import { createClient } from '@/lib/supabase/server'
// import { redirect } from 'next/navigation'
// import Link from 'next/link'
// import LogoutButton from '@/components/LogoutButton'
// import MenuQRCode from '@/components/MenuQRCode'

// export default async function DashboardPage() {
//   const supabase = await createClient()
  
//   const { data: { user }, error } = await supabase.auth.getUser()

//   if (error || !user) {
//     redirect('/login')
//   }

//   const userRole = user.user_metadata?.role || 'staff'
//   const userName = user.user_metadata?.username || user.email?.split('@')[0]

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//       {/* Header */}
//       <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center py-4">
//             <div className="flex items-center space-x-4">
//               <div className="h-10 w-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
//                 <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
//                 </svg>
//               </div>
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-900">CaféFlow</h1>
//                 <p className="text-xs text-gray-500">Management Dashboard</p>
//               </div>
//             </div>
//             <div className="flex items-center space-x-4">
//               <div className="hidden md:block text-right">
//                 <p className="text-sm font-medium text-gray-900">{userName}</p>
//                 <p className="text-xs text-gray-500 capitalize">{userRole}</p>
//               </div>
//               <LogoutButton />
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Welcome Banner */}
//         {/* <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-xl p-8 mb-8 text-white relative overflow-hidden">
//           <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full"></div>
//           <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
//           <div className="relative z-10">
//             <h2 className="text-3xl font-bold mb-2">Welcome back, {userName}</h2>
//             <p className="text-primary-100 mb-4">Manage your café operations from here</p>
//             <div className="flex flex-wrap gap-4">
//               <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
//                 <div className="text-xs text-primary-100">Email</div>
//                 <div className="text-sm font-semibold">{user.email}</div>
//               </div>
//               <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
//                 <div className="text-xs text-primary-100">Role</div>
//                 <div className="text-sm font-semibold capitalize">{userRole}</div>
//               </div>
//               <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
//                 <div className="text-xs text-primary-100">Member Since</div>
//                 <div className="text-sm font-semibold">{new Date(user.created_at).toLocaleDateString()}</div>
//               </div>
//             </div>
//           </div>
//         </div> */}

//         <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-xl p-8 mb-8 text-white relative overflow-hidden">
//         <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full"></div>
//         <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
//         <div className="relative z-10">
//           <h2 className="text-3xl font-bold mb-2 text-white">Welcome back, {userName}</h2>
//           <p className="text-white opacity-90 mb-4">Manage your café operations from here</p>
//           <div className="flex flex-wrap gap-4">
//             <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
//               <div className="text-xs text-white opacity-75">Email</div>
//               <div className="text-sm font-semibold text-white">{user.email}</div>
//             </div>
//             <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
//               <div className="text-xs text-white opacity-75">Role</div>
//               <div className="text-sm font-semibold capitalize text-white">{userRole}</div>
//             </div>
//             <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
//               <div className="text-xs text-white opacity-75">Member Since</div>
//               <div className="text-sm font-semibold text-white">{new Date(user.created_at).toLocaleDateString()}</div>
//             </div>
//           </div>
//         </div>
//       </div>

//         {/* Main Grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
//           {/* Quick Actions */}
//           <div className="lg:col-span-2">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
//               {/* Orders - ALL ROLES */}
//               <Link href="/dashboard/orders">
//                 <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all cursor-pointer group border-2 border-transparent hover:border-blue-500">
//                   <div className="flex items-center space-x-4">
//                     <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 group-hover:scale-110 transition-transform">
//                       <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//                       </svg>
//                     </div>
//                     <div>
//                       <h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Orders</h4>
//                       <p className="text-sm text-gray-500">Manage all orders</p>
//                     </div>
//                   </div>
//                 </div>
//               </Link>

//               {/* Menu - ALL ROLES */}
//               <Link href="/dashboard/menu">
//                 <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all cursor-pointer group border-2 border-transparent hover:border-purple-500">
//                   <div className="flex items-center space-x-4">
//                     <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-3 group-hover:scale-110 transition-transform">
//                       <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
//                       </svg>
//                     </div>
//                     <div>
//                       <h4 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">Menu</h4>
//                       <p className="text-sm text-gray-500">{userRole === 'staff' ? 'View menu items' : 'Manage menu items'}</p>
//                     </div>
//                   </div>
//                 </div>
//               </Link>

//               {/* Point of Sale - MANAGER & ADMIN ONLY */}
//               {(userRole === 'manager' || userRole === 'admin') && (
//                 <Link href="/dashboard/pos">
//                   <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all cursor-pointer group border-2 border-transparent hover:border-primary-500">
//                     <div className="flex items-center space-x-4">
//                       <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-3 group-hover:scale-110 transition-transform">
//                         <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
//                         </svg>
//                       </div>
//                       <div>
//                         <h4 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">Point of Sale</h4>
//                         <p className="text-sm text-gray-500">Process new orders</p>
//                       </div>
//                     </div>
//                   </div>
//                 </Link>
//               )}

//               {/* Inventory - MANAGER & ADMIN ONLY */}
//               {(userRole === 'manager' || userRole === 'admin') && (
//                 <Link href="/dashboard/inventory">
//                   <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all cursor-pointer group border-2 border-transparent hover:border-yellow-500">
//                     <div className="flex items-center space-x-4">
//                       <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-3 group-hover:scale-110 transition-transform">
//                         <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
//                         </svg>
//                       </div>
//                       <div>
//                         <h4 className="text-lg font-semibold text-gray-900 group-hover:text-yellow-600 transition-colors">Inventory</h4>
//                         <p className="text-sm text-gray-500">Track stock levels</p>
//                       </div>
//                     </div>
//                   </div>
//                 </Link>
//               )}

//               {/* Analytics - MANAGER & ADMIN ONLY */}
//               {(userRole === 'manager' || userRole === 'admin') && (
//                 <Link href="/dashboard/analytics">
//                   <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all cursor-pointer group border-2 border-transparent hover:border-red-500">
//                     <div className="flex items-center space-x-4">
//                       <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-3 group-hover:scale-110 transition-transform">
//                         <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//                         </svg>
//                       </div>
//                       <div>
//                         <h4 className="text-lg font-semibold text-gray-900 group-hover:text-red-600 transition-colors">Analytics</h4>
//                         <p className="text-sm text-gray-500">View reports</p>
//                       </div>
//                     </div>
//                   </div>
//                 </Link>
//               )}

//               {/* Settings - ADMIN ONLY */}
//               {userRole === 'admin' && (
//                 <Link href="/dashboard/settings">
//                   <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all cursor-pointer group border-2 border-transparent hover:border-gray-500">
//                     <div className="flex items-center space-x-4">
//                       <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl p-3 group-hover:scale-110 transition-transform">
//                         <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                         </svg>
//                       </div>
//                       <div>
//                         <h4 className="text-lg font-semibold text-gray-900 group-hover:text-gray-600 transition-colors">Settings</h4>
//                         <p className="text-sm text-gray-500">Configure system</p>
//                       </div>
//                     </div>
//                   </div>
//                 </Link>
//               )}

//               {/* Admin Panel - ADMIN ONLY */}
//               {userRole === 'admin' && (
//                 <Link href="/admin">
//                   <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all cursor-pointer group border-2 border-transparent hover:border-green-500">
//                     <div className="flex items-center space-x-4">
//                       <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-3 group-hover:scale-110 transition-transform">
//                         <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
//                         </svg>
//                       </div>
//                       <div>
//                         <h4 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">Admin Panel</h4>
//                         <p className="text-sm text-gray-500">Create staff accounts</p>
//                       </div>
//                     </div>
//                   </div>
//                 </Link>
//               )}
//             </div>
//           </div>

//           {/* Right Sidebar */}
//           <div className="space-y-8">
//             {/* QR Code Generator (Manager & Admin Only) */}
//             {(userRole === 'admin' || userRole === 'manager') && (
//               <MenuQRCode />
//             )}

//             {/* System Info */}
//             <div>
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">System Info</h3>
//               <div className="bg-white rounded-xl shadow-md p-6">
//                 <div className="space-y-4">
//                   <div className="pb-4 border-b border-gray-100">
//                     <div className="flex items-center justify-between mb-2">
//                       <span className="text-sm text-gray-600">Database</span>
//                       <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Connected</span>
//                     </div>
//                   </div>
//                   <div className="pb-4 border-b border-gray-100">
//                     <div className="flex items-center justify-between mb-2">
//                       <span className="text-sm text-gray-600">Authentication</span>
//                       <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Active</span>
//                     </div>
//                   </div>
//                   <div className="pb-4 border-b border-gray-100">
//                     <div className="flex items-center justify-between mb-2">
//                       <span className="text-sm text-gray-600">User ID</span>
//                       <span className="text-xs font-mono text-gray-500">{user.id.slice(0, 12)}...</span>
//                     </div>
//                   </div>
//                   <div>
//                     <div className="flex items-center justify-between">
//                       <span className="text-sm text-gray-600">Last Login</span>
//                       <span className="text-xs text-gray-500">{new Date(user.last_sign_in_at || user.created_at).toLocaleString()}</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   )
// } 
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.user) {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="max-w-6xl w-full mx-4 grid md:grid-cols-2 gap-8 items-center">
        {/* Left Side - Illustration/Info */}
        <div className="hidden md:block text-center space-y-6">
          <div className="bg-white/40 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-emerald-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
              <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome Back!</h2>
            <p className="text-gray-600 text-lg">
              Manage your café operations with CaféFlow
            </p>
            <div className="mt-8 space-y-3 text-left">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-700">Order tracking</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-700">Inventory management</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-700">Analytics dashboard</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 border border-white/20">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-emerald-600 rounded-2xl mb-4 shadow-lg">
                <span className="text-2xl font-bold text-white">☕</span>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                Sign In
              </h1>
              <p className="text-gray-600">Welcome back to CaféFlow</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-300"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-300"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
            <input
              id="remember"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
            />
            <label htmlFor="remember" className="ml-2 block text-sm text-gray-700 cursor-pointer">
              Remember me
            </label>
          </div>

          {/* Forgot Password - Contact Admin */}
          <div className="text-center mt-2">
            {/* <p className="text-sm text-gray-500">
              Forgot password? Contact your administrator for a reset.
            </p> */}
          </div>
          </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-600 to-emerald-600 text-white py-3.5 px-4 rounded-xl hover:from-primary-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              {/* <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">New to CaféFlow?</span>
              </div> */}
            </div>

            {/* Sign Up Link */}
            {/* <div className="text-center">
              <Link href="/signup" className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold transition group">
                Create an account
                <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div> */}
          </div>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 transition group">
              <svg className="mr-2 w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}