import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, ShoppingBag, Plus, Minus } from 'lucide-react';

const Cart = () => {
  const { cart, cartTotal, removeFromCart, updateQuantity, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="page-content">
        <div className="page-container">
          <div className="empty-cart">
            <ShoppingBag size={64} />
            <h2>Your cart is empty</h2>
            <p>Add some products to get started!</p>
            <Link to="/" className="btn btn-primary">Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="page-container">
        <h1 className="page-title">Shopping Cart</h1>
        
        <div className="cart-layout">
          <div className="cart-items">
            {cart.map((item, index) => (
              <div key={item.ProductID || item.productId || index} className="cart-item">
                <img
                  src={item.image || `https://picsum.photos/seed/${item.ProductID || item.productId}/100/100`}
                  alt={item.Name}
                  className="cart-item-img"
                />
                <div className="cart-item-details">
                  <h3>{item.Name}</h3>
                  <p className="cart-item-price">
                    ${((item.Price || item.price) * (item.quantity || item.Quantity || 1)).toFixed(2)}
                  </p>
                  <div className="quantity-controls">
                    <button 
                      className="qty-btn"
                      onClick={() => updateQuantity(item.ProductID || item.productId, -1)}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="qty-value">{item.quantity || item.Quantity || 1}</span>
                    <button 
                      className="qty-btn"
                      onClick={() => updateQuantity(item.ProductID || item.productId, 1)}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <button
                  className="remove-cart-btn"
                  onClick={() => removeFromCart(item.ProductID || item.productId)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          
          <div className="cart-summary">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <button
              className="checkout-btn"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Proceed to Checkout'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .quantity-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        .qty-btn {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f5f5;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          color: #1a1a1a;
        }
        .qty-btn:hover {
          background: #e8e8e8;
        }
        .qty-value {
          min-width: 24px;
          text-align: center;
          font-weight: 500;
        }
        .remove-cart-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #ef4444;
          padding: 0.5rem;
        }
        .checkout-btn {
          width: 100%;
          padding: 0.875rem 1.5rem;
          background: #1a1a1a;
          color: white;
          border: none;
          border-radius: 9999px;
          font-weight: 500;
          font-size: 0.875rem;
          cursor: pointer;
          margin-top: 1rem;
          transition: all 0.2s;
        }
        .checkout-btn:hover {
          background: #000000;
        }
        .checkout-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default Cart;
