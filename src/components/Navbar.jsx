import React, { useContext, useState } from 'react' 
import {assets} from '../assets/assets'
import { Link, NavLink } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';

const Navbar = () => {

    const [visible,setVisible] = useState(false);
    const sellerToken = localStorage.getItem('sellerToken');
    const sellerRaw = localStorage.getItem('seller')
    let sellerObj = null
    try { sellerObj = sellerRaw ? JSON.parse(sellerRaw) : null } catch (e) { sellerObj = null }
    const sellerLabel = sellerObj?.storeName || 'Aninaya.co'

    const userRaw = localStorage.getItem('user')
    let userObj = null
    try { userObj = userRaw ? JSON.parse(userRaw) : null } catch (e) { userObj = null }

    const {setShowSearch , getCartCount} = useContext(ShopContext); 
    const navigate = (path) => window.location.href = path;

  return (
    <div className='flex items-center justify-between py-5 font-medium'>

        <Link to='/'><img src={assets.logo} className='w-36' alt="" /></Link>
      
      <ul className='hidden sm:flex gap-5 text-sm text-gray-700'>

        <NavLink to='/'className='flex flex-col items-center gap-1'>
            <p>HOME</p>
            <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden'/>
        </NavLink>
        <NavLink to='/collection'className='flex flex-col items-center gap-1'>
            <p>COLLECTION</p>
            <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden'/>
        </NavLink>
        <NavLink to='/about'className='flex flex-col items-center gap-1'>
          <p>ABOUT</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden'/>
        </NavLink>
        <NavLink to='/contact'className='flex flex-col items-center gap-1'>
          <p>CONTACT</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden'/>
        </NavLink>
      </ul>
      <div className='flex items-center gap-6'>
        <img onClick ={()=>setShowSearch(true)}src={assets.search_icon} className='w-5 cursor-pointer' alt="" loading="lazy" />

            <Link to='/cart' className='relative'>
                <img src={assets.cart_icon} className='w-5 min-w-5' alt="" loading="lazy" />
                <p className='absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]'>{getCartCount()}</p>
            </Link>

            {/* Chat moved into page content (Home) below; link removed */}

            {sellerToken && sellerObj && (
              <Link to='/seller/profile' className='text-sm text-gray-700 hover:text-black'>
                {sellerLabel}
              </Link>
            )}

            {userObj ? (
              <>
                <Link to='/profile' className='flex items-center gap-2 text-sm text-gray-700 hover:text-black' aria-label='Profile'>
                  <img src={assets.profile_icon} alt='Profile' className='w-5 h-5 rounded-full object-contain bg-gray-100 p-0.5' />
                </Link>
                {/* Admin removed; sellers act as admins now */}
                {/* Logout moved to Profile page */}
              </>
            ) : (
              <Link to='/login' className='text-sm text-gray-700 hover:text-black'>Login</Link>
            )}

            <img onClick={()=>setVisible(true)} src={assets.menu_icon} className='w-5 cursor-pointer sm:hidden' alt="" loading="lazy" />
      </div>

        {/* sidebar menu for a much smaller devices */}

        <div className={`absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all ${visible ? 'w-full' : 'w-0'}`}>
            <div className='flex flex-col text-gray-600'>
                <div onClick={()=>setVisible(false)} className='flex items-center gap-4 p-3'>
                     <img className='h-4 rotate-180' src={assets.dropdown_icon} alt="" />
                     <p>Back</p>
                </div>
                <NavLink onClick={()=>setVisible(false)} className='py-2 pl-6 border' to='/'>HOME</NavLink>
                <NavLink onClick={()=>setVisible(false)} className='py-2 pl-6 border' to='/collection'>COLLECTION</NavLink>
                <NavLink onClick={()=>setVisible(false)} className='py-2 pl-6 border' to='/about'>ABOUT</NavLink>
                <NavLink onClick={()=>setVisible(false)} className='py-2 pl-6 border' to='/contact'>CONTACT</NavLink>
                {/* Admin link removed from global nav; Admin UI is inside SellerDashboard */}

            </div>
        </div>

    </div>
  )
}

export default Navbar
