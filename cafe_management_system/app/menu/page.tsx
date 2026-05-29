'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

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

export default function CustomerMenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [orderType, setOrderType] = useState<'dine_in' | 'takeaway'>('dine_in')
  const [selectedTable, setSelectedTable] = useState<string>('')
  const [customerName, setCustomerName] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const supabase = createClient()

  const tableNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

  useEffect(() => {
    fetchMenu()
  }, [])

  const fetchMenu = async () => {
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
      if (existing) return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c)
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(c => {
      if (c.id === id) {
        const q = c.quantity + delta
        return q > 0 ? { ...c, quantity: q } : c
      }
      return c
    }).filter(c => c.quantity > 0))
  }

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0)
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0)

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return
    if (orderType === 'dine_in' && !selectedTable) {
      alert('Please select your table number')
      return
    }

    setSubmitting(true)

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        table_number: orderType === 'dine_in' ? selectedTable : null,
        order_type: orderType,
        status: 'pending',
        customer_name: customerName || null,
        notes: notes || null,
        total_amount: subtotal,
      })
      .select()
      .single()

    if (orderError || !order) {
      alert('Failed to place order: ' + (orderError?.message || 'Unknown'))
      setSubmitting(false)
      return
    }

    const orderItems = cart.map(i => ({
      order_id: order.id,
      menu_item_id: i.id,
      quantity: i.quantity,
      price: i.price,
    }))

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)

    if (itemsError) {
      alert('Failed to save items: ' + itemsError.message)
      setSubmitting(false)
      return
    }

    setOrderPlaced(true)
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-600"></div>
      </div>
    )
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h1>
          <p className="text-gray-600 mb-4">
            {orderType === 'dine_in'
              ? `Your order will be delivered to Table ${selectedTable}.`
              : 'Your takeaway order is being prepared.'}
          </p>
          <p className="text-3xl font-bold text-green-600 mb-6">Rs. {subtotal.toFixed(2)}</p>
          <button
            onClick={() => {
              setCart([])
              setSelectedTable('')
              setCustomerName('')
              setNotes('')
              setOrderPlaced(false)
            }}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700"
          >
            Place Another Order
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white p-6 shadow-md sticky top-0 z-40">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold">CaféFlow Menu</h1>
          <p className="text-sm text-white/90">Tap an item to add it to your order</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4">
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto mb-4 pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-green-600 text-white shadow'
                  : 'bg-white text-gray-700 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {filteredMenu.map(item => {
            const inCart = cart.find(c => c.id === item.id)
            return (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900">{item.name}</h3>
                  <span className="text-green-600 font-bold">Rs. {Number(item.price).toFixed(2)}</span>
                </div>
                {item.description && <p className="text-xs text-gray-500 mb-3">{item.description}</p>}
                {inCart ? (
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 font-bold"
                    >-</button>
                    <span className="font-bold">{inCart.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-8 h-8 rounded-full bg-green-600 text-white hover:bg-green-700 font-bold"
                    >+</button>
                  </div>
                ) : (
                  <button
                    onClick={() => addToCart(item)}
                    className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold text-sm hover:bg-green-700"
                  >
                    Add to Order
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Order config (only show when cart has items) */}
        {cart.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Details</h2>

            {/* Order Type */}
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Order Type</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setOrderType('dine_in')}
                  className={`py-2 px-3 rounded-lg font-semibold text-sm ${
                    orderType === 'dine_in'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >🍽️ Dine In</button>
                <button
                  onClick={() => setOrderType('takeaway')}
                  className={`py-2 px-3 rounded-lg font-semibold text-sm ${
                    orderType === 'takeaway'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >🥡 Takeaway</button>
              </div>
            </div>

            {/* Table Selector (only show if Dine In) */}
            {orderType === 'dine_in' && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Select Your Table <span className="text-red-500">*</span>
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {tableNumbers.map(n => (
                    <button
                      key={n}
                      onClick={() => setSelectedTable(n.toString())}
                      className={`py-3 rounded-lg font-bold transition-all ${
                        selectedTable === n.toString()
                          ? 'bg-green-600 text-white shadow ring-2 ring-green-300'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <input
              type="text"
              placeholder="Your name (optional)"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg mb-3 text-sm"
            />
            <textarea
              placeholder="Special instructions (optional)"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
        )}
      </div>

      {/* Sticky bottom bar with Place Order button */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-2xl">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-500">{totalItems} item{totalItems !== 1 ? 's' : ''}</p>
                <p className="text-2xl font-bold text-green-600">Rs. {subtotal.toFixed(2)}</p>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={submitting || (orderType === 'dine_in' && !selectedTable)}
                className={`px-6 py-3 rounded-xl font-bold ${
                  submitting || (orderType === 'dine_in' && !selectedTable)
                    ? 'bg-gray-300 text-gray-500'
                    : 'bg-green-600 text-white hover:bg-green-700 shadow'
                }`}
              >
                {submitting ? 'Placing...' : 'Place Order'}
              </button>
            </div>
            {orderType === 'dine_in' && !selectedTable && (
              <p className="text-xs text-center text-red-500">Please select your table number to continue</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}