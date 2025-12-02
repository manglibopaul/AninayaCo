import React, { useContext, useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProducts from '../components/RelatedProducts';

const Product = () => {

  const {productId} = useParams();
  const {products, currency, addToCart} = useContext(ShopContext);
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
  const [productData,setProductData] = useState(false);
  const [image,setImage] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [showAR, setShowAR] = useState(false);
  const modelViewerRef = useRef(null);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const getImageUrl = (img) => {
    if (!img) return '/path/to/placeholder.jpg';
    
    if (typeof img === 'object' && img.url) {
      return img.url.startsWith('http') ? img.url : `${apiUrl}${img.url}`;
    } else if (typeof img === 'string') {
      return img.startsWith('http') ? img : `${apiUrl}${img}`;
    }
    return '/path/to/placeholder.jpg';
  }

  const fetchProductData = async () => {
    products.map((item)=>{
      const id = item._id || item.id;
      if (String(id) === String(productId)) {
        setProductData(item);
        // Handle both array of strings and array of objects for images
        if (Array.isArray(item.image) && item.image.length > 0) {
          const imageUrl = getImageUrl(item.image[0]);
          setImage(imageUrl);
        }
        return null;
      }
    })
    // fetch reviews for this product
    try {
      const res = await fetch(`${apiUrl}/api/reviews/product/${productId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data || []);
        if (data && data.length) {
          const avg = (data.reduce((s, r) => s + (Number(r.rating) || 0), 0) / data.length).toFixed(1);
          setAvgRating(avg);
        } else {
          setAvgRating(null);
        }
      }
    } catch (e) {
      // ignore
    }

    // fetch current user profile if logged in so we can show delete controls
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('userToken');
      if (token) {
        const pu = await fetch(`${apiUrl}/api/users/profile`, { headers: { Authorization: `Bearer ${token}` } });
        if (pu.ok) {
          const ud = await pu.json();
          setCurrentUser(ud);
        }
      }
    } catch (e) {
      // ignore
    }

    // no eligibility/form fetching here — reviews can be submitted from Order view only
  }

  useEffect(()=>{
    fetchProductData();
  },[productId, products])

  

  // Set model-viewer src when AR modal opens
  useEffect(() => {
    if (showAR && modelViewerRef.current && productData.modelUrl) {
      // Clear previous content
      modelViewerRef.current.innerHTML = '';
      
      // Create model-viewer element
      const viewer = document.createElement('model-viewer');
      const modelUrl = productData.modelUrl.startsWith('http') 
        ? productData.modelUrl 
        : `${apiUrl}${productData.modelUrl}`;
      viewer.setAttribute('src', modelUrl);
      viewer.setAttribute('ar', '');
      viewer.setAttribute('ar-modes', 'scene-viewer quick-look webxr');
      viewer.setAttribute('camera-controls', '');
      viewer.setAttribute('auto-rotate', '');
      viewer.setAttribute('interaction-prompt', 'auto');
      viewer.style.width = '100%';
      viewer.style.height = '500px';
      
      if (productData.iosModel) {
        viewer.setAttribute('ios-src', productData.iosModel);
      }
      
      modelViewerRef.current.appendChild(viewer);
    }
  }, [showAR, productData.modelUrl, productData.iosModel])

  return productData ? (
    <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100'>

      <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>

        {/* -------------------------product images----------------- */}
        <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
          <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full gap-2'>
            {productData.image && productData.image.map((item,index)=>{
              const imgUrl = getImageUrl(item);
              const isActive = image === imgUrl;
              return (
                <img 
                  onClick={()=>setImage(imgUrl)} 
                  src={imgUrl} 
                  key={index} 
                  className={`w-{24%} sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer rounded transition-all ${isActive ? 'border-2 border-black' : 'border border-gray-300'}`}
                  alt={`Product view ${index + 1}`}
                />
              )
            })}
          </div>
          <div className='w-full sm:w-[80%]'>
              <img className='w-full h-auto rounded' src={image} alt="" />
          </div>
        </div>

        {/* ---------- Product info ---------- */}
        <div className='flex-1'>
          <h1 className='font-medium text-2xl mt-2'>{productData.name}</h1>
            <div className='mt-5 flex items-center gap-6'>
              <p className='text-3xl font-medium'>{currency}{productData.price}</p>
              <div className='text-sm text-gray-600'>
                {avgRating ? (
                  <>
                    <span className='font-medium'>{avgRating}</span>
                    <span className='ml-1'>/ 5</span>
                    <span className='ml-2 text-gray-500'>({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
                  </>
                ) : (
                  <span className='text-gray-500'>No reviews yet</span>
                )}
              </div>
            </div>
          <p className='mt-5 text-gray-500 md:w-4/5'>{productData.description}</p>

          {/* ------- ADD TO CART + AR BUTTON ------- */}
          <div className="flex items-center gap-3 my-8">

            {/* ⭐ View AR button (left side) */}
            {productData.modelUrl && (
              <button 
                onClick={()=>setShowAR(true)} 
                className='border border-black px-6 py-3 text-sm hover:bg-gray-200'>
                View AR
              </button>
            )}

            <div className='flex items-center gap-2'>
              <input
                type='number'
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                className='w-20 px-3 py-2 border rounded'
                aria-label='Quantity'
              />
              <button 
                onClick={()=>addToCart(productData._id || productData.id, quantity)} 
                className='bg-black text-white px-6 py-3 text-sm active:bg-pink-700'>
                ADD TO CART
              </button>
            </div>

          </div>

          <hr className='mt-8 sm:w-4/5' />

          <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1'>
              <p>View in Augmented Reality to preview the product size in your space</p>
              <p>100% Handmade crochet product</p>
              <p>Cash on delivery is available on this product.</p>
              <p>Easy return and exchange policy within 6 days.</p>
          </div>
        </div>
      </div>

      {/* ---------- Reviews (moved into Description tab) ---------- */}
      <div className='mt-20'>
        <div className='flex'>
          <b className='border px-5 py-3 text-sm'>Reviews</b>
        </div>
        <div className='flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500'>
          <div className='mb-4'>
            {avgRating ? (
              <div className='text-sm text-gray-700'>
                <span className='font-medium'>{avgRating}</span>
                <span className='ml-1'>/ 5</span>
                <span className='ml-2 text-gray-500'>({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
              </div>
            ) : (
              <div className='text-sm text-gray-500'>No reviews yet.</div>
            )}
          </div>

          <div className='space-y-4'>
            {reviews.length === 0 && <p className='text-sm text-gray-500'>No reviews yet.</p>}
            {reviews.map((r, i) => (
              <div key={i} className='p-3 border rounded bg-gray-50'>
                <div className='flex items-center justify-between'>
                  <div className='text-sm font-medium'>{r.userName || 'Customer'}</div>
                  <div className='text-sm text-gray-600'>Rating: {r.rating}</div>
                </div>
                <div className='text-sm text-gray-700 mt-1'>{r.comment}</div>
                {r.sellerReply && (
                  <div className='mt-2 p-2 bg-white border rounded'>
                    <div className='text-xs text-gray-600 font-medium'>Seller reply</div>
                    <div className='text-sm text-gray-700 mt-1'>{r.sellerReply}</div>
                    {r.sellerReplyAt && <div className='text-xs text-gray-400 mt-1'>{new Date(r.sellerReplyAt).toLocaleString()}</div>}
                  </div>
                )}
                <div className='flex items-center justify-between mt-2'>
                  <div className='text-xs text-gray-400'>{new Date(r.createdAt).toLocaleString()}</div>
                  {currentUser && Number(r.userId) === Number(currentUser.id) && (
                    <button onClick={async () => {
                      if (!confirm('Delete this review?')) return;
                      const token = localStorage.getItem('token') || localStorage.getItem('userToken');
                      if (!token) return window.location.href = '/login';
                      try {
                        const dres = await fetch(`${apiUrl}/api/reviews/${r.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
                        if (!dres.ok) { const txt = await dres.text(); alert(txt || 'Failed to delete review'); return; }
                        setReviews(prev => prev.filter(x => Number(x.id) !== Number(r.id)));
                        alert('Review deleted');
                      } catch (e) { alert(e.message || 'Failed to delete review'); }
                    }} className='text-xs text-red-600 underline'>Delete</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---------- Related Products ---------- */}
      <RelatedProducts category={productData.category} subCategory={productData.subCategory}/>

      

      {/* ---------- AR POPUP MODAL ---------- */}
      {showAR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg text-center relative max-w-[900px] w-full">

            <button 
              className="absolute top-2 right-3 text-xl"
              onClick={() => setShowAR(false)}
            >
              ✖
            </button>

            <h2 className="text-lg font-medium mb-2">View in Augmented Reality</h2>

            <div ref={modelViewerRef} style={{ width: "100%", height: "500px" }}>
            </div>

            <p className='mt-2 text-sm text-gray-500'>
              Point your camera to place the model in your room.
            </p>
          </div>
        </div>
      )}

    </div>
  ) : <div className='opacity-0'></div>
}

export default Product
