import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const SellerProfile = () => {
  const navigate = useNavigate()
  const [seller, setSeller] = useState(null)
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem('sellerToken')
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  useEffect(() => {
    // Check for seller token - if not present, redirect immediately
    if (!token) {
      navigate('/seller/login')
      return
    }
    fetchProfile()
  }, [token, navigate])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${apiUrl}/api/sellers/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setSeller(response.data)
    } catch (error) {
      console.error('Error fetching profile:', error)
      if (error.response?.status === 401) {
        localStorage.removeItem('sellerToken')
        navigate('/seller/login')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <p className='text-gray-500'>Loading profile...</p>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50 py-12'>
      <div className='max-w-2xl mx-auto'>
        {/* Header */}
        <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>{seller?.storeName}</h1>
            <p className='text-gray-600 mt-2'>{seller?.name}</p>
          </div>
        </div>

        {/* Profile Content */}
        <div className='bg-white rounded-lg shadow-md p-6 space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label className='text-sm font-medium text-gray-600'>Owner Name</label>
              <p className='text-lg text-gray-900 mt-1'>{seller?.name}</p>
            </div>
            <div>
              <label className='text-sm font-medium text-gray-600'>Store Name</label>
              <p className='text-lg text-gray-900 mt-1'>{seller?.storeName}</p>
            </div>
            <div>
              <label className='text-sm font-medium text-gray-600'>Email</label>
              <p className='text-lg text-gray-900 mt-1'>{seller?.email}</p>
            </div>
            <div>
              <label className='text-sm font-medium text-gray-600'>Phone</label>
              <p className='text-lg text-gray-900 mt-1'>{seller?.phone || 'Not provided'}</p>
            </div>
          </div>

          <div>
            <label className='text-sm font-medium text-gray-600'>Address</label>
            <p className='text-lg text-gray-900 mt-1'>{seller?.address || 'Not provided'}</p>
          </div>

          <div>
            <label className='text-sm font-medium text-gray-600'>Store Description</label>
            <p className='text-gray-700 mt-1 leading-relaxed'>
              {seller?.description || 'No description yet'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SellerProfile
