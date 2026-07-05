import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('chef_cart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('chef_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (dish) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === dish.id);
      if (existing) {
        toast.success(`+1 ${dish.name}`);
        return prev.map(i => i.id === dish.id ? { ...i, qty: i.qty + 1 } : i);
      }
      toast.success(`${dish.name} added!`);
      return [...prev, { ...dish, qty: 1 }];
    });
  };

  const decreaseQty = (id) => {
    setCart(prev => {
      const item = prev.find(i => i.id === id);
      if (item && item.qty === 1) return prev.filter(i => i.id !== id);
      return prev.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i);
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(i => i.id !== id));
    toast.success('Removed from cart');
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + (i.price * i.qty), 0);
  const getQty = (id) => cart.find(i => i.id === id)?.qty || 0;

  return (
    <CartContext.Provider value={{
      cart, addToCart, decreaseQty, removeFromCart, clearCart,
      totalItems, totalPrice, getQty
    }}>
      {children}
    </CartContext.Provider>
  );
}
