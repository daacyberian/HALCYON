import { createContext, useContext, useState, useEffect } from 'react';
import { getCart, addToCartAPI, removeFromCartAPI, incrementCartItem, decrementCartItem } from '../services/api';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
      
      if (!user?.token) {
        // Use local storage cart for non-logged in users
        const localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
        setCart(localCart);
        const count = localCart.reduce((sum, item) => sum + item.quantity, 0);
        const total = localCart.reduce((sum, item) => sum + (item.Price * item.quantity), 0);
        setCartCount(count);
        setCartTotal(total);
        setLoading(false);
        return;
      }

      const response = await getCart();
      const cartData = response.data || [];
      setCart(cartData);
      const count = cartData.reduce((sum, item) => sum + (item.Quantity || 1), 0);
      const total = cartData.reduce((sum, item) => sum + (item.Price * (item.Quantity || 1)), 0);
      setCartCount(count);
      setCartTotal(total);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async (productId, name, price, quantity = 1) => {
    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
      
      if (!user?.token) {
        // Add to local cart for non-logged in users
        const localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
        const existingItem = localCart.find(item => item.ProductID === productId);
        
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          localCart.push({ ProductID: productId, Name: name, Price: price, quantity, image: `https://picsum.photos/seed/${productId}/100/100` });
        }
        
        localStorage.setItem('localCart', JSON.stringify(localCart));
        await fetchCart();
        return { success: true };
      }

      await addToCartAPI(productId, quantity);
      await fetchCart();
      return { success: true };
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { success: false, error: error.response?.data?.error || 'Failed to add to cart' };
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
      
      if (!user?.token) {
        const localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
        const newCart = localCart.filter(item => item.ProductID !== productId);
        localStorage.setItem('localCart', JSON.stringify(newCart));
        await fetchCart();
        return;
      }

      await removeFromCartAPI(productId);
      await fetchCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateQuantity = async (productId, change) => {
    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
      
      if (!user?.token) {
        const localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
        const item = localCart.find(i => i.ProductID === productId);
        if (item) {
          item.quantity += change;
          if (item.quantity <= 0) {
            const newCart = localCart.filter(i => i.ProductID !== productId);
            localStorage.setItem('localCart', JSON.stringify(newCart));
          } else {
            localStorage.setItem('localCart', JSON.stringify(localCart));
          }
        }
        await fetchCart();
        return;
      }

      if (change > 0) {
        await incrementCartItem(productId);
      } else {
        await decrementCartItem(productId);
      }
      await fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const clearCart = () => {
    localStorage.removeItem('localCart');
    setCart([]);
    setCartCount(0);
    setCartTotal(0);
  };

  const value = {
    cart,
    cartCount,
    cartTotal,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    fetchCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
