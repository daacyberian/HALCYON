import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function Exchange() {
  const { user } = useAuth();
  const [orderItems, setOrderItems] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState('');
  const [exchangeReason, setExchangeReason] = useState('');
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [exchangeRequests, setExchangeRequests] = useState([]);

  useEffect(() => {
    if (user?.email) {
      loadOrderItems();
      loadExchangeRequests();
    }
  }, [user]);

  const loadOrderItems = async () => {
    try {
      const res = await axios.get(`https://ecom-backend-alpha-rust.vercel.app/orderitems/by-customer?email=${encodeURIComponent(user.email)}`);
      const items = Array.isArray(res.data) ? res.data : [];
      setOrderItems(items);
      if (items.length === 0) {
        setMsg({ text: 'No orders found', type: 'error' });
      }
    } catch (e) {
      setMsg({ text: 'Failed to load orders', type: 'error' });
    }
  };

  const loadExchangeRequests = async () => {
    if (!user?.CustomerID) return;
    try {
      const res = await axios.get(`https://ecom-backend-alpha-rust.vercel.app/exchange/by-customer?customerId=${user.CustomerID}`);
      setExchangeRequests(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const [orderItemId, productId] = selectedOrder.split('|');
    if (!orderItemId || !productId || !exchangeReason.trim()) {
      setMsg({ text: 'Please select a product and enter a reason.', type: 'error' });
      return;
    }

    try {
      const res = await axios.post('https://ecom-backend-alpha-rust.vercel.app/exchange/request', {
        orderItemId, productId, reason: exchangeReason, customerId: user.CustomerID
      });
      setMsg({ text: res.data.message || res.data.error, type: res.data.message ? 'success' : 'error' });
      if (res.data.message) {
        setExchangeReason('');
        loadExchangeRequests();
      }
    } catch (e) {
      setMsg({ text: 'Server error.', type: 'error' });
    }
  };

  if (!user) {
    return (
      <div className="page-content">
        <div className="page-container">
          <div className="page-card">
            <div className="msg error">Please log in to request an exchange.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="page-container">
        <div className="page-card">
          <h1 className="page-title">Request Product Exchange</h1>
          <form onSubmit={handleSubmit}>
            <div>
              <label className="form-label">Select Product/Order</label>
              <select 
                className="form-select" 
                value={selectedOrder}
                onChange={(e) => setSelectedOrder(e.target.value)}
              >
                <option value="">Select an order</option>
                {orderItems.map(item => (
                  <option key={item.OrderItemID} value={`${item.OrderItemID}|${item.ProductID}`}>
                    {item.ProductName} (Qty: {item.Quantity})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Reason for Exchange</label>
              <textarea 
                className="form-textarea" 
                placeholder="Describe the reason for exchange..."
                value={exchangeReason}
                onChange={(e) => setExchangeReason(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary">Submit Exchange Request</button>
            <div className={`msg ${msg.type}`}>{msg.text}</div>
          </form>
          
          <div className="exchange-list">
            <h2 className="section-subtitle">Your Previous Exchange Requests</h2>
            {exchangeRequests.length === 0 ? (
              <p>No previous exchange requests.</p>
            ) : (
              exchangeRequests.map((r, i) => (
                <div key={i} className="exchange-item">
                  <div><b>Product:</b> {r.ProductName || r.ProductID}</div>
                  <div><b>Reason:</b> {r.ExchangeReason}</div>
                  <div><b>Date:</b> {r.ExchangeDate || ''}</div>
                  <div className={`exchange-status status-${r.Status?.toLowerCase()}`}>
                    <b>Status:</b> {r.Status}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
        .page-content { padding-top: calc(var(--navbar-height) + 2rem); min-height: 100vh; background: var(--color-bg); }
        .page-container { max-width: 600px; margin: 0 auto; padding: 2rem 2rem 4rem; }
        .page-card { background: var(--color-surface); border-radius: var(--radius-xl); padding: 2.5rem; box-shadow: var(--shadow-sm); }
        .page-title { font-size: 1.75rem; font-weight: 600; color: var(--color-text); margin-bottom: 2rem; }
        .form-label { display: block; margin-bottom: 0.5rem; font-weight: 500; color: var(--color-text); }
        .form-select, .form-textarea { width: 100%; padding: 0.75rem; margin-bottom: 1rem; border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: 0.9375rem; }
        .form-textarea { min-height: 100px; resize: vertical; }
        .msg { margin-top: 1rem; font-weight: 500; }
        .msg.success { color: var(--color-success); }
        .msg.error { color: var(--color-error); }
        .exchange-list { margin-top: 2.5rem; }
        .section-subtitle { font-size: 1.25rem; font-weight: 600; color: var(--color-text); margin-bottom: 1rem; }
        .exchange-item { background: var(--color-bg-alt); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1rem; }
        .exchange-status { font-weight: 600; margin-top: 0.5rem; }
        .status-pending { color: var(--color-warning); }
        .status-approved { color: var(--color-success); }
        .status-rejected { color: var(--color-error); }
      `}</style>
    </div>
  );
}

export default Exchange;
