import React, { useEffect, useState } from 'react'
import axios from 'axios'

const SellerAdmin = () => {
  const [users, setUsers] = useState([])
  const [orders, setOrders] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingOrders, setLoadingOrders] = useState(false)
  const token = localStorage.getItem('sellerToken')
  const apiUrl = import.meta.env.VITE_API_URL || ''

  useEffect(() => {
    fetchUsers()
    fetchOrders()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true)
      const res = await axios.get(`${apiUrl}/api/users`, { headers: { Authorization: `Bearer ${token}` } })
      setUsers(res.data || [])
    } catch (err) {
      console.error('fetchUsers', err)
    } finally { setLoadingUsers(false) }
  }

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user? This action cannot be undone.')) return
    try {
      await axios.delete(`${apiUrl}/api/users/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      // refresh list
      fetchUsers()
    } catch (err) {
      console.error('deleteUser', err)
      alert('Failed to delete user')
    }
  }

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true)
      const res = await axios.get(`${apiUrl}/api/orders`, { headers: { Authorization: `Bearer ${token}` } })
      setOrders(res.data || [])
    } catch (err) {
      console.error('fetchOrders', err)
    } finally { setLoadingOrders(false) }
  }

  return (
    <div className='pt-16'>
      <h2 className='text-2xl font-bold mb-4'>Admin (Seller)</h2>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='bg-white rounded-lg shadow p-4'>
          <h3 className='font-semibold mb-2'>Users</h3>
          {loadingUsers ? <div>Loading users…</div> : (
            users.length === 0 ? <div className='text-gray-500'>No users</div> : (
              <ul className='space-y-2 text-sm'>
                {users.map(u => (
                  <li key={u.id} className='border rounded p-2 flex justify-between items-center'>
                    <div>
                      <div className='font-medium'>{u.name}</div>
                      <div className='text-xs text-gray-500'>{u.email}</div>
                    </div>
                    <div className='flex items-center gap-3'>
                      <div className='text-xs text-gray-500'>{u.isAdmin ? 'admin' : 'user'}</div>
                      <button onClick={()=>deleteUser(u.id)} className='text-sm bg-red-500 text-white px-3 py-1 rounded'>Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            )
          )}
        </div>

        <div className='bg-white rounded-lg shadow p-4'>
          <h3 className='font-semibold mb-2'>Orders</h3>
          {loadingOrders ? <div>Loading orders…</div> : (
            orders.length === 0 ? <div className='text-gray-500'>No orders</div> : (
              <ul className='space-y-2 text-sm'>
                {orders.map(o => (
                  <li key={o.id} className='border rounded p-2'>
                    <div className='flex justify-between'>
                      <div># {o.id} — {o.firstName} {o.lastName}</div>
                      <div className='text-xs text-gray-500'>{o.orderStatus}</div>
                    </div>
                    <div className='text-xs text-gray-500'>Items: {Array.isArray(o.items) ? o.items.length : (o.sellerItems ? o.sellerItems.length : 0)}</div>
                  </li>
                ))}
              </ul>
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default SellerAdmin
