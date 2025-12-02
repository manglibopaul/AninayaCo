import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import Title from '../components/Title'

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [reviewForms, setReviewForms] = useState({});

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
          const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          // If token present, attempt to fetch current user profile to check review eligibility
          const token = localStorage.getItem('token') || localStorage.getItem('userToken');
          let userId = null;
          if (token) {
            try {
              const up = await fetch(`${apiBase}/api/users/profile`, { headers: { Authorization: `Bearer ${token}` } });
              if (up.ok) {
                const userData = await up.json();
                setCurrentUser(userData);
                userId = userData.id;
              }
            } catch (e) {
              // ignore profile fetch errors — we'll still show the review form when a token exists and order is completed
            }
          }

          for (let i = 0; i < items.length; i++) {
            const it = items[i];
            const hasImage = it.image && ((Array.isArray(it.image) && it.image.length) || typeof it.image === 'string');
            const prodId = it.productId || it.id || it._id;
            if (!hasImage && prodId) {
              try {
                const pRes = await fetch(`${apiBase}/api/products/${prodId}`);
                if (pRes.ok) {
                  const prod = await pRes.json();
                  if (prod && prod.image) items[i] = { ...it, image: prod.image };
                }
              } catch (e) {
                // ignore per-item fetch errors
              }
            }

            // fetch reviews for this product and determine if user can review
            if (prodId) {
              let rdata = null;
              try {
                const rRes = await fetch(`${apiBase}/api/reviews/product/${prodId}`);
                if (rRes.ok) {
                  rdata = await rRes.json();
                  items[i] = { ...items[i], reviews: rdata };
                  const hasUserReview = userId ? rdata.some(r => Number(r.userId) === Number(userId)) : false;
                  items[i].canReview = Boolean(token) && (data.orderStatus === 'completed') && (!userId ? true : !hasUserReview);
                }
              } catch (e) {
                // ignore review fetch errors
              }

              // If review fetch failed (network or 500), still allow the UI to show the form
              // when the user is authenticated and the order is completed. Server still enforces eligibility.
              if (!items[i].hasOwnProperty('canReview')) {
                items[i].canReview = Boolean(token) && (data.orderStatus === 'completed');
              }

              if (items[i].canReview) {
                const key = prodId;
                setReviewForms(prev => ({ ...prev, [key]: prev[key] || { rating: 5, title: '', comment: '', submitting: false } }));
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

  // If the URL includes ?focusReview=1 (or any value), scroll to the first review form when available
  const location = useLocation();
  useEffect(() => {
    if (!order) return;
    const params = new URLSearchParams(location.search);
    if (!params.get('focusReview') && !location.hash) return;

    // If hash provided, try to scroll there first
    try {
      if (location.hash) {
        const targetId = location.hash.startsWith('#') ? location.hash.slice(1) : location.hash;
        setTimeout(() => {
          const el = document.getElementById(targetId);
          if (el && typeof el.scrollIntoView === 'function') el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
        return;
      }

      // otherwise, find first item with canReview true and scroll its form into view
      const items = Array.isArray(order.items) ? order.items : [];
      let targetId = null;
      for (let it of items) {
        const pid = it.productId || it.id || it._id;
        if (it.canReview && pid) { targetId = `review-form-${pid}`; break; }
      }
      if (targetId) {
        setTimeout(() => {
          const el = document.getElementById(targetId);
          if (el && typeof el.scrollIntoView === 'function') el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
      }
    } catch (e) {
      // ignore
    }
  }, [order, location.search, location.hash, reviewForms]);

  const handleReviewChange = (productId, field, value) => {
    setReviewForms(prev => ({ ...prev, [productId]: { ...prev[productId], [field]: value } }));
  };

  const submitReview = async (productId) => {
    const token = localStorage.getItem('token') || localStorage.getItem('userToken');
    if (!token) return navigate('/login');
    const form = reviewForms[productId];
    if (!form) return;
    if (!form.comment || !form.rating) return alert('Please provide a rating and comment');
    try {
      setReviewForms(prev => ({ ...prev, [productId]: { ...prev[productId], submitting: true } }));
      const res = await fetch(`${apiUrl}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId, rating: form.rating, title: form.title, comment: form.comment }),
      });
      if (!res.ok) {
        const txt = await res.text();
        alert(txt || 'Failed to submit review');
        setReviewForms(prev => ({ ...prev, [productId]: { ...prev[productId], submitting: false } }));
        return;
      }
      const newReview = await res.json();
      // Update local order state to include the new review and prevent additional reviews
      setOrder(prev => {
        const items = Array.isArray(prev.items) ? prev.items.map(it => {
          const pid = it.productId || it.id || it._id;
          if (Number(pid) === Number(productId)) {
            const revs = Array.isArray(it.reviews) ? [newReview, ...it.reviews] : [newReview];
            return { ...it, reviews: revs, canReview: false };
          }
          return it;
        }) : prev.items;
        return { ...prev, items };
      });
      alert('Review submitted');
    } catch (err) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setReviewForms(prev => ({ ...prev, [productId]: { ...prev[productId], submitting: false } }));
    }
  };

  const deleteReview = async (productId, reviewId) => {
    if (!confirm('Delete this review?')) return;
    const token = localStorage.getItem('token') || localStorage.getItem('userToken');
    if (!token) return navigate('/login');
    try {
      const res = await fetch(`${apiUrl}/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const txt = await res.text();
        alert(txt || 'Failed to delete review');
        return;
      }
      // Remove review from local order state
      setOrder(prev => {
        const items = Array.isArray(prev.items) ? prev.items.map(it => {
          const pid = it.productId || it.id || it._id;
          if (Number(pid) === Number(productId)) {
            const revs = Array.isArray(it.reviews) ? it.reviews.filter(r => Number(r.id) !== Number(reviewId)) : [];
            return { ...it, reviews: revs };
          }
          return it;
        }) : prev.items;
        return { ...prev, items };
      });
      alert('Review deleted');
    } catch (err) {
      alert(err.message || 'Failed to delete review');
    }
  };

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
      {/* debug panel removed */}
      
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
                    {item.canReview ? (
                    <div id={`review-form-${item.productId || item.id || item._id}`} className='mt-2 border rounded p-3 bg-white'>
                      <p className='text-sm font-medium mb-2'>Leave a review</p>
                      <div className='flex gap-2 items-center mb-2'>
                        <label className='text-sm'>Rating</label>
                        <select value={reviewForms[item.productId || item.id || item._id]?.rating || 5} onChange={e => handleReviewChange(item.productId || item.id || item._id, 'rating', Number(e.target.value))} className='border px-2 py-1 text-sm'>
                          <option value={5}>5</option>
                          <option value={4}>4</option>
                          <option value={3}>3</option>
                          <option value={2}>2</option>
                          <option value={1}>1</option>
                        </select>
                      </div>
                      <textarea placeholder='Write your review' value={reviewForms[item.productId || item.id || item._id]?.comment || ''} onChange={e => handleReviewChange(item.productId || item.id || item._id, 'comment', e.target.value)} className='w-full border px-2 py-1 mb-2 text-sm' rows={3} />
                        <div className='text-right'>
                          <button onClick={() => submitReview(item.productId || item.id || item._id)} className='bg-black text-white px-3 py-1 text-sm rounded'>Submit Review</button>
                        </div>
                      </div>
                  ) : (
                    <div className='mt-2 text-sm text-gray-500'>
                      {(() => {
                        const pid = item.productId || item.id || item._id;
                        if (!pid) return 'Review unavailable: product information is missing for this item.';
                        if (!currentUser) return (<span>Please <a href="/login" className='text-blue-600 underline'>sign in</a> to leave a review.</span>);
                        if (order.orderStatus !== 'completed') return 'You can leave a review after you have received (completed) this order.';
                        const hasReviewed = Array.isArray(item.reviews) && item.reviews.some(r => Number(r.userId) === Number(currentUser?.id));
                        if (hasReviewed) return 'You have already reviewed this product.';
                        return null;
                      })()}
                    </div>
                  )}

                    {/* Existing reviews for this product */}
                    {Array.isArray(item.reviews) && item.reviews.length > 0 && (
                      <div className='mt-3 space-y-3'>
                        <h4 className='text-sm font-medium'>Reviews</h4>
                        {item.reviews.map((r, idx) => (
                          <div key={idx} className='p-3 border rounded bg-gray-50'>
                            <div className='flex items-center justify-between'>
                              <div className='text-sm font-medium'>{r.userName || 'Customer'}</div>
                              <div className='text-sm text-gray-600'>Rating: {r.rating}</div>
                            </div>
                            <div className='text-sm text-gray-700 mt-1'>{r.comment}</div>
                            <div className='flex items-center justify-between mt-2'>
                              <div className='text-xs text-gray-400'>{new Date(r.createdAt).toLocaleString()}</div>
                              {currentUser && Number(r.userId) === Number(currentUser.id) && (
                                <button onClick={() => deleteReview(item.productId || item.id || item._id, r.id)} className='text-xs text-red-600 underline'>Delete</button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
          {order && order.orderStatus !== 'cancelled' && order.orderStatus !== 'completed' && (
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
