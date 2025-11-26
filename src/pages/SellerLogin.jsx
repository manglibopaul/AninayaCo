import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

const SellerLogin = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    storeName: '',
    phone: '',
    address: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const endpoint = isLogin
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/sellers/login`
        : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/sellers/register`

      console.log('Sending request to:', endpoint)
      console.log('Form data:', formData)

      const response = await axios.post(endpoint, formData)
      
      console.log('Response:', response.data)

      // Store token
      localStorage.setItem('sellerToken', response.data.token)
      localStorage.setItem('seller', JSON.stringify(response.data.seller))

      toast.success(isLogin ? 'Logged in successfully!' : 'Registered successfully!')
      navigate('/seller/dashboard')
    } catch (error) {
      console.error('Full error:', error)
      const errorMsg = error.response?.data?.message || error.message || 'Error occurred'
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-gray-100 flex items-center justify-center px-4'>
      <div className='bg-white rounded-lg shadow-lg p-8 w-full max-w-md'>
        <h2 className='text-2xl font-bold mb-6 text-center'>
          {isLogin ? 'Seller Login' : 'Seller Registration'}
        </h2>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {!isLogin && (
            <>
              <input
                type='text'
                name='name'
                placeholder='Full Name'
                value={formData.name}
                onChange={handleChange}
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black'
                required
              />
              <input
                type='text'
                name='storeName'
                placeholder='Store Name'
                value={formData.storeName}
                onChange={handleChange}
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black'
                required
              />
              <input
                type='tel'
                name='phone'
                placeholder='Phone Number'
                value={formData.phone}
                onChange={handleChange}
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black'
              />
              <textarea
                name='address'
                placeholder='Address'
                value={formData.address}
                onChange={handleChange}
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black'
                rows='3'
              />
            </>
          )}

          <input
            type='email'
            name='email'
            placeholder='Email'
            value={formData.email}
            onChange={handleChange}
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black'
            required
          />
          <input
            type='password'
            name='password'
            placeholder='Password'
            value={formData.password}
            onChange={handleChange}
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black'
            required
          />

          <button
            type='submit'
            disabled={loading}
            className='w-full bg-black text-white py-2 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50'
          >
            {loading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>

        <p className='text-center mt-6 text-gray-600'>
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => {
              setIsLogin(!isLogin)
              setFormData({ email: '', password: '', name: '', storeName: '', phone: '', address: '' })
            }}
            className='text-black font-medium hover:underline'
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default SellerLogin
