'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface MenuItem {
  id: string
  name: string
  category: string
  stock_quantity: number
  price: number
}

export default function InventoryClient({ menuItems: initialItems }: { menuItems: MenuItem[] }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialItems)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newQuantity, setNewQuantity] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleUpdateStock = async (itemId: string, quantity: number) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: updateError } = await supabase
        .from('menu_items')
        .update({ stock_quantity: quantity })
        .eq('id', itemId)
        .select()
        .single()

      if (updateError) throw updateError

      setMenuItems(menuItems.map(item => item.id === itemId ? data : item))
      setEditingId(null)
    } catch (err: any) {
      setError(err.message || 'Failed to update stock')
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (item: MenuItem) => {
    setEditingId(item.id)
    setNewQuantity(item.stock_quantity)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setNewQuantity(0)
  }

  const getLowStockItems = () => menuItems.filter(item => item.stock_quantity < 10)

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
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
            <p className="text-gray-600 mt-1">Track and manage stock levels</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Low Stock Alert */}
        {getLowStockItems().length > 0 && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  {getLowStockItems().length} items with low stock (less than 10 units)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {menuItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{item.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${item.price.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === item.id ? (
                      <input
                        type="number"
                        min="0"
                        value={newQuantity}
                        onChange={(e) => setNewQuantity(parseInt(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                      />
                    ) : (
                      <div className={`text-sm font-semibold ${item.stock_quantity < 10 ? 'text-red-600' : 'text-gray-900'}`}>
                        {item.stock_quantity} units
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.stock_quantity === 0 ? 'bg-red-100 text-red-700' :
                      item.stock_quantity < 10 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {item.stock_quantity === 0 ? 'Out of Stock' :
                       item.stock_quantity < 10 ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {editingId === item.id ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdateStock(item.id, newQuantity)}
                          disabled={loading}
                          className="text-green-600 hover:text-green-900 font-medium"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="text-gray-600 hover:text-gray-900 font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit(item)}
                        className="text-yellow-600 hover:text-yellow-900 font-medium"
                      >
                        Update
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {menuItems.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No menu items found
            </div>
          )}
        </div>
      </div>
    </div>
  )
}