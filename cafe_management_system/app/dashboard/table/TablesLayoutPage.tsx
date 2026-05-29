'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Table {
  number: number
  capacity: number
  status: 'available' | 'occupied' | 'reserved'
}

const TableIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 64 64">
    <rect x="26" y="6" width="12" height="6" rx="2" opacity="0.5"/>
    <rect x="26" y="52" width="12" height="6" rx="2" opacity="0.5"/>
    <rect x="6" y="26" width="6" height="12" rx="2" opacity="0.5"/>
    <rect x="52" y="26" width="6" height="12" rx="2" opacity="0.5"/>
    <rect x="18" y="18" width="28" height="28" rx="4"/>
  </svg>
)

export default function TablesLayoutPage() {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    setLoading(false)
    initializeTables()
    fetchTableStatuses()
  }

  const initializeTables = () => {
    setTables([
      { number: 1, capacity: 2, status: 'available' },
      { number: 2, capacity: 2, status: 'available' },
      { number: 3, capacity: 4, status: 'available' },
      { number: 4, capacity: 4, status: 'available' },
      { number: 5, capacity: 4, status: 'available' },
      { number: 6, capacity: 6, status: 'available' },
      { number: 7, capacity: 2, status: 'available' },
      { number: 8, capacity: 2, status: 'available' },
      { number: 9, capacity: 4, status: 'available' },
      { number: 10, capacity: 4, status: 'available' },
      { number: 11, capacity: 6, status: 'available' },
      { number: 12, capacity: 8, status: 'available' },
    ])
  }

  const fetchTableStatuses = async () => {
    const { data: orders } = await supabase
      .from('orders')
      .select('table_number, status')
      .eq('order_type', 'dine_in')
      .in('status', ['pending', 'preparing'])

    if (orders) {
      setTables(prev => prev.map(table => {
        const hasActiveOrder = orders.some(o => o.table_number === table.number.toString())
        return { ...table, status: hasActiveOrder ? 'occupied' : 'available' }
      }))
    }
  }

  const handleTableClick = (tableNumber: number) => {
  const table = tables.find(t => t.number === tableNumber)
  if (table?.status === 'occupied') {
    router.push(`/dashboard/tables/${tableNumber}/bill`)
  } else {
    router.push(`/dashboard/tables/${tableNumber}`)
  }
}

  const getStyles = (status: string) => {
    switch (status) {
      case 'available':
        return {
          card: 'bg-white border-2 border-green-200 hover:border-green-500',
          icon: 'text-green-600 bg-green-50',
          badge: 'bg-green-100 text-green-700',
        }
      case 'occupied':
        return {
          card: 'bg-white border-2 border-red-200 hover:border-red-500',
          icon: 'text-red-600 bg-red-50',
          badge: 'bg-red-100 text-red-700',
        }
      case 'reserved':
        return {
          card: 'bg-white border-2 border-yellow-200 hover:border-yellow-500',
          icon: 'text-yellow-600 bg-yellow-50',
          badge: 'bg-yellow-100 text-yellow-700',
        }
      default:
        return {
          card: 'bg-white border-2 border-gray-200',
          icon: 'text-gray-600 bg-gray-50',
          badge: 'bg-gray-100 text-gray-700',
        }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-white rounded-lg transition-all"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Floor Plan</h1>
              <p className="text-sm text-gray-500">Click a table to take an order</p>
            </div>
          </div>
          <button
            onClick={fetchTableStatuses}
            className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all flex items-center space-x-2 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-6">
          <div className="flex items-center justify-center space-x-8 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-700 font-medium">Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-700 font-medium">Occupied</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-700 font-medium">Reserved</span>
            </div>
          </div>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {tables.map((table) => {
            const s = getStyles(table.status)
            return (
              <button
                key={table.number}
                onClick={() => handleTableClick(table.number)}
                className={`${s.card} rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer`}
              >
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-3">{table.number}</div>
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${s.icon} mb-3`}>
                    <TableIcon className="w-8 h-8" />
                  </div>
                  <div className="text-sm text-gray-600 mb-3">{table.capacity} seats</div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${s.badge}`}>
                    {table.status}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Tables</p>
              <p className="text-3xl font-bold text-gray-900">{tables.length}</p>
            </div>
            <div className="bg-gray-50 rounded-full p-3 text-gray-600">
              <TableIcon className="w-7 h-7" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Available</p>
              <p className="text-3xl font-bold text-green-600">{tables.filter(t => t.status === 'available').length}</p>
            </div>
            <div className="bg-green-50 rounded-full p-3 text-green-600">
              <TableIcon className="w-7 h-7" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Occupied</p>
              <p className="text-3xl font-bold text-red-600">{tables.filter(t => t.status === 'occupied').length}</p>
            </div>
            <div className="bg-red-50 rounded-full p-3 text-red-600">
              <TableIcon className="w-7 h-7" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}