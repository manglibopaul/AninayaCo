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
  const [showAR, setShowAR] = useState(false);
  const modelViewerRef = useRef(null);

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
  }

  useEffect(()=>{
    fetchProductData();
  },[productId])

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
          <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full'>
            {productData.image && productData.image.map((item,index)=>{
              const imgUrl = getImageUrl(item);
              return (
                <img onClick={()=>setImage(imgUrl)} src={imgUrl} key={index} className='w-{24%} sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer' alt="" />
              )
            })}
          </div>
          <div className='w-full sm:w-[80%]'>
              <img className='w-full h-auto' src={image} alt="" />
          </div>
        </div>

        {/* ---------- Product info ---------- */}
        <div className='flex-1'>
          <h1 className='font-medium text-2xl mt-2'>{productData.name}</h1>

          <p className='mt-5 text-3xl font-medium'>{currency}{productData.price}</p>
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

            <button 
              onClick={()=>addToCart(productData._id || productData.id)} 
              className='bg-black text-white px-8 py-3 text-sm active:bg-pink-700'>
              ADD TO CART
            </button>

          </div>

          <hr className='mt-8 sm:w-4/5' />

          <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1'>
              <p>View in Augmented Reality to preview the product size in your space</p>
              <p>100% Handmade crochet product</p>
              <p>Cash in delivery is available on this product.</p>
              <p>Easy return and exchange policy within 6 days.</p>
          </div>
        </div>
      </div>

      {/* ---------- Description Section ---------- */}
      <div className='mt-20'>
          <div className='flex'>
              <b className='border px-5 py-3 text-sm'>Description</b>
          </div>
          <div className='flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500'>
            <p>Aninaya.co is an innovative online marketplace dedicated to elevating Baguio's local crochet artistry through technology and culture...</p>
            <p>With the integration of Augmented Reality (AR), buyers can preview crochet products in real environments...</p>
            <p>Every stitch tells a story of passion, tradition, and artistry—now brought to life in a more immersive way.</p>
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
