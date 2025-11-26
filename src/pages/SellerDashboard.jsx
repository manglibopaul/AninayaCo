import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

import { ShopContext } from '../context/ShopContext'

const SellerDashboard = () => {
  const navigate = useNavigate()
  const [seller, setSeller] = useState(null)
  const [products, setProducts] = useState([])
  const [sellerOrders, setSellerOrders] = useState([])
  const [selectedTab, setSelectedTab] = useState('products')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Accessories',
    subCategory: 'Keychains',
    stock: '',
    image: [],
    model: null,
  })
  const [imagePreview, setImagePreview] = useState([])

  const token = localStorage.getItem('sellerToken')
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
  const { refreshProducts } = useContext(ShopContext)

  useEffect(() => {
    if (!token) {
      navigate('/seller/login')
      return
    }

    const sellerData = localStorage.getItem('seller')
    if (sellerData) {
      setSeller(JSON.parse(sellerData))
    }

    fetchProducts()
  }, [token, navigate])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${apiUrl}/api/products/seller/my-products`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setProducts(response.data)
    } catch (error) {
      console.error('Error fetching products:', error)
      if (error.response?.status === 401) {
        localStorage.removeItem('sellerToken')
        navigate('/seller/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchSellerOrders = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${apiUrl}/api/sellers/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setSellerOrders(response.data || [])
    } catch (error) {
      console.error('Error fetching seller orders:', error)
      if (error.response?.status === 401) {
        localStorage.removeItem('sellerToken')
        navigate('/seller/login')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedTab === 'orders') fetchSellerOrders()
  }, [selectedTab])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    setFormData(prev => ({ ...prev, image: files }))
    
    // Create preview
    const previews = files.map(file => URL.createObjectURL(file))
    setImagePreview(previews)
  }

  const handleModelChange = (e) => {
    const file = e.target.files[0]
    setFormData(prev => ({ ...prev, model: file }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create FormData for multipart upload
      const uploadData = new FormData()
      uploadData.append('name', formData.name)
      uploadData.append('description', formData.description)
      uploadData.append('price', formData.price)
      uploadData.append('category', formData.category)
      uploadData.append('subCategory', formData.subCategory)
      uploadData.append('stock', formData.stock)

      // Add multiple images
      if (formData.image && formData.image.length > 0) {
        formData.image.forEach((img, idx) => {
          if (img instanceof File) {
            uploadData.append('image', img)
          }
        })
      }

      // Add model file
      if (formData.model) {
        uploadData.append('model', formData.model)
      }

      if (editingProduct) {
        // Update
        await axios.put(`${apiUrl}/api/products/${editingProduct.id}`, uploadData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        })
        toast.success('Product updated successfully!')
      } else {
        // Create
        await axios.post(`${apiUrl}/api/products`, uploadData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        })
        toast.success('Product added successfully!')
      }

      // refresh seller view
      fetchProducts()
      // refresh customer-facing product list
      try { refreshProducts && refreshProducts() } catch (e) {}
      resetForm()
      setShowForm(false)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving product')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      setLoading(true)
      await axios.delete(`${apiUrl}/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success('Product deleted successfully!')
      fetchProducts()
      try { refreshProducts && refreshProducts() } catch (e) {}
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting product')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      subCategory: product.subCategory,
      stock: product.stock,
      image: product.image,
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setEditingProduct(null)
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'Accessories',
      subCategory: 'Keychains',
      stock: '',
      image: [],
      model: null,
    })
    setImagePreview([])
  }

  const handleLogout = () => {
    localStorage.removeItem('sellerToken')
    localStorage.removeItem('seller')
    navigate('/seller/login')
  }

  return (
    <div className='min-h-screen bg-gray-100'>
      {/* Header */}
      <div className='bg-black text-white p-6'>
        <div className='max-w-7xl mx-auto flex justify-between items-center'>
          <div>
            <h1 className='text-3xl font-bold'>Seller Dashboard</h1>
            {seller && <p className='text-gray-400'>{seller.storeName}</p>}
          </div>
          <button
            onClick={handleLogout}
            className='bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-medium'
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-7xl mx-auto px-4 py-8'>
        {/* Tabs + Add Product Button */}
        <div className='flex items-center justify-between mb-6'>
          <div className='space-x-2'>
            <button
              onClick={() => setSelectedTab('products')}
              className={`px-4 py-2 rounded-lg font-medium ${selectedTab === 'products' ? 'bg-black text-white' : 'bg-gray-200'}`}>
              Products ({products.length})
            </button>
            <button
              onClick={() => setSelectedTab('orders')}
              className={`px-4 py-2 rounded-lg font-medium ${selectedTab === 'orders' ? 'bg-black text-white' : 'bg-gray-200'}`}>
              Orders ({sellerOrders.length})
            </button>
          </div>

          <button
            onClick={() => {
              resetForm()
              setShowForm(!showForm)
              setSelectedTab('products')
            }}
            className='bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800'
          >
            {showForm ? 'Cancel' : 'Add Product'}
          </button>
        </div>

        {/* Product Form */}
        {showForm && (
          <div className='bg-white rounded-lg shadow-lg p-6 mb-8'>
            <h2 className='text-2xl font-bold mb-6'>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>

            <form onSubmit={handleSubmit} className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <input
                type='text'
                name='name'
                placeholder='Product Name'
                value={formData.name}
                onChange={handleChange}
                className='col-span-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black'
                required
              />

              <select
                name='category'
                value={formData.category}
                onChange={handleChange}
                className='px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black'
              >
                <option value='Accessories'>Accessories</option>
                <option value='Decor'>Decor</option>
                <option value='Fashion'>Fashion</option>
              </select>

              <select
                name='subCategory'
                value={formData.subCategory}
                onChange={handleChange}
                className='px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black'
              >
                <option value='Keychains'>Keychains</option>
                <option value='Bouquets'>Bouquets</option>
                <option value='Coasters'>Coasters</option>
              </select>

              <input
                type='number'
                name='price'
                placeholder='Price'
                value={formData.price}
                onChange={handleChange}
                className='px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black'
                required
              />

              <input
                type='number'
                name='stock'
                placeholder='Stock Quantity'
                value={formData.stock}
                onChange={handleChange}
                className='px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black'
                required
              />

              <textarea
                name='description'
                placeholder='Product Description'
                value={formData.description}
                onChange={handleChange}
                className='col-span-1 md:col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black'
                rows='4'
                required
              />

              <div className='col-span-1 md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Product Images</label>
                <input
                  type='file'
                  multiple
                  accept='image/*'
                  onChange={handleImageChange}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black'
                />
                {imagePreview.length > 0 && (
                  <div className='mt-3 grid grid-cols-2 md:grid-cols-4 gap-2'>
                    {imagePreview.map((preview, idx) => (
                      <img key={idx} src={preview} alt={`Preview ${idx}`} className='w-full h-24 object-cover rounded border border-gray-200' />
                    ))}
                  </div>
                )}
              </div>

              <div className='col-span-1 md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>AR Model File (Optional)</label>
                <input
                  type='file'
                  accept='.glb,.gltf,.usdz'
                  onChange={handleModelChange}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black'
                />
                {formData.model && (
                  <p className='mt-2 text-sm text-green-600'>✓ {formData.model.name}</p>
                )}
              </div>

              <button
                type='submit'
                disabled={loading}
                className='col-span-1 md:col-span-2 bg-black text-white py-2 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50'
              >
                {loading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
              </button>
            </form>
          </div>
        )}

        {selectedTab === 'products' ? (
          <div className='bg-white rounded-lg shadow-lg overflow-hidden'>
            <div className='p-6 border-b border-gray-200'>
              <h2 className='text-2xl font-bold'>Your Products ({products.length})</h2>
            </div>

            {loading && !products.length ? (
              <div className='p-6 text-center text-gray-500'>Loading products...</div>
            ) : products.length === 0 ? (
              <div className='p-6 text-center text-gray-500'>No products yet. Add your first product!</div>
            ) : (
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead className='bg-gray-50 border-b border-gray-200'>
                    <tr>
                      <th className='px-6 py-3 text-left text-sm font-medium text-gray-700'>Product Name</th>
                      <th className='px-6 py-3 text-left text-sm font-medium text-gray-700'>Price</th>
                      <th className='px-6 py-3 text-left text-sm font-medium text-gray-700'>Stock</th>
                      <th className='px-6 py-3 text-left text-sm font-medium text-gray-700'>Category</th>
                      <th className='px-6 py-3 text-left text-sm font-medium text-gray-700'>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className='border-b border-gray-200 hover:bg-gray-50'>
                        <td className='px-6 py-4 text-sm font-medium text-gray-900'>{product.name}</td>
                        <td className='px-6 py-4 text-sm text-gray-700'>₱{product.price}</td>
                        <td className='px-6 py-4 text-sm text-gray-700'>{product.stock}</td>
                        <td className='px-6 py-4 text-sm text-gray-700'>{product.subCategory}</td>
                        <td className='px-6 py-4 text-sm space-x-2'>
                          <button
                            onClick={() => handleEdit(product)}
                            className='bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded'
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className='bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded'
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className='bg-white rounded-lg shadow-lg overflow-hidden'>
            <div className='p-6 border-b border-gray-200'>
              <h2 className='text-2xl font-bold'>Orders ({sellerOrders.length})</h2>
            </div>

            {loading && !sellerOrders.length ? (
              <div className='p-6 text-center text-gray-500'>Loading orders...</div>
            ) : sellerOrders.length === 0 ? (
              <div className='p-6 text-center text-gray-500'>No orders yet for your products.</div>
            ) : (
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead className='bg-gray-50 border-b border-gray-200'>
                    <tr>
                      <th className='px-6 py-3 text-left text-sm font-medium text-gray-700'>Order ID</th>
                      <th className='px-6 py-3 text-left text-sm font-medium text-gray-700'>Buyer</th>
                      <th className='px-6 py-3 text-left text-sm font-medium text-gray-700'>Items</th>
                      <th className='px-6 py-3 text-left text-sm font-medium text-gray-700'>Total</th>
                      <th className='px-6 py-3 text-left text-sm font-medium text-gray-700'>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sellerOrders.map((order) => (
                      <tr key={order.id} className='border-b border-gray-200 hover:bg-gray-50'>
                        <td className='px-6 py-4 text-sm font-medium text-gray-900'>#{order.id}</td>
                        <td className='px-6 py-4 text-sm text-gray-700'>{order.firstName} {order.lastName} <div className='text-xs text-gray-500'>{order.email}</div></td>
                        <td className='px-6 py-4 text-sm text-gray-700'>
                          {order.sellerItems.map((it, idx) => (
                            <div key={idx} className='mb-1'>
                              <span className='font-medium'>{it.name ?? it.title ?? `Product ${it.productId ?? it.id ?? ''}`}</span>
                              <span className='ml-2 text-gray-600'>x{it.quantity ?? it.qty ?? it.q ?? 1}</span>
                              <span className='ml-2 text-gray-600'>₱{it.price ?? it.unitPrice ?? ''}</span>
                            </div>
                          ))}
                        </td>
                        <td className='px-6 py-4 text-sm text-gray-700'>₱{order.total}</td>
                        <td className='px-6 py-4 text-sm text-gray-700'>{order.orderStatus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SellerDashboard
