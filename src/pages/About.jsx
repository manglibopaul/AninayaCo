import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import NewsletterBox from '../components/NewsletterBox'

const About = () => {
  return (
    <div>
      <div className='text-2xl text-center pt-8 border-t'>
          <Title text1={'ABOUT'} text2={'US'} />
      </div>

      <div className='my-10 flex flex-col md:flex-row gap-16'>
          <img className='w-full md:max-w-[450px]' src={assets.about_img} alt="" />
          <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gary-600'>
              <p>Aninaya.co is a modern digital platform created to celebrate the artistry, passion, and craftsmanship of Baguio’s crochet community. Built with the goal of uplifting local creators, our website serves as a bridge between talented crochet artists and customers who appreciate authentic, handmade work.</p>
              <p>What sets Aninaya.co apart is our use of Augmented Reality (AR)—a feature that allows buyers to preview crochet products in real-world environments before purchasing. With AR, customers can explore every detail, visualize how an item fits into their space, and shop with confidence.</p>
                <b className='text-gary-800'>Our Mission</b>
              <p>At Aninaya.co, we believe in the power of creativity and community. By showcasing locally crafted crochet pieces, we aim to provide artists with greater visibility, fair opportunities, and a platform to share their stories through their craft. Every purchase directly supports Baguio artisans and helps preserve the rich culture of handmade Filipino goods.</p>
              <p>We invite you to discover the warmth and soul embedded in every stitch—an experience made more immersive, interactive, and connected through technology.</p>
              <p className=' text-2xl prata-regular'>Aninaya.co — where handmade meets innovation.</p>
              
          </div>
      </div>

      <div className='text-3xl py-4'>
          <Title text1={'WHY'} text2={'CHOOSE US'} />
      </div>

      <div className='flex flex-col md:flex-row text-sm mb-20'>
          <div className='border px-10 md:px-16 py-18 sm:py-20 flex flex-col gap-5'>
              <b>Quality Assurance</b>
              <p className='text-gray-600'>We insure products you purchase is a high quality to meet your expectation</p>
          </div>
          <div className='border px-10 md:px-16 py-18 sm:py-20 flex flex-col gap-5'>
              <b>Handmade</b>
              <p className='text-gray-600'>We make sure that all product are crafted by our Crochet artist to provide you a product that is made through love and passion</p>
          </div>
          <div className='border px-10 md:px-16 py-18 sm:py-20 flex flex-col gap-5'>
              <b>AR Service</b>
              <p className='text-gray-600'>AR service uses augmented reality technology to overlay digital content onto real-world environments, creating an interactive and immersive experience for customers. This helps users visualize products more clearly, explore features in real time, and make more confident purchase decisions.</p>
          </div>
      </div>
      <NewsletterBox/>

    </div>
  )
}

export default About
