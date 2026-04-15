// 'use client'

// import { useState } from 'react'
// import { createClient } from '@/lib/supabase/client'
// import Link from 'next/link'

// export default function AdminPanel({ adminUser }: { adminUser: any }) {
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [username, setUsername] = useState('')
//   const [role, setRole] = useState<'staff' | 'manager'>('staff')
//   const [error, setError] = useState<string | null>(null)
//   const [success, setSuccess] = useState(false)
//   const [loading, setLoading] = useState(false)
//   const supabase = createClient()

//   const handleCreateUser = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setError(null)
//     setLoading(true)

//     if (password.length < 6) {
//       setError('Password must be at least 6 characters')
//       setLoading(false)
//       return
//     }

//     try {
//       // Create user account
//       const { data, error: signUpError } = await supabase.auth.signUp({
//         email,
//         password,
//         options: {
//           data: {
//             username,
//             role,
//           },
//         },
//       })

//       if (signUpError) {
//         setError(signUpError.message)
//         return
//       }

//       if (data.user) {
//         // Add to staff_users table
//         const { error: staffError } = await supabase
//           .from('staff_users')
//           .insert({
//             email,
//             username,
//             role,
//             created_by: adminUser.id,
//           })

//         if (staffError) {
//           console.error('Error adding to staff table:', staffError)
//         }

//         setSuccess(true)
        
//         // Reset form
//         setTimeout(() => {
//           setEmail('')
//           setPassword('')
//           setUsername('')
//           setRole('staff')
//           setSuccess(false)
//         }, 2000)
//       }
//     } catch (err) {
//       setError('An unexpected error occurred')
//       console.error(err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center px-4">
//       <div className="max-w-md w-full">
//         <div className="bg-white rounded-2xl shadow-xl p-8">
//           {/* Header */}
//           <div className="text-center mb-8">
//             <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mb-4">
//               <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
//               </svg>
//             </div>
//             <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h2>
//             <p className="text-gray-600">Create Staff & Manager Accounts</p>
//           </div>

//           {/* Success Message */}
//           {success && (
//             <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
//               <div className="flex items-center">
//                 <svg className="h-5 w-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                 </svg>
//                 <p className="text-sm text-green-700 font-medium">User created successfully!</p>
//               </div>
//             </div>
//           )}

//           {/* Error Message */}
//           {error && (
//             <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
//               <div className="flex items-center">
//                 <svg className="h-5 w-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//                 </svg>
//                 <p className="text-sm text-red-700">{error}</p>
//               </div>
//             </div>
//           )}

//           {/* Form */}
//           <form onSubmit={handleCreateUser} className="space-y-5">
//             {/* Email */}
//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
//                 Email Address
//               </label>
//               <input
//                 id="email"
//                 type="email"
//                 required
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
//                 placeholder="staff@cafeflow.com"
//               />
//             </div>

//             {/* Username */}
//             <div>
//               <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
//                 Username
//               </label>
//               <input
//                 id="username"
//                 type="text"
//                 required
//                 value={username}
//                 onChange={(e) => setUsername(e.target.value)}
//                 className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
//                 placeholder="johndoe"
//               />
//             </div>

//             {/* Password */}
//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
//                 Password
//               </label>
//               <input
//                 id="password"
//                 type="password"
//                 required
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
//                 placeholder="Minimum 6 characters"
//               />
//               <p className="mt-1 text-xs text-gray-500">Give this password to the staff member</p>
//             </div>

//             {/* Role Selection */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-3">
//                 Select Role
//               </label>
//               <div className="grid grid-cols-2 gap-3">
//                 <button
//                   type="button"
//                   onClick={() => setRole('staff')}
//                   className={`p-4 rounded-xl border-2 transition-all ${
//                     role === 'staff'
//                       ? 'border-green-500 bg-green-50 text-green-700'
//                       : 'border-gray-200 hover:border-gray-300'
//                   }`}
//                 >
//                   <div className="text-center">
//                     <svg className={`w-8 h-8 mx-auto mb-2 ${role === 'staff' ? 'text-green-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                     </svg>
//                     <div className="font-semibold">Staff</div>
//                     <div className="text-xs text-gray-500 mt-1">View & manage orders</div>
//                   </div>
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() => setRole('manager')}
//                   className={`p-4 rounded-xl border-2 transition-all ${
//                     role === 'manager'
//                       ? 'border-green-500 bg-green-50 text-green-700'
//                       : 'border-gray-200 hover:border-gray-300'
//                   }`}
//                 >
//                   <div className="text-center">
//                     <svg className={`w-8 h-8 mx-auto mb-2 ${role === 'manager' ? 'text-green-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
//                     </svg>
//                     <div className="font-semibold">Manager</div>
//                     <div className="text-xs text-gray-500 mt-1">Full access + reports</div>
//                   </div>
//                 </button>
//               </div>
//             </div>

