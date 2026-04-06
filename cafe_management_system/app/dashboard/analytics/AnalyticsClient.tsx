'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

interface Order {
  id: string
  created_at: string
  total_amount: number
  status: string
  order_items: any[]
}

interface MenuItem {
  id: string
  name: string
  price: number
}

export default function AnalyticsClient({ orders, menuItems }: { orders: Order[], menuItems: MenuItem[] }) {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('week')

  // Calculate statistics
  const stats = useMemo(() => {
    const now = new Date()
    let filteredOrders = orders

    if (timeRange === 'today') {
      filteredOrders = orders.filter(o => {
        const orderDate = new Date(o.created_at)
        return orderDate.toDateString() === now.toDateString()
      })
    } else if (timeRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      filteredOrders = orders.filter(o => new Date(o.created_at) >= weekAgo)
    } else if (timeRange === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      filteredOrders = orders.filter(o => new Date(o.created_at) >= monthAgo)
    }

    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total_amount, 0)
    const totalOrders = filteredOrders.length
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    const completedOrders = filteredOrders.filter(o => o.status === 'completed').length

    // Popular items
    const itemCounts: Record<string, { name: string, count: number, revenue: number }> = {}
    filteredOrders.forEach(order => {
      order.order_items?.forEach((item: any) => {
        const itemName = item.menu_items?.name || 'Unknown'
        if (!itemCounts[itemName]) {
          itemCounts[itemName] = { name: itemName, count: 0, revenue: 0 }
        }
        itemCounts[itemName].count += item.quantity
        itemCounts[itemName].revenue += item.price * item.quantity
      })
    })

    const popularItems = Object.values(itemCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      completedOrders,
      popularItems
    }
  }, [orders, timeRange])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
              <p className="text-gray-600 mt-1">Sales performance and insights</p>
            </div>

            {/* Time Range Selector */}
            <div className="flex space-x-2 bg-white rounded-xl p-1 shadow-md">
              {(['today', 'week', 'month', 'all'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    timeRange === range
                      ? 'bg-red-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {range === 'today' ? 'Today' : range === 'week' ? '7 Days' : range === 'month' ? '30 Days' : 'All Time'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 rounded-xl p-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</h3>
            <p className="text-sm text-gray-500 mt-1">Total Revenue</p>
          </div>

          {/* Total Orders */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 rounded-xl p-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalOrders}</h3>
            <p className="text-sm text-gray-500 mt-1">Total Orders</p>
          </div>

          {/* Average Order Value */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 rounded-xl p-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">${stats.avgOrderValue.toFixed(2)}</h3>
            <p className="text-sm text-gray-500 mt-1">Avg Order Value</p>
          </div>

          {/* Completed Orders */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-100 rounded-xl p-3">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.completedOrders}</h3>
            <p className="text-sm text-gray-500 mt-1">Completed Orders</p>
          </div>
        </div>

        {/* Popular Items */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Top Selling Items</h2>
          <div className="space-y-4">
            {stats.popularItems.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="bg-red-100 text-red-600 rounded-full w-10 h-10 flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.count} orders</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">${item.revenue.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">Revenue</p>
                </div>
              </div>
            ))}
            {stats.popularItems.length === 0 && (
              <p className="text-center text-gray-500 py-8">No orders yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}