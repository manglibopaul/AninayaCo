// Hero.jsx
import React from 'react'
import { assets } from '../assets/assets'

const Hero = () => {
  //  fixed header height 
  const HEADER_OFFSET = 0; 

  const scrollToCollection = () => {
    const target = document.getElementById('latest-collection');
    if (!target) {
      console.warn('Target #latest-collection not found in DOM.');
      return;
    }

    // scrollIntoView 
    try {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // fixed header, adjust after a short delay
      if (HEADER_OFFSET) {
        // small timeout to allow scrollIntoView to run then adjust offset
        setTimeout(() => {
          const absoluteTop = target.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({ top: absoluteTop - HEADER_OFFSET, behavior: 'smooth' });
        }, 100);
      }
    } catch (e) {
      
      const absoluteTop = target.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: absoluteTop - HEADER_OFFSET, behavior: 'smooth' });
    }
  };

  return (
    <div className='flex flex-col sm:flex-row border border-gray-400'>
      {/* Hero left side */}
      <img className='w-full sm:w-1/2' src={assets.hero_img} alt="" />

      {/* Hero right side */}
      <div className='w-full sm:w-1/2 flex items-center justify-center py-10 sm:py-0 bg-yellow-100'>
        <div className='text-[#414141]'>
          <div className='flex items-center gap-2'>
            <p className='w-8 md:w-11 h-[2px] bg-[#414141]'></p >
            <p className='font-medium text-sm md:text-base'>OUR BESTSELLERS</p>
          </div>

          <h1 className='prata-regular text-3xl sm:py-3 lg:text-5xl leading-relaxed'>New Products</h1>

          <div className='flex flex-col items-start gap-2'>
            <div className='flex items-center gap-2'>
              <p className='font-semibold text-sm md:text-base'>SHOP NOW</p>
              <p className='w-8 md:w-11 h-[1px] bg-[#414141]'></p>
            </div>

            {/* ---------------Dropdown scroll button-------------------- */}
            <button
              onClick={scrollToCollection}
              aria-label="Scroll to Latest Collection"
              className="mt-3 text-black text-2xl cursor-pointer hover:bg-yellow-600 transition-all duration-500 transform bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-sm"
            >
              {/* ------------------------arrow icon------------------------------ */}
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 14a1 1 0 01-.707-.293l-4-4a1 1 0 011.414-1.414L10 11.586l3.293-3.293a1 1 0 011.414 1.414l-4 4A1 1 0 0110 14z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero
