import { useState } from 'react';
import axios from 'axios';

function Return() {
  const [email, setEmail] = useState('');
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState('');
  const [reason, setReason] = useState('');
  const [msg, setMsg] = useState('');
  const [showOrderSelect, setShowOrderSelect] = useState(false);

  const loadOrders = async () => {
    if (!email) {
      setMsg('Enter your email first!');
      return;
    }
    try {
      const res = await axios.get(`https://ecom-backend-alpha-rust.vercel.app/orderitems/by-customer?email=${encodeURIComponent(email)}`);
      if (res.ok === false) {
        setMsg(res.data.error || 'Failed to load orders.');
        setShowOrderSelect(false);
        return;
      }
      const items = Array.isArray(res.data) ? res.data : [];
      if (items.length === 0) {
        setMsg('No orders found for this email.');
        setShowOrderSelect(false);
        return;
      }
      setOrders(items);
      setShowOrderSelect(true);
      setMsg('');
    } catch (e) {
      setMsg('Network or server error.');
      setShowOrderSelect(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const [orderItemId, paymentId] = selectedOrder.split('|');
    try {
      const res = await axios.post('https://ecom-backend-alpha-rust.vercel.app/return/request', {
        orderItemId, paymentId, email, reason
      });
      setMsg(res.data.message || res.data.error);
      if (res.data.message) {
        setSelectedOrder('');
        setReason('');
        setShowOrderSelect(false);
      }
    } catch (e) {
      setMsg('Server error.');
    }
  };

  return (
    <div className="page-content">
      <div className="page-container">
        <div className="page-card">
          <h1 className="page-title">Request a Product Return</h1>
          <form onSubmit={handleSubmit}>
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-input" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{marginBottom:'1rem',width:'100%'}}
              onClick={loadOrders}
            >
              Load My Orders
            </button>
            {showOrderSelect && (
              <>
                <label className="form-label">Order Item</label>
                <select 
                  className="form-select" 
                  value={selectedOrder}
                  onChange={(e) => setSelectedOrder(e.target.value)}
                  required
                >
                  <option value="">Select an order</option>
                  {orders.map(item => (
                    <option key={item.OrderItemID} value={`${item.OrderItemID}|${item.PaymentID}`}>
                      {item.ProductName} | OrderItemID: {item.OrderItemID} | Subtotal: ${item.Subtotal?.toFixed(2)}
                    </option>
                  ))}
                </select>
                <label className="form-label">Reason for Return</label>
                <textarea 
                  className="form-textarea" 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-primary" style={{width:'100%'}}>Request Return</button>
              </>
            )}
          </form>
          <div id="returnMsg" className={msg.includes('success') || msg.includes('Successfully') ? 'success' : 'error'} style={{marginTop:'1rem',fontWeight:500}}>
            {msg}
          </div>
        </div>
      </div>

      <style>{`
        .page-content { padding-top: calc(var(--navbar-height) + 2rem); min-height: 100vh; background: var(--color-bg); }
        .page-container { max-width: 500px; margin: 0 auto; padding: 2rem 2rem 4rem; }
        .page-card { background: var(--color-surface); border-radius: var(--radius-xl); padding: 2.5rem; box-shadow: var(--shadow-sm); }
        .page-title { font-size: 1.75rem; font-weight: 600; color: var(--color-text); margin-bottom: 2rem; }
        .form-label { display: block; margin-bottom: 0.5rem; font-weight: 500; color: var(--color-text); }
        .form-input, .form-select, .form-textarea { width: 100%; padding: 0.75rem; margin-bottom: 1rem; border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: 0.9375rem; }
        .form-textarea { min-height: 100px; resize: vertical; }
        .success { color: var(--color-success); }
        .error { color: var(--color-error); }
      `}</style>
    </div>
  );
}

export default Return;
