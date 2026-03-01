import { useState } from 'react';

function CustomerSupport() {
  const [messages, setMessages] = useState([
    { text: 'Hello! How can we help you today?', isUser: false }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const newMessages = [...messages, { text: input, isUser: true }];
    setMessages(newMessages);
    setInput('');
    
    setTimeout(() => {
      setMessages(prev => [...prev, { text: 'Thank you for your message! Our support team will get back to you soon.', isUser: false }]);
    }, 1000);
  };

  const toggleFAQ = (e) => {
    const ans = e.target.nextElementSibling;
    ans.style.display = ans.style.display === 'block' ? 'none' : 'block';
  };

  return (
    <div className="page-content">
      <div className="page-container">
        <div className="page-card">
          <h1 className="support-title">Customer Support</h1>
          <div className="support-flex">
            <div className="support-chat">
              <h2>Live Chat</h2>
              <div className="chat-box">
                {messages.map((msg, i) => (
                  <div key={i} className={`chat-message ${msg.isUser ? 'user' : ''}`}>
                    <div className="chat-bubble">{msg.text}</div>
                  </div>
                ))}
              </div>
              <form className="chat-input-row" onSubmit={handleSend}>
                <input 
                  type="text" 
                  className="chat-input" 
                  placeholder="Type your message..." 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  required 
                />
                <button type="submit" className="chat-send-btn">Send</button>
              </form>
            </div>
            <div className="support-faq">
              <h2>Quick FAQ</h2>
              <div className="faq-item">
                <div className="faq-question" onClick={toggleFAQ}>How do I track my order?</div>
                <div className="faq-answer">You can track your order from your account dashboard under 'Orders'.</div>
              </div>
              <div className="faq-item">
                <div className="faq-question" onClick={toggleFAQ}>How do I return a product?</div>
                <div className="faq-answer">Go to your orders, select the product, and click 'Return'. Follow the instructions provided.</div>
              </div>
              <div className="faq-item">
                <div className="faq-question" onClick={toggleFAQ}>How can I contact support?</div>
                <div className="faq-answer">You can use this chat or email us at support@example.com.</div>
              </div>
              <div className="faq-item">
                <div className="faq-question" onClick={toggleFAQ}>What payment methods are accepted?</div>
                <div className="faq-answer">We accept credit/debit cards, PayPal, and UPI.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .page-content { padding-top: calc(var(--navbar-height) + 2rem); min-height: 100vh; background: var(--color-bg); }
        .page-container { max-width: 900px; margin: 0 auto; padding: 2rem 2rem 4rem; }
        .page-card { background: var(--color-surface); border-radius: var(--radius-xl); padding: 2.5rem; box-shadow: var(--shadow-sm); }
        .support-title { font-size: 2rem; font-weight: 600; color: var(--color-text); margin-bottom: 2rem; text-align: center; }
        .support-flex { display: flex; gap: 2rem; flex-wrap: wrap; }
        .support-chat, .support-faq {
          flex: 1 1 300px;
          min-width: 280px;
          background: var(--color-bg-alt);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
        }
        .support-chat h2, .support-faq h2 {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--color-accent);
          margin-bottom: 1rem;
        }
        .chat-box {
          background: var(--color-surface);
          border-radius: var(--radius-md);
          min-height: 180px;
          max-height: 250px;
          overflow-y: auto;
          margin-bottom: 1rem;
          padding: 1rem;
          border: 1px solid var(--color-border-light);
        }
        .chat-message {
          margin-bottom: 0.75rem;
          display: flex;
          align-items: flex-start;
        }
        .chat-message.user {
          justify-content: flex-end;
        }
        .chat-bubble {
          background: var(--color-primary);
          color: #fff;
          padding: 0.625rem 1rem;
          border-radius: 18px;
          max-width: 70%;
          font-size: 0.9375rem;
        }
        .chat-message.user .chat-bubble {
          background: var(--color-accent);
        }
        .chat-input-row {
          display: flex;
          gap: 0.5rem;
        }
        .chat-input {
          flex: 1;
          padding: 0.625rem 1rem;
          border-radius: var(--radius-full);
          border: 1px solid var(--color-border);
          font-size: 0.9375rem;
          background: var(--color-surface);
        }
        .chat-input:focus {
          outline: none;
          border-color: var(--color-primary);
        }
        .chat-send-btn {
          background: var(--color-primary);
          color: #fff;
          border: none;
          border-radius: var(--radius-full);
          padding: 0.625rem 1.25rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
        }
        .chat-send-btn:hover {
          background: var(--color-primary-dark);
        }
        .faq-item {
          margin-bottom: 1rem;
        }
        .faq-question {
          font-weight: 500;
          color: var(--color-text);
          cursor: pointer;
          margin-bottom: 0.25rem;
        }
        .faq-answer {
          color: var(--color-text-secondary);
          display: none;
          margin-left: 1rem;
          font-size: 0.9375rem;
        }
        @media (max-width: 900px) {
          .support-flex {
            flex-direction: column;
          }
        }
        @media (max-width: 600px) {
          .support-container {
            padding: 0.5rem;
          }
          .support-chat, .support-faq {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
}

export default CustomerSupport;
