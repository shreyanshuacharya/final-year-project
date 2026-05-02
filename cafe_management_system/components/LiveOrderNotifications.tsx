'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Order {
  id: string
  customer_name: string
  total_amount: number
  created_at: string
  status: string
}

export default function LiveOrderNotifications() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNewOrderAlert, setShowNewOrderAlert] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Fetch initial pending orders
    fetchPendingOrders()

    // Subscribe to real-time order insertions
    const channel = supabase
      .channel('new-orders-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('🔔 New order notification!', payload)
          
          // Increment unread count
          setUnreadCount(prev => prev + 1)
          
          // Show visual alert
          setShowNewOrderAlert(true)
          setTimeout(() => setShowNewOrderAlert(false), 3000)
          
          // Play notification sound
          playNotificationSound()
          
          // Refresh pending orders
          fetchPendingOrders()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchPendingOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('id, customer_name, total_amount, created_at, status')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5)

    if (data) {
      setRecentOrders(data)
      setUnreadCount(data.length)
    }
  }

  const playNotificationSound = () => {
    // Simple beep using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      gainNode.gain.value = 0.3

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.2)
    } catch (error) {
      console.log('Could not play sound')
    }
  }

  const markAsRead = () => {
    setUnreadCount(0)
    setShowDropdown(false)
  }

  const getTimeAgo = (dateString: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    return `${Math.floor(seconds / 3600)}h ago`
  }

  return (
    <div className="relative">
      {/* New Order Alert Banner */}
      {showNewOrderAlert && (
        <div className="fixed top-20 right-6 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl border-4 border-white">
            <div className="flex items-center space-x-3">
              <svg className="w-8 h-8 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              <div>
                <p className="font-bold text-lg">New Order!</p>
                <p className="text-sm text-green-100">Check notifications</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Bell Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-all"
      >
        <svg 
          className={`w-6 h-6 text-gray-600 ${unreadCount > 0 ? 'animate-bounce' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
          />
        </svg>
        
        {/* Badge with count */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Pending Orders</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAsRead}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
            </div>

            {/* Orders List */}
            <div className="max-h-96 overflow-y-auto">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-all cursor-pointer"
                    onClick={() => {
                      // Navigate to orders page
                      window.location.href = '/dashboard/orders'
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{order.customer_name}</p>
                        <p className="text-sm text-gray-500">Order #{order.id.substring(0, 8)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary-600">Rs.{order.total_amount.toFixed(2)}</p>
                        <p className="text-xs text-gray-400">{getTimeAgo(order.created_at)}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                        PENDING
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-500 font-medium">No pending orders</p>
                  <p className="text-sm text-gray-400 mt-1">All caught up</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {recentOrders.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => {
                    window.location.href = '/dashboard/orders'
                  }}
                  className="w-full text-center text-sm font-medium text-primary-600 hover:text-primary-700 py-2"
                >
                  View All Orders →
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}