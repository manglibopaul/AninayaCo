import React, { useEffect, useState } from "react";
import { ShopContext } from "./ShopContext";
import axios from 'axios'
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ShopContextProvider = (props) => {

  const currency = "₱";
  const delivery_fee = 40;
  const [search,setSearch] = useState ('');
  const [showSearch,setShowSearch] = useState (false);
  const [cartsItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
  
  // Add item to cart with optional quantity (default 1)
  const addToCart = async (itemId, qty = 1) => {

    let cartData = structuredClone(cartsItems);

    if (cartData[itemId]) {
      cartData[itemId] += Number(qty || 0);
    } else {
      cartData[itemId] = Number(qty || 0) || 1;
    }
    setCartItems(cartData);
    toast.success('Item added to cart!');

  }

  const getCartCount = () => {
    let totalCount = 0;
    for(const items in cartsItems){
      try {
        if (cartsItems[items] > 0) {
          totalCount += cartsItems[items];
        }
      } catch (error) {
        
      }
    }
    return totalCount;
  }

  const updateQuantity = async (itemId,quantity) => {

    let cartData = structuredClone(cartsItems);

    cartData[itemId] = quantity;

    setCartItems(cartData);
  }

  const getCartAmount =  () => {
    let totalAmount = 0;
    for(const items in cartsItems){
      let itemInfo = products.find((product)=> (product._id ? product._id === items : product.id === Number(items)) );
      try {
        if (cartsItems[items] > 0) {
          totalAmount += itemInfo.price * cartsItems[items]
        }
      } catch (error) {
        
      }
    }
    return totalAmount;
  }

  // Fetch products from backend
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/products`);
      setProducts(res.data || []);
    } catch (error) {
      console.error('Error fetching products for context:', error);
      toast.error('Failed to load products');
    }
  }

  useEffect(() => {
    fetchProducts();
  }, [])

  const value = {
    products,
    refreshProducts: fetchProducts,
    currency,
    delivery_fee,
    search,setSearch,showSearch,setShowSearch,
    cartsItems,addToCart,
    getCartCount,updateQuantity,getCartAmount, navigate
  };

  return (
    <ShopContext.Provider value={value}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
