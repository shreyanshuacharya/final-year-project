'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
// import { useRouter, useParams } from 'next/navigation'

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  available: boolean
}

interface CartItem extends MenuItem {
  quantity: number
}

export default function TableOrderPage({ tableNumber: tableNumberProp }: { tableNumber?: string }) {
  const params = useParams()
  const tableNumber = tableNumberProp 
  || (params?.tableNumbers as string) 
  || (typeof window !== 'undefined' ? window.location.pathname.split('/')[3] : '')
  || ''
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [customerName, setCustomerName] = useState('')
  const [notes, setNotes] = useState('')
  const [orderType, setOrderType] = useState<'dine_in' | 'takeaway'>('dine_in')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchMenu()
  }, [])

  const fetchMenu = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data } = await supabase
      .from('menu_items')
      .select('*')
      .eq('available', true)
      .order('category')

    setMenuItems(data || [])
    setLoading(false)
  }

  const categories = ['All', ...Array.from(new Set(menuItems.map(i => i.category)))]
  const filteredMenu = activeCategory === 'All' ? menuItems : menuItems.filter(i => i.category === activeCategory)

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id)
      if (existing) {
        return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c)
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(c => {
      if (c.id === id) {
        const newQty = c.quantity + delta
        return newQty > 0 ? { ...c, quantity: newQty } : c
      }
      return c
    }).filter(c => c.quantity > 0))
  }

  const removeFromCart = (id: string) => setCart(prev => prev.filter(c => c.id !== id))

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return
    setSubmitting(true)

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        table_number: orderType === 'dine_in' ? tableNumber : null,
        order_type: orderType,
        status: 'pending',
        customer_name: customerName || null,
        notes: notes || null,
        total_amount: subtotal,
      })
      .select()
      .single()

    if (orderError || !order) {
      alert('Failed to place order: ' + (orderError?.message || 'Unknown error'))
      setSubmitting(false)
      return
    }

    const orderItems = cart.map(item => ({
      order_id: order.id,
      menu_item_id: item.id,
      quantity: item.quantity,
      price: item.price,
    }))

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)

    if (itemsError) {
      alert('Failed to save items: ' + itemsError.message)
      setSubmitting(false)
      return
    }

    router.push('/dashboard/tables')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button onClick={() => router.push('/dashboard/tables')} className="p-2 hover:bg-gray-100 rounded-lg">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Table {tableNumber}</h1>
              <p className="text-sm text-gray-500">Take Order</p>
            </div>
          </div>
          <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
            {totalItems} item{totalItems !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu Section */}
        <div className="lg:col-span-2">
          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-green-600 text-white shadow'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-green-500'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Menu grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMenu.map(item => (
              <button
                key={item.id}
                onClick={() => addToCart(item)}
                className="bg-white border border-gray-200 rounded-xl p-5 text-left hover:border-green-500 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900">{item.name}</h3>
                  <span className="text-green-600 font-bold">Rs. {Number(item.price).toFixed(2)}</span>
                </div>
                {item.description && <p className="text-sm text-gray-500 mb-3">{item.description}</p>}
                <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">{item.category}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Order Summary Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

            {/* ORDER TYPE TOGGLE */}
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Order Type</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setOrderType('dine_in')}
                  className={`py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                    orderType === 'dine_in'
                      ? 'bg-green-600 text-white shadow'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  🍽️ Dine In
                </button>
                <button
                  onClick={() => setOrderType('takeaway')}
                  className={`py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                    orderType === 'takeaway'
                      ? 'bg-orange-600 text-white shadow'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  🥡 Takeaway
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {orderType === 'dine_in'
                  ? `Table ${tableNumber} will be marked occupied.`
                  : 'Table will remain available.'}
              </p>
            </div>

            {/* Cart */}
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <div className="inline-block bg-gray-100 rounded-full p-6 mb-2">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-gray-500">No items yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">Rs. {Number(item.price).toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 rounded-full bg-white border border-gray-300 hover:bg-gray-100">-</button>
                      <span className="font-semibold w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 rounded-full bg-white border border-gray-300 hover:bg-gray-100">+</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <input
              type="text"
              placeholder="Customer Name (optional)"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg mb-3 text-sm"
            />
            <textarea
              placeholder="Special instructions (optional)"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg mb-4 text-sm"
            />

            <div className="border-t border-gray-200 pt-4 mb-4">
              <div className="flex justify-between text-gray-700 mb-1">
                <span>Subtotal</span>
                <span>Rs. {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900">
                <span>Total</span>
                <span className="text-green-600">Rs. {subtotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={cart.length === 0 || submitting}
              className={`w-full py-3 rounded-xl font-semibold transition-all ${
                cart.length === 0 || submitting
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700 shadow'
              }`}
            >
              {submitting ? 'Placing Order...' : 'Place Order'}
            </button>

            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="w-full mt-2 py-2 text-gray-500 hover:text-gray-700 text-sm"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}