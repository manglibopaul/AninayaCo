import React from 'react'
import { assets } from '../assets/assets'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <div>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr] gap-14 my-10 mt-40 text-sm'>
        <div>
            <img src={assets.logo} className='mb-5 w-32' alt="" />
            <p className='w-full md:w-2/3 text-red-700'>
                Aninaya.co is a cozy digital marketplace dedicated to showcasing the handcrafted beauty of crochet products made by talented local artisans in Baguio. Our platform celebrates slow craft, creativity, and cultural artistry—bringing you thoughtfully made pieces that blend tradition with modern design.

From soft home décor to charming accessories and collectible handmade items, every stitch is crafted with heart. By supporting Aninaya.co, you’re not just purchasing a product—you’re uplifting local makers, preserving craft communities, and bringing authentic Filipino artistry into your home.

Discover the warmth of handmade.
Discover Aninaya.co.
            </p>
        </div>

        <div>
          <p className='text-xl font-medium mb-5'>SHOP</p>
          <ul className='flex flex-col gap-1 text-gray-600'>
            <li><Link to='/'>Home</Link></li>
            <li><Link to='/about'>About Us</Link></li>
            <li>Delivery</li>
            <li>Privacy policy</li>
          </ul>
        </div>

      </div>

        {/* Footer note removed per request */}

    </div>
  )
}

export default Footer
