import React, { useContext, useState } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { assets } from '../assets/assets'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'

// Helper to build items from cart
const buildItemsFromCart = (cartsItems, products) => {
  const items = [];
  for (const key in cartsItems) {
    const qty = cartsItems[key];
    if (!qty || qty <= 0) continue;
    // key may be string id; match product by id or _id
    const prod = products.find(p => (p._id ? String(p._id) === String(key) : String(p.id) === String(key)));
    if (prod) {
      items.push({ productId: prod.id || prod._id, name: prod.name, price: prod.price, quantity: qty, sellerId: prod.sellerId || prod.sellerId || null });
    } else {
      // fallback, include id only
      items.push({ productId: Number(key), quantity: qty });
    }
  }
  return items;
}

const PlaceOrder = () => {

  const [method,setMethod] = useState('cod')

  const {navigate} = useContext(ShopContext);
  const { products, cartsItems, refreshProducts } = useContext(ShopContext);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [country, setCountry] = useState('');
  const [phone, setPhone] = useState('');
  const [placing, setPlacing] = useState(false);

  return (
    <div className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
      {/* ----------------Left side ------------------ */}
      <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>

        <div className='text-xl sm:text-2xl my-3'>
          <Title text1={'DELIVERY'} text2={'INFORMATION'}/>
        </div>
          {method !== 'pickup' ? (
            <>
              <div className='flex gap-3'>
                <input value={firstName} onChange={e=>setFirstName(e.target.value)} className='border border-pink-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='First name' />
                <input value={lastName} onChange={e=>setLastName(e.target.value)} className='border border-pink-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Last name' />
              </div>
              <input value={email} onChange={e=>setEmail(e.target.value)} className='border border-pink-300 rounded py-1.5 px-3.5 w-full' type="email" placeholder='Email address' />
              <input value={street} onChange={e=>setStreet(e.target.value)} className='border border-pink-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Street' />
              <div className='flex gap-3'>
                <input value={city} onChange={e=>setCity(e.target.value)} className='border border-pink-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='City' />
                <input value={province} onChange={e=>setProvince(e.target.value)} className='border border-pink-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Province' />
              </div>
              <div className='flex gap-3'>
                <input value={zipcode} onChange={e=>setZipcode(e.target.value)} className='border border-pink-300 rounded py-1.5 px-3.5 w-full' type="number" placeholder='Zipcode' />
                <input value={country} onChange={e=>setCountry(e.target.value)} className='border border-pink-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Country' />
              </div>
              <input value={phone} onChange={e=>setPhone(e.target.value)} className='border border-pink-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Phone' />
            </>
          ) : (
            <div className='p-4 border rounded bg-yellow-50 text-sm text-gray-700'>
              You selected <strong>Pick Up</strong>. No shipping address is required — your order will be held for pickup. We'll contact your email/phone when the order is ready.
            </div>
          )}

      </div>

        {/* ---------------- Right side---------------- */}
        <div className='mt-3'>
          
          <div className='mt-6 min-w-80'>
            <CartTotal />
          </div>

                <div className='mt-8'>
              <Title text1={'PAYMENT'} text2={'METHOD'}/>
              {/* ---------Payment Method Selection------------------ */}
              <div className='Flex gap-3 flex-col lg:flex-row'>
                <div onClick={()=>setMethod('pickup')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer border-pink-300'>
                  <p className={`min-w-3.5 h-3.5 border rounded-full border-black ${method === 'pickup' ? 'bg-green-400' : ''}`}></p>
                  <p className='text-gray-500 text-sm font-medium mx-9'>PICK UP</p>
                </div>
                <div onClick={()=>setMethod('cod')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer border-pink-300'>
                  <p className={`min-w-3.5 h-3.5 border rounded-full border-black ${method === 'cod' ? 'bg-green-400' : ''}`}></p>
                  <p className='text-gray-500 text-sm font-medium mx-9'>CASH ON DELIVERY</p>
                </div>
              </div>

              <div className='w-full text-end mt-8'>
                <button onClick={async ()=>{
                    // Build order payload and submit
                    const token = localStorage.getItem('token');
                    if (!token) {
                      alert('Please login to place order');
                      navigate('/login');
                      return;
                    }
                    const items = buildItemsFromCart(cartsItems, products || []);
                    if (items.length === 0) {
                      alert('Your cart is empty');
                      return;
                    }

                    // compute subtotal
                    const subtotal = items.reduce((sum, it) => sum + (Number(it.price || 0) * Number(it.quantity || 0)), 0);
                    const address = method === 'pickup' ? {} : { firstName, lastName, email, street, city, state: province, zipcode, country, phone };

                    try {
                      setPlacing(true);
                      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders`, {
                        items,
                        address,
                        paymentMethod: method,
                        subtotal,
                        commission: 0,
                      }, {
                        headers: { Authorization: `Bearer ${token}` }
                      });
                      // on success
                      refreshProducts && refreshProducts();
                      navigate('/orders');
                    } catch (err) {
                      console.error('Place order error', err);
                      alert(err.response?.data?.message || 'Failed to place order');
                    } finally {
                      setPlacing(false);
                    }
                  }} className='bg-black text-white px-20 py-3 text-sm'>
                  {placing ? 'Placing…' : 'CHECKOUT ORDER'}
                </button>
              </div>
            </div>

        </div>
    </div>
  )
}

export default PlaceOrder
