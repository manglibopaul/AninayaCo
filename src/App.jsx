import React from 'react'
import { Routes,Route } from 'react-router-dom'
import Home from './pages/Home'
import Collection from './pages/Collection'
import About from './pages/About'
import Contact from './pages/Contact'
import Product from './pages/Product'
import Cart from './pages/Cart'
import ArView from './pages/ArView'
import Login from './pages/Login'
import Orders from './pages/Orders'
import OrderDetails from './pages/OrderDetails'
import Profile from './pages/Profile'
import PlaceOrder from './pages/PlaceOrder'
import SellerLogin from './pages/SellerLogin'
import SellerDashboard from './pages/SellerDashboard'
import SellerProfile from './pages/SellerProfile'
import SellerOrders from './pages/SellerOrders'
import SellerAdmin from './pages/SellerAdmin'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import SearchBar from './components/SearchBar'
import ChatWidget from './components/ChatWidget'



const App = () => {
  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
      <Navbar />
      <SearchBar/>
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/collection' element={<Collection/>} />
        <Route path='/about' element={<About/>} />
        <Route path='/contact' element={<Contact/>} />
        <Route path='/product/:productId' element={<Product/>} />
        <Route path='/cart' element={<Cart/>} />
        <Route path='/ar-view' element={<ArView/>} />
        <Route path='/login' element={<Login/>} />
        <Route path='/orders' element={<Orders/>} />
        <Route path='/orders/:id' element={<OrderDetails/>} />
        <Route path='/profile' element={<Profile/>} />
        <Route path='/place-order' element={<PlaceOrder/>} />
        {/* Full page Chat removed; use floating ChatWidget instead */}
        <Route path='/seller/login' element={<SellerLogin/>} />
        <Route path='/seller/admin' element={<SellerAdmin/>} />
        <Route path='/seller/dashboard' element={<SellerDashboard/>} />
        <Route path='/seller/orders' element={<SellerOrders/>} />
        <Route path='/seller/profile' element={<SellerProfile/>} />

      </Routes>
      <Footer/>
      <ChatWidget />
    </div>
  )
}

export default App
