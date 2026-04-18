'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

// Khalti types
declare global {
  interface Window {
    KhaltiCheckout: any
  }
}

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  available: boolean
}

interface CartItem extends MenuItem {
  quantity: number
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedItems, setSelectedItems] = useState<Record<string, { quantity: number }>>({})
  const [customerName, setCustomerName] = useState('')
  const [tableNumber, setTableNumber] = useState('')
  const [orderType, setOrderType] = useState<'dine_in' | 'takeaway'>('dine_in')
  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'khalti'>('cash')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [showCart, setShowCart] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [khaltiLoaded, setKhaltiLoaded] = useState(false)
  const supabase = createClient()

  // Load Khalti script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://khalti.s3.ap-south-1.amazonaws.com/KPG/dist/2020.12.17.0.0.0/khalti-checkout.iffe.js'
    script.async = true
    script.onload = () => setKhaltiLoaded(true)
    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

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
  const filteredItems = selectedCategory === 'All' ? menuItems : menuItems.filter(item => item.category === selectedCategory)

  const updateSelectedQuantity = (itemId: string, change: number) => {
    setSelectedItems(prev => {
      const current = prev[itemId]?.quantity || 0
      const newQuantity = Math.max(0, current + change)
      
      if (newQuantity === 0) {
        const { [itemId]: removed, ...rest } = prev
        return rest
      }
      
      return { ...prev, [itemId]: { quantity: newQuantity } }
    })
  }

  const getSelectionTotal = () => {
    let totalItems = 0
    let totalPrice = 0

    Object.entries(selectedItems).forEach(([itemId, { quantity }]) => {
      const item = menuItems.find(i => i.id === itemId)
      if (item) {
        totalItems += quantity
        totalPrice += item.price * quantity
      }
    })

    return { totalItems, totalPrice }
  }

  const addAllToCart = () => {
    const newCartItems: CartItem[] = []

    Object.entries(selectedItems).forEach(([itemId, { quantity }]) => {
      const item = menuItems.find(i => i.id === itemId)
      if (item) {
        const existingCartItem = cart.find(c => c.id === itemId)
        if (existingCartItem) {
          existingCartItem.quantity += quantity
        } else {
          newCartItems.push({ ...item, quantity })
        }
      }
    })

    setCart([...cart, ...newCartItems])
    setSelectedItems({})
    setShowCart(true)
  }

  const updateCartQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.id !== id))
    } else {
      setCart(cart.map(item => item.id === id ? { ...item, quantity } : item))
    }
  }

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id))
  }

  const getCartTotal = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  // Khalti payment handler
  const initiateKhaltiPayment = async (orderId: string, amount: number) => {
    if (!khaltiLoaded || !window.KhaltiCheckout) {
      setError('Khalti payment system not loaded. Please refresh the page.')
      return
    }

    const config = {
      publicKey: 'test_public_key_dc74e0fd57cb46cd93832aee0a390234',
      productIdentity: orderId,
      productName: 'CaféFlow Order',
      productUrl: window.location.origin,
      paymentPreference: ['KHALTI', 'EBANKING', 'MOBILE_BANKING'],
      eventHandler: {
        onSuccess: async (payload: any) => {
          console.log('✅ Payment Success:', payload)
          
          // Update order as paid
          await supabase
            .from('orders')
            .update({
              payment_status: 'paid',
              transaction_id: payload.idx
            })
            .eq('id', orderId)

          setSuccess(true)
          setCart([])
          setCustomerName('')
          setTableNumber('')
          setNotes('')
          setShowCart(false)
          setLoading(false)

          setTimeout(() => setSuccess(false), 5000)
        },
        onError: (error: any) => {
          console.log('❌ Payment Error:', error)
          setError('Payment failed: ' + (error.message || 'Unknown error'))
          setLoading(false)
        },
        onClose: () => {
          console.log('Payment widget closed')
          setLoading(false)
        }
      }
    }

    const checkout = new window.KhaltiCheckout(config)
    checkout.show({ amount: amount * 100 }) // Convert to paisa
  }

  const handlePlaceOrder = async () => {
    if (!customerName || cart.length === 0) {
      setError('Please enter your name and add items to cart')
      return
    }

    if (paymentMethod === 'khalti' && !khaltiLoaded) {
      setError('Khalti payment not ready. Please wait or choose Cash payment.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: customerName,
          table_number: orderType === 'dine_in' ? tableNumber : null,
          order_type: orderType,
          status: 'pending',
          total_amount: getCartTotal(),
          payment_method: paymentMethod,
          payment_status: paymentMethod === 'cash' ? 'pending' : 'pending',
          notes: notes || null
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        price: item.price
      }))

      await supabase.from('order_items').insert(orderItems)

      if (paymentMethod === 'cash') {
        // Cash payment - order placed
        setSuccess(true)
        setCart([])
        setCustomerName('')
        setTableNumber('')
        setNotes('')
        setShowCart(false)
        setLoading(false)
        setTimeout(() => setSuccess(false), 5000)
      } else if (paymentMethod === 'khalti') {
        // Open Khalti payment widget
        initiateKhaltiPayment(order.id, getCartTotal())
      }

    } catch (err: any) {
      setError(err.message || 'Failed to place order')
      setLoading(false)
    }
  }

  const { totalItems: selectedCount, totalPrice: selectedTotal } = getSelectionTotal()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">CaféFlow Menu</h1>
                <p className="text-sm text-gray-500">Order your favorites</p>
              </div>
            </div>
            <button
              onClick={() => setShowCart(!showCart)}
              className="relative bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 transition-all flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Cart ({cart.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
            <p className="text-sm text-green-700 font-medium">
              ✅ {paymentMethod === 'khalti' ? 'Payment successful! Order placed.' : 'Order placed successfully!'}
            </p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Filter */}
        <div className="mb-6 flex space-x-2 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                selectedCategory === cat ? 'bg-primary-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${showCart ? 'lg:grid-cols-2' : 'lg:grid-cols-3'} gap-6 mb-24`}>
          {filteredItems.map(item => {
            const selectedQty = selectedItems[item.id]?.quantity || 0
            const isSelected = selectedQty > 0

            return (
              <div 
                key={item.id} 
                className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden ${isSelected ? 'ring-4 ring-primary-500' : ''}`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{item.category}</p>
                    </div>
                    <p className="text-xl font-bold text-primary-600">Rs.{item.price.toFixed(2)}</p>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateSelectedQuantity(item.id, -1)}
                        disabled={selectedQty === 0}
                        className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center font-bold text-gray-700"
                      >
                        −
                      </button>
                      <span className={`text-lg font-bold min-w-[2rem] text-center ${isSelected ? 'text-primary-600' : 'text-gray-400'}`}>
                        {selectedQty}
                      </span>
                      <button
                        onClick={() => updateSelectedQuantity(item.id, 1)}
                        className="w-10 h-10 rounded-lg bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>
                    {isSelected && (
                      <div className="flex items-center text-primary-600">
                        <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                        </svg>
                        <span className="text-sm font-medium">Selected</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Floating Add to Cart Button */}
      {selectedCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-primary-500 shadow-2xl p-4 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-600">Selected Items</p>
              <p className="text-2xl font-bold text-gray-900">{selectedCount} items • Rs.{selectedTotal.toFixed(2)}</p>
            </div>
            <button
              onClick={addAllToCart}
              className="bg-primary-600 text-white px-8 py-4 rounded-xl hover:bg-primary-700 font-semibold text-lg shadow-lg flex items-center space-x-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Add All to Cart</span>
            </button>
          </div>
        </div>
      )}

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowCart(false)}>
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Your Cart</h2>
                <button onClick={() => setShowCart(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-500">Rs.{item.price.toFixed(2)} each</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold"
                          >
                            −
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center font-bold"
                          >
                            +
                          </button>
                          <button onClick={() => removeFromCart(item.id)} className="ml-2 text-red-500 hover:text-red-700">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4 mb-6">
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-900"
                    />

                    <div className="flex space-x-2">
                      <button
                        onClick={() => setOrderType('dine_in')}
                        className={`flex-1 py-3 rounded-lg font-medium ${orderType === 'dine_in' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                      >
                        Dine In
                      </button>
                      <button
                        onClick={() => setOrderType('takeaway')}
                        className={`flex-1 py-3 rounded-lg font-medium ${orderType === 'takeaway' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                      >
                        Takeaway
                      </button>
                    </div>

                    {orderType === 'dine_in' && (
                      <input
                        type="text"
                        placeholder="Table Number"
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-900"
                      />
                    )}

                    <textarea
                      placeholder="Special instructions (optional)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-900"
                    />

                    {/* Payment Method Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setPaymentMethod('cash')}
                          className={`py-3 px-4 rounded-lg border-2 transition-all flex items-center justify-center space-x-2 ${
                            paymentMethod === 'cash'
                              ? 'border-primary-600 bg-primary-50 text-primary-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span>💵</span>
                          <span className="font-medium">Cash</span>
                        </button>
                        <button
                          onClick={() => setPaymentMethod('khalti')}
                          className={`py-3 px-4 rounded-lg border-2 transition-all flex items-center justify-center space-x-2 ${
                            paymentMethod === 'khalti'
                              ? 'border-purple-600 bg-purple-50 text-purple-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span>🟣</span>
                          <span className="font-medium">Khalti</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-primary-600">Rs.{getCartTotal().toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className={`w-full py-4 rounded-xl font-semibold text-lg shadow-lg transition-all ${
                      paymentMethod === 'khalti'
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-primary-600 hover:bg-primary-700 text-white'
                    } disabled:opacity-50`}
                  >
                    {loading ? 'Processing...' : paymentMethod === 'khalti' ? '🟣 Pay with Khalti' : 'Place Order'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}