//             {/* Submit Button */}
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
//             >
//               {loading ? (
//                 <span className="flex items-center justify-center">
//                   <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                   </svg>
//                   Creating Account...
//                 </span>
//               ) : (
//                 'Create User Account'
//               )}
//             </button>
//           </form>

//           {/* Back to Dashboard */}
//           <div className="text-center mt-6">
//             <Link href="/dashboard" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors">
//               <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//               </svg>
//               Back to Dashboard
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminPanel() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'staff' | 'manager'>('staff')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [resetUserId, setResetUserId] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const supabase = createClient()

  // Fetch all users
  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('staff_users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setUsers(data)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)

    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          role,
          username,
        }
      })

      if (authError) throw authError

      // Create user record in staff_users table
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      const { error: dbError } = await supabase
        .from('staff_users')
        .insert({
          id: authData.user.id,
          email,
          username,
          role,
          created_by: currentUser?.id
        })

      if (dbError) throw dbError

      setMessage({ type: 'success', text: `${role} account created successfully!` })
      setEmail('')
      setUsername('')
      setPassword('')
      setRole('staff')
      fetchUsers() // Refresh user list
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to create user' })
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (userId: string) => {
    if (!newPassword || newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        password: newPassword
      })

      if (error) throw error

      setMessage({ type: 'success', text: 'Password reset successfully!' })
      setResetUserId(null)
      setNewPassword('')
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to reset password' })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to delete ${userEmail}?`)) return

    setLoading(true)
    try {
      // Delete from auth
      const { error: authError } = await supabase.auth.admin.deleteUser(userId)
      if (authError) throw authError

      // Delete from staff_users
      const { error: dbError } = await supabase
        .from('staff_users')
        .delete()
        .eq('id', userId)

      if (dbError) throw dbError

      setMessage({ type: 'success', text: 'User deleted successfully' })
      fetchUsers()
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete user' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create User Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Account</h2>

          {message && (
            <div className={`mb-6 p-4 rounded-lg border-l-4 ${
              message.type === 'success' 
                ? 'bg-green-50 border-green-500 text-green-700' 
                : 'bg-red-50 border-red-500 text-red-700'
            }`}>
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          )}

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-gray-900"
                placeholder="staff@cafeflow.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-gray-900"
                placeholder="john_doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-gray-900"
                placeholder="Minimum 6 characters"
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'staff' | 'manager')}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-gray-900"
              >
                <option value="staff">Staff</option>
                <option value="manager">Manager</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
        </div>

        {/* User List with Reset Password */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Users</h2>
          
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {users.map((user) => (
              <div key={user.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{user.username}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <span className={`inline-block mt-1 text-xs px-2 py-1 rounded-full ${
                      user.role === 'admin' ? 'bg-red-100 text-red-700' :
                      user.role === 'manager' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  {user.role !== 'admin' && (
                    <button
                      onClick={() => handleDeleteUser(user.id, user.email)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  )}
                </div>

                {/* Reset Password Section */}
                {resetUserId === user.id ? (
                  <div className="space-y-2 pt-3 border-t border-gray-200">
                    <input
                      type="password"
                      placeholder="New password (min 6 chars)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm text-gray-900"
                      minLength={6}
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleResetPassword(user.id)}
                        disabled={loading}
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50"
                      >
                        Save Password
                      </button>
                      <button
                        onClick={() => {
                          setResetUserId(null)
                          setNewPassword('')
                        }}
                        className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setResetUserId(user.id)}
                    className="w-full mt-3 bg-yellow-50 text-yellow-700 py-2 rounded-lg hover:bg-yellow-100 text-sm font-medium border border-yellow-200"
                  >
                    Reset Password
                  </button>
                )}
              </div>
            ))}

            {users.length === 0 && (
              <p className="text-center text-gray-500 py-8">No users found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}