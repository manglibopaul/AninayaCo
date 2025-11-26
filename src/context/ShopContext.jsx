import { createContext, useContext, useState, useEffect } from "react";

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Crochet Bag',
      price: 25.99,
      image: '/images/products/bag.jpg',
      description: 'Handmade crochet bag with flower pattern',
      category: 'accessories'
    },
    {
      id: 2,
      name: 'Crochet Hat',
      price: 18.99,
      image: '/images/products/hat.jpg',
      description: 'Warm crochet beanie',
      category: 'accessories'
    },
    {
      id: 3,
      name: 'Crochet Scarf',
      price: 22.50,
      image: '/images/products/scarf.jpg',
      description: 'Long crochet scarf',
      category: 'accessories'
    }
  ]);

  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const value = {
    products,
    cart,
    addToCart,
    removeFromCart
  };

  return (
    <ShopContext.Provider value={value}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};

export default ShopContext;
