import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const token = localStorage.getItem('token');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/api/orders`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });
      setOrders(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      await axios.put(
        `${apiUrl}/api/orders/${orderId}/status`,
        { orderStatus: status },
        { headers: { Authorization: token ? `Bearer ${token}` : '' } }
      );
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className='my-6'>
      <h2 className='text-2xl font-semibold mb-4'>Admin — Orders</h2>
      {loading && <p>Loading orders…</p>}
      {error && <p className='text-red-600'>{error}</p>}
      {!loading && orders.length === 0 && <p>No orders found.</p>}
      {orders.length > 0 && (
        <div className='overflow-auto'>
          <table className='min-w-full text-sm'>
            <thead>
              <tr className='text-left'>
                <th className='px-2 py-2'>ID</th>
                <th className='px-2 py-2'>User</th>
                <th className='px-2 py-2'>Total</th>
                <th className='px-2 py-2'>Status</th>
                <th className='px-2 py-2'>Created</th>
                <th className='px-2 py-2'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className='border-t'>
                  <td className='px-2 py-2'>{o.id}</td>
                  <td className='px-2 py-2'>{o.userId}</td>
                  <td className='px-2 py-2'>₱{o.total}</td>
                  <td className='px-2 py-2'>{o.orderStatus}</td>
                  <td className='px-2 py-2'>{new Date(o.createdAt).toLocaleString()}</td>
                  <td className='px-2 py-2'>
                    <select defaultValue={o.orderStatus} onChange={(e) => updateStatus(o.id, e.target.value)} className='mr-2 border rounded px-2 py-1'>
                      <option value='pending'>pending</option>
                      <option value='processing'>processing</option>
                      <option value='shipped'>shipped</option>
                      <option value='delivered'>delivered</option>
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
  );
};

export default AdminOrders;
