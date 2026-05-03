'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  available: boolean
}

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
}

export default function TableOrderPage() {
  const params = useParams()
  const router = useRouter()
  const tableNumber = params?.tableNumber as string
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [customerName, setCustomerName] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchMenuItems()
  }, [])

  const fetchMenuItems = async () => {
    const { data } = await supabase
      .from('menu_items')
      .select('*')
      .eq('available', true)
      .order('category', { ascending: true })

    if (data) setMenuItems(data)
  }

  const categories = ['All', ...Array.from(new Set(menuItems.map(item => item.category)))]
  
  const filteredItems = selectedCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory)

  const addToOrder = (item: MenuItem) => {
    const existingItem = orderItems.find(i => i.id === item.id)
    
    if (existingItem) {
      setOrderItems(orderItems.map(i => 
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      ))
    } else {
      setOrderItems([...orderItems, {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1
      }])
    }
  }

  const updateQuantity = (id: string, change: number) => {
    const item = orderItems.find(i => i.id === id)
    if (!item) return

    const newQuantity = item.quantity + change

    if (newQuantity <= 0) {
      setOrderItems(orderItems.filter(i => i.id !== id))
    } else {
      setOrderItems(orderItems.map(i => 
        i.id === id ? { ...i, quantity: newQuantity } : i
      ))
    }
  }

  const getTotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const placeOrder = async () => {
    if (orderItems.length === 0) {
      alert('Please add items to order')
      return
    }

    setLoading(true)

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: customerName || `Table ${tableNumber}`,
          table_number: tableNumber,
          order_type: 'dine_in',
          status: 'pending',
          total_amount: getTotal(),
          notes: notes || null
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItemsData = orderItems.map(item => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        price: item.price
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsData)

      if (itemsError) throw itemsError

      setSuccess(true)
      
      // Reset form
      setOrderItems([])
      setCustomerName('')
      setNotes('')
      
      // Redirect back to tables after 2 seconds
      setTimeout(() => {
        router.push('/dashboard/tables')
      }, 2000)

    } catch (error: any) {
      alert('Error placing order: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard/tables')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Table {tableNumber}</h1>
                <p className="text-sm text-gray-500">Take Order</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-primary-100 text-primary-700 px-4 py-2 rounded-lg font-semibold">
                {orderItems.length} items
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
            <p className="text-green-700 font-medium">✅ Order placed successfully! Redirecting...</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu Items - Left Side */}
          <div className="lg:col-span-2">
            {/* Category Filter */}
            <div className="mb-4 flex space-x-2 overflow-x-auto pb-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => addToOrder(item)}
                  className="bg-white rounded-xl shadow-md p-4 hover:shadow-xl transition-all text-left hover:border-2 hover:border-primary-500"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900">{item.name}</h3>
                    <span className="text-lg font-bold text-primary-600">Rs.{item.price.toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                  <div className="mt-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{item.category}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Order Summary - Right Side */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

              {/* Order Items */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {orderItems.length > 0 ? (
                  orderItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">Rs.{item.price.toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold"
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-8 h-8 rounded bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-sm">No items yet</p>
                  </div>
                )}
              </div>

              {/* Customer Details */}
              <div className="space-y-3 mb-6">
                <input
                  type="text"
                  placeholder="Customer Name (optional)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
                <textarea
                  placeholder="Special instructions (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              {/* Total */}
              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">Rs.{getTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-primary-600">Rs.{getTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={placeOrder}
                  disabled={loading || orderItems.length === 0}
                  className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Placing Order...' : 'Place Order'}
                </button>
                <button
                  onClick={() => setOrderItems([])}
                  disabled={orderItems.length === 0}
                  className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-all font-semibold disabled:opacity-50"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}