'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

type Order = {
  id: string
  customer_name: string
  table_number: string | null
  order_type: string
  status: string
  total_amount: number
  notes: string | null
  created_at: string
}

type OrderItem = {
  id: string
  order_id: string
  quantity: number
  price: number
  menu_item: {
    name: string
  }
}

export default function OrdersClient() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  const supabase = createClient()

  useEffect(() => {
    fetchOrders()
    
    // Subscribe to real-time order updates
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchOrders()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchOrderItems = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          id,
          order_id,
          quantity,
          price,
          menu_item:menu_items(name)
        `)
        .eq('order_id', orderId)

      if (error) throw error
      setOrderItems(data as any || [])
    } catch (error) {
      console.error('Error fetching order items:', error)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId)

      if (error) throw error
      fetchOrders()
      
      // Update selected order if it's the one being updated
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus })
      }
    } catch (error) {
      console.error('Error updating order:', error)
    }
  }

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    fetchOrderItems(order.id)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'ready': return 'bg-green-100 text-green-800 border-green-300'
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter)

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    completed: orders.filter(o => o.status === 'completed').length,
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back to Dashboard */}
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      {/* Status Filter */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-3">
          {[
            { key: 'all', label: 'All Orders' },
            { key: 'pending', label: 'Pending' },
            { key: 'preparing', label: 'Preparing' },
            { key: 'ready', label: 'Ready' },
            { key: 'completed', label: 'Completed' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                statusFilter === key
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {label}
              <span className="ml-2 px-2 py-1 text-xs rounded-full bg-white bg-opacity-20">
                {statusCounts[key as keyof typeof statusCounts]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Orders List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Orders ({filteredOrders.length})</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-gray-600">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-600">No orders found</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div
                key={order.id}
                onClick={() => handleViewOrder(order)}
                className={`bg-white rounded-2xl shadow-md p-6 cursor-pointer transition-all hover:shadow-xl ${
                  selectedOrder?.id === order.id ? 'ring-2 ring-primary-500' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{order.customer_name}</h3>
                    <p className="text-sm text-gray-600">
                      {order.order_type === 'dine-in' ? '🍽️ Dine In' : '🥤 Takeaway'}
                      {order.table_number && ` • Table ${order.table_number}`}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">
                    {new Date(order.created_at).toLocaleString()}
                  </span>
                  <span className="text-lg font-bold text-primary-600">
                    ${order.total_amount.toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Order Details */}
        <div className="sticky top-24 h-fit">
          {selectedOrder ? (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Details</h2>

              <div className="space-y-6">
                {/* Customer Info */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Customer</h3>
                  <p className="text-lg font-semibold text-gray-900">{selectedOrder.customer_name}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Order Type</h3>
                    <p className="text-gray-900">{selectedOrder.order_type === 'dine-in' ? 'Dine In' : 'Takeaway'}</p>
                  </div>
                  {selectedOrder.table_number && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Table</h3>
                      <p className="text-gray-900">{selectedOrder.table_number}</p>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Order Time</h3>
                  <p className="text-gray-900">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                </div>

                {selectedOrder.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
                    <p className="text-gray-900 bg-yellow-50 p-3 rounded-lg">{selectedOrder.notes}</p>
                  </div>
                )}

                {/* Order Items */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Items</h3>
                  <div className="space-y-3">
                    {orderItems.map(item => (
                      <div key={item.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{item.menu_item.name}</p>
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-2xl font-bold text-primary-600">
                      ${selectedOrder.total_amount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Status Update Buttons */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Update Status</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { status: 'pending', label: 'Pending', color: 'yellow' },
                      { status: 'preparing', label: 'Preparing', color: 'blue' },
                      { status: 'ready', label: 'Ready', color: 'green' },
                      { status: 'completed', label: 'Completed', color: 'gray' },
                    ].map(({ status, label, color }) => (
                      <button
                        key={status}
                        onClick={() => updateOrderStatus(selectedOrder.id, status)}
                        disabled={selectedOrder.status === status}
                        className={`py-3 px-4 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                          selectedOrder.status === status
                            ? `bg-${color}-600 text-white`
                            : `bg-${color}-100 text-${color}-700 hover:bg-${color}-200`
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-600">Select an order to view details</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}