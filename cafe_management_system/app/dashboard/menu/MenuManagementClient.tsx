'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  available: boolean
}

interface MenuManagementClientProps {
  menuItems: MenuItem[]
  userRole: string
}

export default function MenuManagementClient({ menuItems: initialItems, userRole }: MenuManagementClientProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialItems)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Coffee',
    available: true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const canEdit = userRole === 'manager' || userRole === 'admin'

  const categories = ['Coffee', 'Tea', 'Pastries', 'Food', 'Desserts', 'Beverages']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!formData.name || !formData.price) {
      setError('Name and price are required')
      setLoading(false)
      return
    }

    try {
      if (editingId) {
        // Update existing item
        const { data, error: updateError } = await supabase
          .from('menu_items')
          .update({
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            category: formData.category,
            available: formData.available,
          })
          .eq('id', editingId)
          .select()
          .single()

        if (updateError) throw updateError

        setMenuItems(menuItems.map(item => item.id === editingId ? data : item))
        setEditingId(null)
      } else {
        // Create new item
        const { data, error: insertError } = await supabase
          .from('menu_items')
          .insert({
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            category: formData.category,
            available: formData.available,
          })
          .select()
          .single()

        if (insertError) throw insertError

        setMenuItems([...menuItems, data])
        setIsAddingNew(false)
      }

      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'Coffee',
        available: true,
      })
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item: MenuItem) => {
    setEditingId(item.id)
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      available: item.available,
    })
    setIsAddingNew(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    setLoading(true)
    try {
      const { error: deleteError } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      setMenuItems(menuItems.filter(item => item.id !== id))
    } catch (err: any) {
      setError(err.message || 'Failed to delete item')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      const { data, error: updateError } = await supabase
        .from('menu_items')
        .update({ available: !currentStatus })
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      setMenuItems(menuItems.map(item => item.id === id ? data : item))
    } catch (err: any) {
      setError(err.message || 'Failed to update availability')
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setIsAddingNew(false)
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'Coffee',
      available: true,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
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
              <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
              <p className="text-gray-600 mt-1">
                {canEdit ? 'Manage your café menu items' : 'View menu items'}
              </p>
            </div>
            {canEdit && !isAddingNew && !editingId && (
              <button
                onClick={() => setIsAddingNew(true)}
                className="bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-all font-semibold shadow-lg hover:shadow-xl flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New Item
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Add/Edit Form */}
        {(isAddingNew || editingId) && canEdit && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editingId ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder="Cappuccino"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder="4.50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="Rich espresso with steamed milk..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                  <div className="flex items-center space-x-4 h-12">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.available === true}
                        onChange={() => setFormData({ ...formData, available: true })}
                        className="mr-2"
                      />
                      <span className="text-sm">Available</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.available === false}
                        onChange={() => setFormData({ ...formData, available: false })}
                        className="mr-2"
                      />
                      <span className="text-sm">Out of Stock</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary-600 text-white py-3 rounded-xl hover:bg-primary-700 transition-all font-semibold disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (editingId ? 'Update Item' : 'Add Item')}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 transition-all font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary-600">${item.price.toFixed(2)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${item.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {item.available ? 'Available' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>

                {/* Actions for Manager/Admin */}
                {canEdit && (
                  <div className="flex space-x-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleEdit(item)}
                      className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-all text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleAvailability(item.id, item.available)}
                      className="flex-1 bg-yellow-50 text-yellow-600 py-2 rounded-lg hover:bg-yellow-100 transition-all text-sm font-medium"
                    >
                      Toggle
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition-all text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {menuItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No menu items found</p>
            {canEdit && (
              <button
                onClick={() => setIsAddingNew(true)}
                className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
              >
                Add your first menu item
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}