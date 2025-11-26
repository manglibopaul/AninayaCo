import React, { useEffect, useState } from 'react';
import { useShop } from '../context/ShopContext';
import Title from './Title';
import ProductItem from './ProductItem';

const BestSeller = () => {
    const { products } = useShop();
    const [bestSeller, setBestSeller] = useState([]);

    useEffect(() => {
        if (products && products.length > 0) {
            const bestProduct = products.filter((item) => item.bestseller);
            setBestSeller(bestProduct.slice(0, 5));
        }
    }, [products]);

    if (!products || products.length === 0) {
        return <div className="text-center py-10">Loading best sellers...</div>;
    }

    return (
        <div className='my-10'>
            <div className='text-center text-3xl py-8 bg-blue-100'>
                <Title text1={'BEST'} text2={'SELLER'} />
                <p className='w-3/4 m-auto sm:text-sm md:text-base text-gray-600'>
                    Discover our most loved crochet items, handpicked by our customers.
                </p>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-8'>
                {bestSeller.map((item, index) => (
                    <ProductItem 
                        key={index} 
                        id={item.id} 
                        image={item.image} 
                        name={item.name} 
                        price={item.price} 
                    />
                ))}
            </div>
        </div>
    );
};

export default BestSeller
