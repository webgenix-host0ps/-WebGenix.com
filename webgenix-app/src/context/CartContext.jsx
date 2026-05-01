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
    const productId = product._id || product.productId;
    
    setCart(prevCart => {
      const existing = prevCart.find(item => item.productId === productId && item.cycle === cycle);
      if (existing) {
        return prevCart.map(item => 
          item.productId === productId && item.cycle === cycle
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      }
      
      return [...prevCart, {
        productId: productId,
        name: product.name,
        description: product.description,
        cycle: cycle || pricing?.cycle || 'monthly',
        price: pricing?.price || 0,
        setupFee: pricing?.setupFee || 0,
        quantity: 1
      }];
    });
  };

  const removeFromCart = (productId, cycle) => {
    setCart(prevCart => prevCart.filter(item => {
      const id = item.productId || item._id;
      if (cycle) {
        return !(id === productId && item.cycle === cycle);
      }
      return id !== productId;
    }));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)) + (item.setupFee || 0), 0);
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