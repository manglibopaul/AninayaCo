import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

import { ShopContext } from '../context/ShopContext'
import SellerChat from '../components/SellerChat'

// Helper: Compress image before upload
const compressImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target.result
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        // Calculate new dimensions (max 1000px width)
        let width = img.width
        let height = img.height
        const maxWidth = 1000
        
        if (width > maxWidth) {
          height = (maxWidth / width) * height
          width = maxWidth
        }
        
        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() })
            resolve(compressedFile)
          },
          'image/jpeg',
          0.8 // 80% quality
        )
      }
    }
  })
}

const SellerDashboard = () => {
  const navigate = useNavigate()
  const [seller, setSeller] = useState(null)
  const [products, setProducts] = useState([])
  const [sellerOrders, setSellerOrders] = useState([])
  const [selectedTab, setSelectedTab] = useState('products')
  const [lowStockThreshold, setLowStockThreshold] = useState(5)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState('')
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
      navigate('/')
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

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files || [])
    console.log('Files selected:', files.length, files)
    
    if (files.length > 0) {
      toast.info('Compressing images...')
      try {
        // Compress all images
        const compressedImages = await Promise.all(
          files.map(file => compressImage(file))
        )
        setFormData(prev => ({ ...prev, image: compressedImages }))
        
        // Create preview
        const previews = compressedImages.map(file => URL.createObjectURL(file))
        setImagePreview(previews)
        toast.success(`${compressedImages.length} image(s) compressed and ready`)
      } catch (error) {
        console.error('Image compression error:', error)
        toast.error('Failed to compress images')
      }
    }
    
    // Reset input after setting state
    setTimeout(() => {
      e.target.value = ''
    }, 0)
  }

  const handleModelChange = (e) => {
    const file = e.target.files[0]
    setFormData(prev => ({ ...prev, model: file }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setUploadProgress(0)
    setUploadError('')

    try {
      // Validate form
      if (!formData.name || !formData.description || !formData.price || !formData.stock) {
        toast.error('Please fill in all required fields')
        setLoading(false)
        return
      }

      // Create FormData for multipart upload
      const uploadData = new FormData()
      uploadData.append('name', formData.name)
      uploadData.append('description', formData.description)
      uploadData.append('price', formData.price)
      uploadData.append('category', formData.category)
      uploadData.append('subCategory', formData.subCategory)
      uploadData.append('stock', formData.stock)

      // Add multiple images (only if they are new files)
      if (formData.image && formData.image.length > 0) {
        formData.image.forEach((img, idx) => {
          // Only append if it's a File object (new upload), not existing image data
          if (img instanceof File) {
            uploadData.append('image', img)
          }
        })
      }

      // Add model file
      if (formData.model) {
        uploadData.append('model', formData.model)
      }

      // Create axios instance with custom timeout and progress
      const axiosInstance = axios.create({
        timeout: 5 * 60 * 1000, // 5 minute timeout for slow connections
      })

      let uploadUrl = `${apiUrl}/api/products`
      if (editingProduct) {
        uploadUrl = `${apiUrl}/api/products/${editingProduct.id}`
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(percentCompleted)
        },
      }

      let response
      if (editingProduct) {
        response = await axiosInstance.put(uploadUrl, uploadData, config)
      } else {
        response = await axiosInstance.post(uploadUrl, uploadData, config)
      }

      // Success
      toast.success(editingProduct ? 'Product updated successfully!' : 'Product created successfully!')
      
      // Refresh product lists
      fetchProducts()
      try { refreshProducts && refreshProducts() } catch (e) {}
      resetForm()
      setShowForm(false)
      setUploadProgress(0)
    } catch (error) {
      console.error('Upload error:', error)
      let errorMsg = 'Failed to upload product'
      
      if (error.code === 'ECONNABORTED') {
        errorMsg = 'Upload timed out. Check your connection and try again.'
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message
      } else if (error.message) {
        errorMsg = error.message
      }
      
      setUploadError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      setLoading(true)
      await axios.delete(`${apiUrl}/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchProducts()
      try { refreshProducts && refreshProducts() } catch (e) {}
    } catch (error) {
      console.error(error)
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
      image: product.image || [],
    })
    // Show existing images in preview
    if (product.image && Array.isArray(product.image)) {
      const previews = product.image.map(img => {
        if (typeof img === 'string') {
          return img.startsWith('http') ? img : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${img}`
        }
        return img.url
      })
      setImagePreview(previews)
    } else {
      setImagePreview([])
    }
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
          <div className='flex gap-3'>
            <button
              onClick={() => navigate('/seller/profile')}
              className='bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium'
            >
              Profile
            </button>
            <button
              onClick={handleLogout}
              className='bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-medium'
            >
              Logout
            </button>
          </div>
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
                  <button
                    onClick={() => setSelectedTab('chat')}
                    className={`px-4 py-2 rounded-lg font-medium ${selectedTab === 'chat' ? 'bg-black text-white' : 'bg-gray-200'}`}>
                    Chat
                  </button>
            <button
              onClick={() => setSelectedTab('inventory')}
              className={`px-4 py-2 rounded-lg font-medium ${selectedTab === 'inventory' ? 'bg-black text-white' : 'bg-gray-200'}`}>
              Inventory
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

            {/* Error Display */}
            {uploadError && (
              <div className='mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded'>
                ⚠️ {uploadError}
              </div>
            )}

            {/* Upload Progress */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className='mb-4'>
                <p className='text-sm text-gray-600 mb-1'>Uploading: {uploadProgress}%</p>
                <div className='w-full bg-gray-200 rounded-lg h-2 overflow-hidden'>
                  <div
                    className='bg-blue-600 h-full transition-all duration-300'
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <input
                type='text'
                name='name'
                placeholder='Product Name'
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
                className='col-span-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black disabled:bg-gray-100'
                required
              />

              <select
                name='category'
                value={formData.category}
                onChange={handleChange}
                disabled={loading}
                className='px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black disabled:bg-gray-100'
              >
                <option value='Accessories'>Accessories</option>
                <option value='Decor'>Decor</option>
                <option value='Fashion'>Fashion</option>
              </select>

              <select
                name='subCategory'
                value={formData.subCategory}
                onChange={handleChange}
                disabled={loading}
                className='px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black disabled:bg-gray-100'
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
                disabled={loading}
                className='px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black disabled:bg-gray-100'
                required
              />

              <input
                type='number'
                name='stock'
                placeholder='Stock Quantity'
                value={formData.stock}
                onChange={handleChange}
                disabled={loading}
                className='px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black disabled:bg-gray-100'
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
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Product Images <span className='text-red-500'>*</span>
                  <span className='text-xs text-gray-500 font-normal ml-2'>(Add 3 or more images)</span>
                </label>
                <input
                  id='product-images'
                  type='file'
                  multiple
                  accept='image/*'
                  onChange={handleImageChange}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black'
                />
                <p className='text-xs text-gray-500 mt-1'>Recommended: Upload at least 3 different angles of your product</p>
                {imagePreview.length > 0 && (
                  <div className='mt-3'>
                    <p className='text-sm text-gray-600 mb-2'>
                      Selected images: <span className='font-medium text-green-600'>{imagePreview.length}</span>
                      {imagePreview.length < 3 && <span className='text-xs text-orange-600 ml-2'>(Recommended: 3+)</span>}
                    </p>
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
                      {imagePreview.map((preview, idx) => (
                        <div key={idx} className='relative'>
                          <img src={preview} alt={`Preview ${idx}`} className='w-full h-24 object-cover rounded border border-gray-200' />
                          <span className='absolute top-1 right-1 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>{idx + 1}</span>
                        </div>
                      ))}
                    </div>
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
                className='col-span-1 md:col-span-2 bg-black text-white py-2 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {loading ? (
                  <>
                    <span className='inline-block mr-2'>⏳</span>
                    {uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : 'Processing...'}
                  </>
                ) : (
                  editingProduct ? 'Update Product' : 'Create Product'
                )}
              </button>
            </form>
          </div>
        )}

        {/* Tab panels */}
        {selectedTab === 'products' && (
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
        )}

        {selectedTab === 'orders' && (
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
                        <td className='px-6 py-4 text-sm text-gray-700'>
                          <select
                            value={order.orderStatus}
                            onChange={async (e) => {
                              const newStatus = e.target.value
                              try {
                                await axios.put(`${apiUrl}/api/orders/${order.id}/status`, { status: newStatus }, {
                                  headers: { Authorization: `Bearer ${token}` },
                                })
                                toast.success('Order status updated')
                                fetchSellerOrders()
                              } catch (err) {
                                console.error(err)
                                toast.error('Failed to update status')
                              }
                            }}
                            className='px-2 py-1 border rounded'>
                            <option value='pending'>pending</option>
                            <option value='processing'>processing</option>
                            <option value='shipped'>shipped</option>
                            <option value='completed'>completed</option>
                            <option value='cancelled'>cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {selectedTab === 'chat' && (
          <div className='bg-white rounded-lg shadow-lg p-6'>
            <h2 className='text-2xl font-bold mb-4'>Messages</h2>
            <SellerChat />
          </div>
        )}

        

        {selectedTab === 'inventory' && (
          <div className='bg-white rounded-lg shadow-lg overflow-hidden p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-2xl font-bold'>Inventory</h2>
              <div className='flex items-center gap-2'>
                <label className='text-sm text-gray-600'>Low stock threshold</label>
                <input type='number' value={lowStockThreshold} onChange={(e) => setLowStockThreshold(Number(e.target.value) || 1)} className='w-20 px-2 py-1 border rounded' />
              </div>
            </div>

            {/* Low stock alerts */}
            <div className='mb-6'>
              <h3 className='font-medium mb-2'>Low Stock Items</h3>
              {products.filter(p => Number(p.stock) <= lowStockThreshold).length === 0 ? (
                <div className='text-sm text-gray-500'>No low-stock items.</div>
              ) : (
                <div className='grid gap-3'>
                  {products.filter(p => Number(p.stock) <= lowStockThreshold).map(p => (
                    <div key={p.id} className='flex items-center justify-between border p-3 rounded'>
                      <div>
                        <div className='font-medium'>{p.name}</div>
                        <div className='text-sm text-gray-600'>Stock: {p.stock}</div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <input type='number' min='1' placeholder='Add qty' id={`restock-${p.id}`} className='w-24 px-2 py-1 border rounded' />
                        <button
                          onClick={async () => {
                            const input = document.getElementById(`restock-${p.id}`)
                            const qty = Number(input?.value || 0)
                            if (qty <= 0) return toast.error('Enter a quantity to add')
                            try {
                              await axios.put(`${apiUrl}/api/products/${p.id}`, { stock: Number(p.stock) + qty }, {
                                headers: { Authorization: `Bearer ${token}` },
                              })
                              toast.success('Stock updated')
                              fetchProducts()
                            } catch (err) {
                              console.error(err)
                              toast.error('Failed to update stock')
                            }
                          }}
                          className='bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded'
                        >
                          Restock
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Full product inventory table */}
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gray-50 border-b border-gray-200'>
                  <tr>
                    <th className='px-6 py-3 text-left text-sm font-medium text-gray-700'>Product</th>
                    <th className='px-6 py-3 text-left text-sm font-medium text-gray-700'>Stock</th>
                    <th className='px-6 py-3 text-left text-sm font-medium text-gray-700'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} className='border-b border-gray-200 hover:bg-gray-50'>
                      <td className='px-6 py-4 text-sm font-medium text-gray-900'>{p.name}</td>
                      <td className='px-6 py-4 text-sm text-gray-700'>{p.stock}</td>
                      <td className='px-6 py-4 text-sm space-x-2'>
                        <button onClick={() => handleEdit(p)} className='bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded'>Edit</button>
                        <button onClick={() => handleDelete(p.id)} className='bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded'>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SellerDashboard
