import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('webgenix_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('webgenix_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, cycle = 'monthly') => {
    const pricing = product.pricing?.find(p => p.cycle === cycle) || product.pricing?.[0];
    const existing = cart.find(item => item.productId === product._id && item.cycle === cycle);
    if (existing) return;
    
    setCart([...cart, {
      productId: product._id,
      name: product.name,
      description: product.description,
      cycle: cycle || pricing?.cycle || 'monthly',
      price: pricing?.price || 0,
      setupFee: pricing?.setupFee || 0
    }]);
  };

  const removeFromCart = (productId, cycle) => {
    setCart(cart.filter(item => !(item.productId === productId && item.cycle === cycle)));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + item.price + (item.setupFee || 0), 0);
  };

  const getCartItemCount = () => cart.length;

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      clearCart,
      getCartTotal,
      getCartItemCount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);