import React from 'react'
import { assets } from '../assets/assets'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className='bg-white border-t border-gray-200'>
      <div className='max-w-6xl mx-auto px-4 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-8'>
          {/* Brand */}
          <div>
            <img src={assets.logo} className='w-16 mb-4' alt='Aninaya Logo' />
            <h3 className='font-semibold text-gray-900 mb-2'>knot.ninya</h3>
            <p className='text-sm text-gray-600'>
              Handmade with love. Every stitch tells a story.
            </p>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className='font-semibold text-gray-900 mb-3'>Shop</h4>
            <ul className='space-y-2 text-sm text-gray-600'>
              <li><Link to='/' className='hover:text-gray-900'>Home</Link></li>
              <li><Link to='/about' className='hover:text-gray-900'>About Us</Link></li>
              <li><Link to='/contact' className='hover:text-gray-900'>Contact</Link></li>
              <li><a href='#' className='hover:text-gray-900'>Delivery Info</a></li>
            </ul>
          </div>

          {/* Get in Touch */}
          <div>
            <h4 className='font-semibold text-gray-900 mb-3'>Get in Touch</h4>
            <ul className='space-y-1 text-sm text-gray-600'>
              <li>Email: @aninaya.co</li>
              <li>Location: La Trinidad, Benguet</li>
              <li className='text-xs pt-2'>Made with ❤️</li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className='border-t border-gray-200 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-600'>
          <p>&copy; 2024 Aninaya. All rights reserved.</p>
          <div className='flex gap-4 mt-4 sm:mt-0'>
            <a href='#' className='hover:text-gray-900'>Privacy Policy</a>
            <a href='#' className='hover:text-gray-900'>Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
