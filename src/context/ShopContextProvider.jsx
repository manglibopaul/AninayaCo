import React, { useEffect, useState } from "react";
import { ShopContext } from "./ShopContext";
import { products } from "../assets/assets";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ShopContextProvider = (props) => {

  const currency = "₱";
  const delivery_fee = 40;
  const [search,setSearch] = useState ('');
  const [showSearch,setShowSearch] = useState (false);
  const [cartsItems, setCartItems] = useState({});
  const navigate = useNavigate();
  
  const addToCart = async (itemId,size) => {

    if (!size) {
      toast.error('Pls Select Product Size!');
      return;
    }

      let cartData = structuredClone(cartsItems);

      if (cartData[itemId]) {
        if (cartData[itemId][size]) {
          cartData[itemId][size] += 1;
        }
        else{
          cartData[itemId][size] = 1;
        }
      }
      else{
        cartData[itemId] = {};
        cartData[itemId][size] = 1;
      }
      setCartItems(cartData);

  }

  const getCartCount = () => {
    let totalCount = 0;
    for(const items in cartsItems){
      for(const item in cartsItems[items]){
        try {
          if (cartsItems[items][item] > 0) {
            totalCount += cartsItems[items][item];
          }
        } catch (error) {
          
        }
      }
    }
    return totalCount;
  }

  const updateQuantity = async (itemId,size,quantity) => {

    let cartData = structuredClone(cartsItems);

    cartData[itemId][size] = quantity;

    setCartItems(cartData);
  }

  const getCartAmount =  () => {
    let totalAmount = 0;
    for(const items in cartsItems){
      let itemInfo = products.find((product)=> product._id === items);
      for(const item in cartsItems[items]){
        try {
          if (cartsItems[items][item] > 0) {
            totalAmount += itemInfo.price * cartsItems[items][item]
          }
        } catch (error) {
          
        }
      }
    }
    return totalAmount;
  }

  const value = {
    products,
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
