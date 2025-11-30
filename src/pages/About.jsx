import React from 'react'
import Title from '../components/Title'
import NewsletterBox from '../components/NewsletterBox'
import { assets } from '../assets/assets'

const About = () => {
  return (
    <div>
      {/* Header Section */}
      <div className='text-2xl text-center pt-8 border-t'>
        <Title text1={'ABOUT'} text2={'US'} />
      </div>

      {/* Main Content */}
      <div className='my-10'>
        <div className='flex gap-16'>
          <div className='flex flex-col items-center justify-center'>
            <img
              className='w-full md:max-w-[350px] rounded-full'
              src={assets.knot}
              alt='knot.ninya - Handmade with Love'
            />
          </div>
          <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600'>
            <p>
              Welcome to <span className='font-bold'>Aninaya</span>, established in 2020. We are <span className='font-semibold'>knot.ninya</span> — a brand dedicated to creating handmade products crafted with love and care.
            </p>
            <p>
              Every piece in our collection is made by hand with meticulous attention to detail. We believe that handmade products carry a special energy and story that mass-produced items simply cannot replicate. Our artisans pour their passion and creativity into each creation, ensuring that what you receive is truly one-of-a-kind.
            </p>
            <b className='text-gray-800'>Handmade with Love</b>
            <p>
              At Aninaya/knot.ninya, we celebrate the art of handcraftsmanship. From the selection of materials to the final stitch, every step is done with intention and care. We believe in supporting sustainable practices and creating products that not only look beautiful but also carry the soul of the maker. When you purchase from us, you're supporting artisans and the timeless tradition of handmade craftsmanship.
            </p>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className='text-4xl py-4'>
        <Title text1={'WHY CHOOSE'} text2={'US'} />
      </div>
      <div className='flex flex-col md:flex-row text-sm mb-20'>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Quality Assurance</b>
          <p className='text-gray-600'>
            We meticulously select every product to ensure it meets our rigorous quality standards. Your satisfaction is our priority.
          </p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Convenient Shopping</b>
          <p className='text-gray-600'>
            Browse our collection from the comfort of your home. Easy navigation, secure checkout, and fast delivery to your doorstep.
          </p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Excellent Customer Support</b>
          <p className='text-gray-600'>
            Our dedicated team is here to help. Get support via chat, email, or phone whenever you need us.
          </p>
        </div>
      </div>

      {/* Newsletter Section */}
      <NewsletterBox />
    </div>
  )
}

export default About
