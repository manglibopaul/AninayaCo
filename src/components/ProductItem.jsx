import React from 'react'
import { useShop } from '../context/ShopContext'
import { Link } from 'react-router-dom';

const ProductItem = ({id, image, name, price}) => {

    const { currency } = useShop();
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'

    // Handle both array of strings and array of objects for images
    let imageUrl = '/path/to/placeholder.jpg';
    
    if (Array.isArray(image) && image.length > 0) {
      const firstImage = image[0];
      if (typeof firstImage === 'object' && firstImage.url) {
        // If URL is relative, make it absolute
        imageUrl = firstImage.url.startsWith('http') 
          ? firstImage.url 
          : `${apiUrl}${firstImage.url}`;
      } else if (typeof firstImage === 'string') {
        // If it's a string, check if it's relative
        imageUrl = firstImage.startsWith('http') 
          ? firstImage 
          : `${apiUrl}${firstImage}`;
      }
    }

    console.log('ProductItem - id:', id, 'imageUrl:', imageUrl); // Debug log

  return (
    <Link className='text-gray cursor-pointer' to={`/product/${id}`}>
        <div className='overflow-hidden w-full h-64 flex items-center justify-center bg-gray-100'>
            <img className='w-full h-full object-cover hover:scale-110 transition ease-in-out' src={imageUrl} alt={name} />
        </div>
      <p className='pt-3 pb-1 text-sm'>{name}</p>
      <p className='text-sm font-medium'>{currency}{price}</p>
    </Link>
  )
}

export default ProductItem
