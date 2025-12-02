import React, { useEffect, useState } from 'react'
import Title from '../components/Title';
import { Link, useNavigate } from 'react-router-dom';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const cancelOrder = async (orderId) => {
    const token = localStorage.getItem('token') || localStorage.getItem('userToken');
    if (!token) return window.location.href = '/login';
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const txt = await res.text();
        alert(txt || 'Failed to cancel order');
        return;
      }
      window.location.reload();
    } catch (err) {
      alert(err.message || 'Failed to cancel order');
    }
  }

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('userToken');
        if (!token) {
          setError('Please sign in to view your orders.');
          setLoading(false);
          return;
        }

        const res = await fetch('/api/orders/my-orders', { headers: { Authorization: `Bearer ${token}` } });

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            setOrders([]);
            setError('Please sign in to view your orders.');
          } else {
            const text = await res.text();
            setError(text || 'Failed to load orders');
          }
          setLoading(false);
          return;
        }

        const data = await res.json();

        // Augment items with product images when missing
        const augmented = await Promise.all((data || []).map(async (order) => {
          try {
            const items = Array.isArray(order.items) ? order.items : JSON.parse(order.items || '[]');
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
            return { ...order, items };
          } catch (err) {
            return order;
          }
        }));

        setOrders(augmented || []);
      } catch (err) {
        setError(err.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    const token = localStorage.getItem('token') || localStorage.getItem('userToken');
    if (!token) {
      // redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }
    fetchOrders();
  }, []);

  const resolveImage = (image) => {
    let imageUrl = '/path/to/placeholder.jpg';
    if (!image) return imageUrl;
    // image may be array or string or array of objects
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

  return (
    <div className='border-t pt-16'>
      <div className='text-2xl'>
        <Title text1={'MY'} text2={'ORDERS'} />
      </div>

      <div className='mt-6'>
        {loading && <p className='text-sm text-gray-500'>Loading orders…</p>}
        {error && <p className='text-sm text-red-500'>{error}</p>}

        {!loading && !error && orders.length === 0 && (
          <p className='text-sm text-gray-500'>No orders yet.</p>
        )}

        {!loading && orders.map((order) => (
          <div key={order.id} className='py-4 border-t border-b text-gray-700 flex flex-col gap-4'>
            <div className='flex justify-between items-start'>
              <div>
                <p className='text-sm text-gray-500'>Order</p>
                <p className='text-sm text-gray-500'>Date: {new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <div className='text-right'>
                <p className='font-medium'>{order.orderStatus || 'pending'}</p>
                <p className='text-sm text-gray-500'>Total: ₱{order.total}</p>
              </div>
            </div>

            <div className='grid gap-3 md:grid-cols-2'>
              {Array.isArray(order.items) && order.items.map((item, idx) => (
                <div key={idx} className='flex items-start gap-4 text-sm'>
                  <img
                    className='w-16 sm:w-20'
                    src={resolveImage(item.image)}
                    alt={item.name || ''}
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='100%25' height='100%25' fill='%23f3f4f6'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='14'>No image</text></svg>` }}
                  />
                  <div>
                    <p className='font-medium'>{item.name || item.title || 'Product'}</p>
                    <p className='text-gray-600'>Price: ₱{item.price}</p>
                    <p className='text-gray-600'>Quantity: {item.quantity || item.qty || 1}</p>
                    {item.size && <p className='text-gray-600'>Size: {item.size}</p>}
                  </div>
                </div>
              ))}
            </div>

            <div className='flex items-center justify-between'>
              <div className='text-sm text-gray-500'>Payment: {order.paymentMethod || 'N/A'}</div>
              <div className='flex items-center gap-2'>
                {order.orderStatus !== 'cancelled' && order.orderStatus !== 'completed' && (
                  <button onClick={() => cancelOrder(order.id)} className='bg-red-500 text-white px-3 py-1 rounded text-sm'>Cancel</button>
                )}
                <Link to={`/orders/${order.id}`} className='border px-4 py-2 text-sm font-medium rounded-sm hover:bg-gray-100 duration-200'>
                  View Order
                </Link>
                {order.orderStatus === 'completed' && (
                  <button
                    onClick={() => {
                      try {
                        const firstItem = Array.isArray(order.items) && order.items.length ? order.items[0] : null;
                        const pid = firstItem ? (firstItem.productId || firstItem.id || firstItem._id) : null;
                        const hash = pid ? `#review-form-${pid}` : '';
                        navigate(`/orders/${order.id}?focusReview=1${hash}`);
                      } catch (e) {
                        // fallback to location assign
                        const firstItem = Array.isArray(order.items) && order.items.length ? order.items[0] : null;
                        const pid = firstItem ? (firstItem.productId || firstItem.id || firstItem._id) : null;
                        const hash = pid ? `#review-form-${pid}` : '';
                        window.location.href = `/orders/${order.id}?focusReview=1${hash}`;
                      }
                    }}
                    className='border px-4 py-2 text-sm font-medium rounded-sm hover:bg-gray-100 duration-200'
                  >
                    Write Review
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Orders
