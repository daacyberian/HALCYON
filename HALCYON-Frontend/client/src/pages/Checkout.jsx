import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function Checkout() {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    address: '',
    contact: '',
    payment: 'card'
  });
  const [discountCode, setDiscountCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountMsg, setDiscountMsg] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + (item.Price * item.Quantity), 0);
  const tax = subtotal * 0.18;
  const discountAmount = (discountPercent / 100) * subtotal;
  const total = subtotal + tax - discountAmount;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const applyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountMsg('Please enter a code.');
      return;
    }
    try {
      const res = await axios.post('https://ecom-backend-alpha-rust.vercel.app/discount/apply', { code: discountCode });
      if (res.data.percent > 0) {
        setDiscountPercent(res.data.percent);
        setDiscountMsg(`Discount applied: ${res.data.percent}% OFF!`);
      } else {
        setDiscountPercent(0);
        setDiscountMsg(res.data.error || 'Invalid code.');
      }
    } catch (err) {
      setDiscountMsg('Server error.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.token) {
      setMessage({ type: 'error', text: 'Please log in to place an order.' });
      return;
    }
    if (cart.length === 0) {
      setMessage({ type: 'error', text: 'Your cart is empty.' });
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        customerId: user.CustomerID,
        name: formData.name,
        email: formData.email,
        address: formData.address,
        contact: formData.contact,
        paymentMethod: formData.payment === 'card' ? 'Credit Card' : 'COD',
        transactionId: 'txn_' + Date.now(),
        items: cart.map(item => ({
          productId: item.ProductID,
          quantity: item.Quantity,
          price: item.Price
        })),
        discount: discountAmount,
        discountPercent,
        discountCode,
        subtotal,
        tax
      };

      const res = await axios.post('https://ecom-backend-alpha-rust.vercel.app/order/checkout', orderData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      if (res.data.message || res.data.orderId) {
        let loyaltyMsg = '';
        if (res.data.loyaltyPoints && res.data.loyaltyPoints > 0) {
          loyaltyMsg = ` You earned ${res.data.loyaltyPoints} loyalty points!`;
        }
        setMessage({ type: 'success', text: `Order placed successfully!${loyaltyMsg}` });
        clearCart();
        setTimeout(() => navigate('/'), 3000);
      } else {
        setMessage({ type: 'error', text: res.data.error || 'Order failed.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server error. Please try again.' });
    }
    setLoading(false);
  };

  return (
    <div className="page-content">
      <div className="checkout-wrapper">
        <div className="progress-bar"><div className="progress"></div></div>
        <div className="checkout-header">
          <h1>Checkout</h1>
        </div>
        <div className="checkout-main">
          <form className="checkout-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <h2>Billing & Shipping Information</h2>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Contact Number</label>
                <input type="text" name="contact" value={formData.contact} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-section">
              <h2>Payment Method</h2>
              <div className="payment-methods">
                <label>
                  <input type="radio" name="payment" value="card" checked={formData.payment === 'card'} onChange={handleChange} /> 
                  Credit/Debit Card
                </label>
                <label>
                  <input type="radio" name="payment" value="cod" checked={formData.payment === 'cod'} onChange={handleChange} /> 
                  Cash on Delivery
                </label>
              </div>
              {formData.payment === 'card' && (
                <div id="cardDetails">
                  <div className="form-group">
                    <label>Card Number</label>
                    <input type="text" id="cardNumber" placeholder="1234 5678 9012 3456" maxLength={19} />
                  </div>
                  <div className="form-group" style={{display:'flex',gap:'1rem'}}>
                    <div style={{flex:1}}>
                      <label>Expiry</label>
                      <input type="text" id="expiry" placeholder="MM/YY" maxLength={5} />
                    </div>
                    <div style={{flex:1}}>
                      <label>CVV</label>
                      <input type="text" id="cvv" placeholder="123" maxLength={4} />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button type="submit" className="place-order-btn" disabled={loading}>
              {loading ? 'Processing...' : 'Place Order'}
            </button>
            {message.text && (
              <div className={message.type === 'success' ? 'success-message' : 'error-message'}>
                {message.text}
              </div>
            )}
          </form>
          <div className="summary-card">
            <h2>Order Summary</h2>
            <div id="cartItems">
              {cart.map(item => (
                <div key={item.ProductID} className="cart-item">
                  <img src={item.image || `https://picsum.photos/seed/${item.ProductID}/80/80`} alt={item.Name} className="cart-item-img" />
                  <span className="cart-item-name">{item.Name}</span>
                  <span className="cart-item-qty">x{item.Quantity}</span>
                  <span className="cart-item-price">${(item.Price * item.Quantity).toFixed(2)}</span>
                </div>
              ))}
              {cart.length === 0 && <p>Your cart is empty.</p>}
            </div>
            <div style={{margin:'1.2rem 0 0.5rem 0'}}>
              <input 
                type="text" 
                id="discountCode" 
                placeholder="Discount code" 
                style={{width:'60%',padding:'0.5rem',borderRadius:'8px',border:'1.5px solid #ddd',fontSize:'1rem'}}
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
              />
              <button 
                type="button" 
                onClick={applyDiscount}
                style={{background:'#1a1a1a',color:'white',padding:'0.5rem 1.2rem',border:'none',borderRadius:'8px',fontWeight:'600',cursor:'pointer',marginLeft:'0.5rem'}}
              >
                Apply
              </button>
              <div id="discountMsg" style={{fontSize:'0.98rem',marginTop:'0.5rem'}}>{discountMsg}</div>
            </div>
            <div className="cart-total">Subtotal: $<span>{subtotal.toFixed(2)}</span></div>
            <div className="cart-total" style={{color:'#f39c12'}}>Sales Tax (18%): $<span>{tax.toFixed(2)}</span></div>
            {discountPercent > 0 && (
              <div className="cart-total" style={{color:'#e74c3c'}}>Discount: -$<span>{discountAmount.toFixed(2)}</span></div>
            )}
            <div className="cart-total" style={{fontSize:'1.2rem'}}>Total: $<span>{total.toFixed(2)}</span></div>
          </div>
        </div>
      </div>

      <style>{`
        .page-content { padding-top: calc(var(--navbar-height) + 2rem); min-height: 100vh; background: var(--color-bg); }
        .checkout-wrapper { max-width: 1000px; margin: 0 auto; background: var(--color-surface); border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); overflow: hidden; }
        .progress-bar { width: 100%; background: var(--color-bg-alt); }
        .progress { height: 6px; background: linear-gradient(90deg, var(--color-primary) 60%, var(--color-accent) 100%); }
        .checkout-header { padding: 2rem; border-bottom: 1px solid var(--color-border-light); }
        .checkout-header h1 { font-size: 1.75rem; color: var(--color-text); font-weight: 600; margin: 0; }
        .checkout-main { display: flex; flex-wrap: wrap; gap: 2rem; padding: 2rem; }
        .checkout-form { flex: 2; min-width: 320px; }
        .summary-card { flex: 1.2; min-width: 280px; background: var(--color-bg-alt); border-radius: var(--radius-lg); padding: 1.5rem; }
        .summary-card h2 { font-size: 1.125rem; color: var(--color-accent); margin-bottom: 1rem; font-weight: 600; }
        .cart-item { display: flex; align-items: center; gap: 1rem; border-bottom: 1px solid var(--color-border-light); padding: 0.75rem 0; }
        .cart-item-img { width: 48px; height: 48px; object-fit: cover; border-radius: var(--radius-md); }
        .cart-item-name { flex: 1; font-weight: 500; color: var(--color-text); font-size: 0.9375rem; }
        .cart-item-qty, .cart-item-price { min-width: 60px; text-align: right; font-size: 0.875rem; }
        .cart-total { text-align: right; font-weight: 700; font-size: 1.25rem; margin-top: 1rem; color: var(--color-accent); }
        .form-section { background: #f8fafd; border-radius: 14px; padding: 2rem 1.5rem 1.5rem; margin-bottom: 2rem; box-shadow: 0 2px 12px rgba(52,152,219,0.07); }
        .form-section h2 { font-size: 1.2rem; color: #1a1a1a; margin-bottom: 1.2rem; font-weight: 600; }
        .form-group { margin-bottom: 1.2rem; }
        .form-group label { display: block; margin-bottom: 0.4rem; color: #34495e; font-weight: 500; }
        .form-group input, .form-group select { width: 100%; padding: 0.7rem; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem; }
        .form-group input:focus { border-color: #1a1a1a; outline: none; }
        .payment-methods { display: flex; gap: 1.5rem; margin-top: 0.5rem; margin-bottom: 1.2rem; }
        .payment-radio { accent-color: #1a1a1a; margin-right: 0.5rem; }
        .place-order-btn { background: linear-gradient(90deg, #1a1a1a 60%, #1a1a1a 100%); color: white; border: none; padding: 1rem 2.5rem; border-radius: 25px; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: background 0.2s; display: block; margin: 2rem auto 0; }
        .place-order-btn:hover { background: #1a1a1a; }
        .place-order-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .success-message { background: #eafaf1; color: #1a1a1a; border: 1.5px solid #1a1a1a; padding: 1.2rem; border-radius: 10px; margin: 2rem 0 0; font-size: 1.1rem; text-align: center; }
        .error-message { background: #fde8e8; color: #e74c3c; border: 1.5px solid #e74c3c; padding: 1.2rem; border-radius: 10px; margin: 2rem 0 0; font-size: 1.1rem; text-align: center; }
        @media (max-width: 900px) { .checkout-main { flex-direction: column; padding: 1.2rem; } .checkout-header { padding: 2rem 1.2rem 1rem; } }
      `}</style>
    </div>
  );
}

export default Checkout;
