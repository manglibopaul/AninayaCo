import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Title from '../components/Title'

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cancelOrder = async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('userToken');
    if (!token) return navigate('/login');
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await fetch(`/api/orders/${id}/cancel`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const txt = await res.text();
        alert(txt || 'Failed to cancel order');
        return;
      }
      const data = await res.json();
      setOrder(data);
      alert('Order cancelled');
      navigate('/orders');
    } catch (err) {
      alert(err.message || 'Failed to cancel order');
    }
  }

  const markAsReceived = async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('userToken');
    if (!token) return navigate('/login');
    if (!confirm('Confirm you have received this order?')) return;
    try {
      const res = await fetch(`/api/orders/${id}/received`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const txt = await res.text();
        alert(txt || 'Failed to mark as received');
        return;
      }
      const data = await res.json();
      setOrder(data);
      alert('Order marked as received');
      navigate('/orders');
    } catch (err) {
      alert(err.message || 'Failed to mark as received');
    }
  }

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('userToken');
        const res = await fetch(`/api/orders/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            setError('Please sign in to view this order.');
          } else if (res.status === 404) {
            setError('Order not found.');
          } else {
            const txt = await res.text();
            setError(txt || 'Failed to load order');
          }
          setLoading(false);
          return;
        }

        const data = await res.json();
        // If items lack images, try to fetch product info for each
        try {
          const items = Array.isArray(data.items) ? data.items : JSON.parse(data.items || '[]');
          for (let i = 0; i < items.length; i++) {
            const it = items[i];
            const hasImage = it.image && ((Array.isArray(it.image) && it.image.length) || typeof it.image === 'string');
            if (!hasImage) {
              const prodId = it.productId || it.id || it._id;
              if (prodId) {
                try {
                  const pRes = await fetch(`${apiUrl}/api/products/${prodId}`);
                  if (pRes.ok) {
                    const prod = await pRes.json();
                    if (prod && prod.image) items[i] = { ...it, image: prod.image };
                  }
                } catch (e) {
                  // ignore per-item fetch errors
                }
              }
            }
          }
          data.items = items;
        } catch (e) {
          // ignore
        }

        setOrder(data);
      } catch (err) {
        setError(err.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const resolveImage = (image) => {
    let imageUrl = '/path/to/placeholder.jpg';
    if (!image) return imageUrl;
    const first = Array.isArray(image) && image.length > 0 ? image[0] : image;
    if (typeof first === 'object' && first !== null && first.url) {
      imageUrl = first.url.startsWith('http') ? first.url : `${apiUrl}${first.url}`;
    } else if (typeof first === 'string') {
      if (first.startsWith('http')) imageUrl = first;
      else if (first.startsWith('/')) imageUrl = `${apiUrl}${first}`;
      else imageUrl = `${apiUrl}/uploads/images/${first}`;
    }
    return imageUrl;
  }

  if (loading) return <div className='pt-16'><p className='text-sm text-gray-500'>Loading order…</p></div>
  if (error) return <div className='pt-16'><p className='text-sm text-red-500'>{error}</p></div>
  if (!order) return <div className='pt-16'><p className='text-sm text-gray-500'>No order selected.</p></div>

  return (
    <div className='border-t pt-16'>
      <div className='text-2xl mb-4'>
        <Title text1={'ORDER'} text2={`#${order.id}`} />
      </div>

      <div className='space-y-4'>
        <div className='flex justify-between'>
          <div>
            <p className='text-sm text-gray-500'>Date</p>
            <p>{new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <div className='text-right'>
            <p className='text-sm text-gray-500'>Status</p>
            <p className='font-medium'>{order.orderStatus || 'pending'}</p>
          </div>
        </div>

        <div className='border p-4 rounded'>
          <h3 className='font-medium mb-2'>Shipping Address</h3>
          <p>{order.firstName} {order.lastName}</p>
          <p>{order.street}</p>
          <p>{order.city}, {order.state} {order.zipcode}</p>
          <p>{order.country}</p>
          <p className='text-sm text-gray-500'>Email: {order.email}</p>
          <p className='text-sm text-gray-500'>Phone: {order.phone}</p>
        </div>

        <div className='border p-4 rounded'>
          <h3 className='font-medium mb-2'>Items</h3>
          <div className='space-y-3'>
            {Array.isArray(order.items) && order.items.map((item, i) => (
              <div key={i} className='flex items-start gap-4'>
                <img
                  className='w-16'
                  src={resolveImage(item.image)}
                  alt={item.name || ''}
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='100%25' height='100%25' fill='%23f3f4f6'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='14'>No image</text></svg>` }}
                />
                <div>
                  <p className='font-medium'>{item.name || item.title || 'Product'}</p>
                  <p className='text-sm text-gray-600'>Price: ₱{item.price} • Qty: {item.quantity || item.qty || 1}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='flex justify-end gap-6'>
          <div className='text-right'>
            <p className='text-sm text-gray-500'>Subtotal</p>
            <p>₱{order.subtotal}</p>
          </div>
          <div className='text-right'>
            <p className='text-sm text-gray-500'>Shipping</p>
            <p>₱{order.shippingFee}</p>
          </div>
          <div className='text-right'>
            <p className='text-sm text-gray-500'>Total</p>
            <p className='font-medium'>₱{order.total}</p>
          </div>
        </div>

        <div className='flex gap-3'>
          <button onClick={() => navigate(-1)} className='border px-4 py-2 text-sm'>Back</button>
          {order && order.orderStatus !== 'cancelled' && (
            <button onClick={cancelOrder} className='bg-red-500 text-white px-4 py-2 rounded'>Cancel Order</button>
          )}
          {order && order.orderStatus === 'shipped' && (
            <button onClick={markAsReceived} className='bg-green-600 text-white px-4 py-2 rounded'>Mark as Received</button>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrderDetails
