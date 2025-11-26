import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { Link } from 'react-router-dom';

const ProductItem = ({id, image, name, price}) => {

    const {currency} = useContext(ShopContext);

    // Handle both array of strings and array of objects for images
    const imageUrl = Array.isArray(image) && image.length > 0
      ? (typeof image[0] === 'object' ? image[0].url : image[0])
      : '/path/to/placeholder.jpg';

  return (
    <Link className='text-gray cursor-pointer' to={`/product/${id}`}>
        <div className='overflow-hidden w-full h-64 flex items-center justify-center bg-gray-100'>
            <img className='w-full h-full object-cover hover:scale-110 transition ease-in-out' src={imageUrl} alt="" />
        </div>
      <p className='pt-3 pb-1 text-sm'>{name}</p>
      <p className='text-sm font-medium'>{currency}{price}</p>
    </Link>
  )
}

export default ProductItem
