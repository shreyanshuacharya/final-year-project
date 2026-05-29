'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
// import { useRouter } from 'next/navigation'
import { useRouter, useParams } from 'next/navigation'

interface OrderItem {
  quantity: number
  price: number
  menu_items: { name: string } | null
}

interface Order {
  id: string
  customer_name: string | null
  status: string
  total_amount: number
  notes: string | null
  created_at: string
  order_items: OrderItem[]
}

export default function TableBillPage({ tableNumber: tableNumberProp }: { tableNumber?: string }) {
  const params = useParams()
  const tableNumber = tableNumberProp 
  || (params?.tableNumbers as string) 
  || (typeof window !== 'undefined' ? window.location.pathname.split('/')[3] : '')
  || ''
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [clearing, setClearing] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchBill()
  }, [])

  const fetchBill = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    console.log('Fetching bill for table:', JSON.stringify(tableNumber))

const { data, error } = await supabase
  .from('orders')
  .select(`
    id,
    customer_name,
    status,
    total_amount,
    notes,
    created_at,
    order_items (
      quantity,
      price,
      menu_items ( name )
    )
  `)
  .eq('order_type', 'dine_in')
  .eq('table_number', tableNumber.toString().trim())
  .in('status', ['pending', 'preparing'])
  .order('created_at', { ascending: true })

console.log('Bill query result:', { data, error, count: data?.length })

    if (error) {
      console.error(error)
    } else {
      setOrders((data as any) || [])
    }
    setLoading(false)
  }

  const handleClearTable = async () => {
    if (!confirm(`Mark Table ${tableNumber} as available and complete all orders?`)) return

    setClearing(true)
    const orderIds = orders.map(o => o.id)
    const { error } = await supabase
      .from('orders')
      .update({ status: 'completed' })
      .in('id', orderIds)

    if (error) {
      alert('Failed to clear table. Try again.')
      setClearing(false)
    } else {
      router.push('/dashboard/tables')
    }
  }

  const calculateGrandTotal = () => orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-600"></div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <p className="text-xl text-gray-700 mb-4">No active orders on Table {tableNumber}.</p>
            <button
              onClick={() => router.push('/dashboard/tables')}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-all"
            >
              Back to Floor Plan
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push('/dashboard/tables')}
              className="p-2 hover:bg-white rounded-lg transition-all"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Table {tableNumber} - Bill</h1>
              <p className="text-sm text-gray-500">{orders.length} active order{orders.length > 1 ? 's' : ''}</p>
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all flex items-center space-x-2 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span className="text-sm font-medium">Print</span>
          </button>
        </div>

        {/* Bill */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          {/* Receipt header */}
          <div className="text-center pb-4 border-b border-dashed border-gray-200 mb-4">
            <h2 className="text-2xl font-bold text-gray-900">CaféFlow</h2>
            <p className="text-sm text-gray-500">Table {tableNumber}</p>
            <p className="text-xs text-gray-400 mt-1">{new Date().toLocaleString()}</p>
          </div>

          {/* Each order block */}
          {orders.map((order, idx) => (
            <div key={order.id} className={`${idx > 0 ? 'mt-4 pt-4 border-t border-dashed border-gray-200' : ''}`}>
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    Order #{idx + 1}{order.customer_name ? ` - ${order.customer_name}` : ''}
                  </p>
                  <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleTimeString()}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-semibold uppercase ${
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {order.status}
                </span>
              </div>

              {/* Items */}
              <div className="space-y-2">
                {order.order_items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <span className="text-gray-700">{item.menu_items?.name || 'Item'}</span>
                      <span className="text-gray-400 ml-2">x{item.quantity}</span>
                    </div>
                    <span className="text-gray-900 font-medium">Rs. {(Number(item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {order.notes && (
                <p className="text-xs text-gray-500 italic mt-2 bg-gray-50 p-2 rounded">Note: {order.notes}</p>
              )}

              <div className="flex justify-between text-sm font-semibold mt-3 pt-2 border-t border-gray-100">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">Rs. {Number(order.total_amount).toFixed(2)}</span>
              </div>
            </div>
          ))}

          {/* Grand Total */}
          <div className="mt-6 pt-4 border-t-2 border-gray-900">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">GRAND TOTAL</span>
              <span className="text-2xl font-bold text-orange-600">Rs. {calculateGrandTotal().toFixed(2)}</span>
            </div>
          </div>

          <div className="text-center mt-6 pt-4 border-t border-dashed border-gray-200">
            <p className="text-xs text-gray-400">Thank you for dining with us</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 print:hidden">
          <button
            onClick={() => router.push(`/dashboard/tables/${tableNumber}`)}
            className="bg-white border-2 border-orange-500 text-orange-600 px-6 py-3 rounded-xl hover:bg-orange-50 transition-all font-semibold flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add More Items</span>
          </button>
          <button
            onClick={handleClearTable}
            disabled={clearing}
            className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all font-semibold flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {clearing ? (
              <span>Clearing...</span>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Complete & Clear Table</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}