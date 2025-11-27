import React, { useEffect, useState, useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';
import ProductItem from './ProductItem';

const LatestCollection = () => {

    const { products } = useContext(ShopContext);
    const [latestProducts, setLatestProducts] = useState([]);

    useEffect(()=>{
        setLatestProducts(products.slice(0,10));
    },[products])

  return (
    <div id="latest-collection" className='my-10'>
        <div className='text-center py-8 text-3xl bg-pink-100'>
            <Title text1={'CROCHET'} text2={'COLLECTIONS'} />
            <p className='w-3/4 m-auto sm:text-sm md:text-base text-gray-600'>
                "Soft, stylish, and crafted to perfection—discover the beauty of handmade, created to bring comfort and charm into every corner of your home."
            </p>
        </div>

      {/* Rendering Products */}
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6 bg-pink-100'>
            {
            latestProducts.map((item,index)=>(
                <ProductItem key={index} id={item._id || item.id} image={item.image} name={item.name} price={item.price} />
            ))
            }
        </div>

    </div>
  )
}

export default LatestCollection
