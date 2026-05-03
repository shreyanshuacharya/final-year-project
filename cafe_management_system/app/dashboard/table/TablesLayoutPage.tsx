'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Table {
  number: number
  capacity: number
  status: 'available' | 'occupied' | 'reserved'
  currentOrder?: string
}

export default function TablesLayoutPage() {
  const [tables, setTables] = useState<Table[]>([])
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    initializeTables()
    fetchTableStatuses()
  }, [])

  const initializeTables = () => {
    // Create 12 tables (you can adjust this)
    const tablesData: Table[] = [
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
    ]
    setTables(tablesData)
  }

  const fetchTableStatuses = async () => {
    // Get active orders for each table
    const { data: orders } = await supabase
      .from('orders')
      .select('table_number, status')
      .eq('order_type', 'dine_in')
      .in('status', ['pending', 'preparing'])

    if (orders) {
      setTables(prev => prev.map(table => {
        const hasActiveOrder = orders.some(order => order.table_number === table.number.toString())
        return {
          ...table,
          status: hasActiveOrder ? 'occupied' : 'available'
        }
      }))
    }
  }

  const handleTableClick = (tableNumber: number) => {
    router.push(`/dashboard/tables/${tableNumber}`)
  }

  const getTableColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'from-green-500 to-emerald-600'
      case 'occupied':
        return 'from-red-500 to-red-600'
      case 'reserved':
        return 'from-yellow-500 to-yellow-600'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  const getTableIcon = (capacity: number) => {
    if (capacity <= 2) return '👥'
    if (capacity <= 4) return '👥👥'
    if (capacity <= 6) return '👥👥👥'
    return '👥👥👥👥'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Restaurant Floor Plan</h1>
              <p className="text-gray-500 mt-1">Click on a table to take order</p>
            </div>
            <button
              onClick={fetchTableStatuses}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-all flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Status Legend */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex items-center justify-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded"></div>
              <span className="text-sm text-gray-700">Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gradient-to-br from-red-500 to-red-600 rounded"></div>
              <span className="text-sm text-gray-700">Occupied</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded"></div>
              <span className="text-sm text-gray-700">Reserved</span>
            </div>
          </div>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {tables.map((table) => (
            <button
              key={table.number}
              onClick={() => handleTableClick(table.number)}
              className={`bg-gradient-to-br ${getTableColor(table.status)} rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 cursor-pointer`}
            >
              <div className="text-white text-center">
                {/* Table Number */}
                <div className="text-4xl font-bold mb-2">{table.number}</div>
                
                {/* Table Icon */}
                <div className="text-2xl mb-2">{getTableIcon(table.capacity)}</div>
                
                {/* Capacity */}
                <div className="text-sm opacity-90">
                  {table.capacity} seats
                </div>
                
                {/* Status Badge */}
                <div className="mt-3">
                  <span className="bg-white bg-opacity-30 px-3 py-1 rounded-full text-xs font-semibold uppercase">
                    {table.status}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Tables</p>
                <p className="text-3xl font-bold text-gray-900">{tables.length}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Available</p>
                <p className="text-3xl font-bold text-green-600">
                  {tables.filter(t => t.status === 'available').length}
                </p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Occupied</p>
                <p className="text-3xl font-bold text-red-600">
                  {tables.filter(t => t.status === 'occupied').length}
                </p>
              </div>
              <div className="bg-red-100 rounded-full p-3">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}