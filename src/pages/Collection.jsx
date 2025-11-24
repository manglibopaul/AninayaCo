import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';

const Collection = () => {

  const { products , search , showSearch } = useContext(ShopContext);
  const [showFilter,setShowFilter] = useState(false);
  const [filterProducts,setFilterProducts] = useState ([]);
  const [category,setCategory] = useState([]);
  const [subCategory,setSubCategory] = useState([]);
  const [sortType,setSortType] = useState('relevant')

  const toggleCategory = (e) => {
    
    if (category.includes(e.target.value)) {
      setCategory(prev=> prev.filter(item => item !== e.target.value))
    }
    else {
      setCategory(prev => [...prev,e.target.value])
    }
  }

  const toggleSubCategory = (e) => {
    if (subCategory.includes(e.target.value)) {
      setSubCategory(prev=> prev.filter(item => item !== e.target.value))
    }
    else{
      setSubCategory(prev => [...prev,e.target.value])
    }
  }

    const applyFilter = () => {

    let productsCopy = products.slice();

    if (showSearch && search) {
      productsCopy = productsCopy.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));
    }

    if (category.length > 0) {
      productsCopy = productsCopy.filter(item => category.includes(item.category));
      
    }

    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter(item => subCategory.includes(item.subCategory));
    }

    setFilterProducts(productsCopy)

      }

      const sortProduct = () => {

      let fpCopy = filterProducts.slice();

      switch (sortType) {
        case 'low-high':
          setFilterProducts(fpCopy.sort((a,b)=>(a.price - b.price)));
          break;

        case 'high-low':
          setFilterProducts(fpCopy.sort((a,b)=>(b.price - a.price)));
          break;

        default:
          applyFilter();
          break;

    }

  }


  useEffect(()=>{
    applyFilter();
  },[category,subCategory,search,showSearch])

  useEffect(()=>{
    sortProduct()
  },[sortType]); 

  return (
    <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t'>
      
      {/* Filter option for products */}
      <div className='min-w-60 '>
        <p onClick={()=>setShowFilter(!showFilter)} className='my-2 text-xl flex items-center cursor-pointer gap-3'>FILTERS
          <img className={`h-3 sm:hidden ${showFilter ? 'rotate-90' : ''}`} src={assets.dropdown_icon} alt="" />
        </p>
        {/* Filter for the main category of the products */}
        <div className={`border border-gray-300 pl-5 py-3 mt-6 ${showFilter ? '' : 'hidden'} sm:block bg-blue-100`}>
          <p className='mb-3 text-sm font-medium'>CATEGORIES</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>

            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Decor'} onChange={toggleCategory} /> Decor
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Accessories'} onChange={toggleCategory} /> Accessories
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Fashion'} onChange={toggleCategory} /> Fashion
            </p>
          </div>
        </div>
        {/* Filter option for the Sub category of the products */}
        <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? '' : 'hidden'} sm:block bg-pink-100`}>
          <p className='mb-3 text-sm font-medium'>PRODUCT TYPE</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>

            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Scarves'} onChange={toggleSubCategory} /> Scarves
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Keychains'} onChange={toggleSubCategory} /> Keychains
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Pillows'} onChange={toggleSubCategory} /> Pillows
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Decorations'} onChange={toggleSubCategory} /> Decorations
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Bouquets'} onChange={toggleSubCategory} /> Bouquets
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Coasters'} onChange={toggleSubCategory} /> Coasters
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Hangings'} onChange={toggleSubCategory} /> Hangings
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Collectibles'} onChange={toggleSubCategory} /> Collectibles
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Bonnets'} onChange={toggleSubCategory} /> Bonnets
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Bags'} onChange={toggleSubCategory} /> Bags
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Charms'} onChange={toggleSubCategory} /> Charms
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Pins'} onChange={toggleSubCategory} /> Pins
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Rugs'} onChange={toggleSubCategory} /> Rugs
            </p>
          </div>
        </div>
      </div>

      {/* Right side of the collection page that shows the products */}

      <div className='flex-1 bg-pink-100'>

        <div className='flex justify-between text-base sm:text-2xl mb-4'>

          <Title text1={'ALL'} text2={'PRODUCTS'}/>

          {/* Product sort */}

          <select onChange={(e)=>setSortType(e.target.value)} className='border-2 border-gray-300 text-sm px-2'>
          <option value="relevant">Sort by: Relevant</option>
          <option value="low-high">Sort by: Low to High</option>
          <option value="high-low">sort by: High to Low</option>
          </select>
        </div>

        {/* mapping products  */}
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
          {
            filterProducts.map((item,index)=>(
              <ProductItem key={index} name={item.name} id={item._id} price={item.price} image={item.image} />
            ))
          }
        </div>

      </div>

    </div>
  )
}

export default Collection
