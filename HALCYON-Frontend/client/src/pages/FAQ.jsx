import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

const faqs = [
  {
    question: 'How do I place an order?',
    answer: "Browse products, add them to your cart, and proceed to checkout. It's that simple!"
  },
  {
    question: 'What payment methods are accepted?',
    answer: 'We accept all major credit/debit cards, PayPal, and cash on delivery for your convenience.'
  },
  {
    question: 'How can I track my order?',
    answer: "Go to your dashboard and view your recent orders for tracking information and status updates."
  },
  {
    question: 'What is your return policy?',
    answer: 'We offer a 30-day return policy for all eligible items. Visit our Returns page for more details.'
  },
  {
    question: 'How do I contact support?',
    answer: 'Email us at support@halcyon.com or use the live chat on our website.'
  }
];

function FAQ() {
  return (
    <div className="page-content">
      <div className="page-container">
        <div className="page-card">
          <h1 className="page-title">Frequently Asked Questions</h1>
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <div className="faq-question">{faq.question}</div>
              <div className="faq-answer">{faq.answer}</div>
            </div>
          ))}
        </div>
      </div>
      <Link to="/support" className="floating-support-btn" title="Customer Support" style={{
        position: 'fixed',
        bottom: '32px',
        right: '32px',
        background: '#1a1a1a',
        color: '#fff',
        borderRadius: '50%',
        width: '60px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2rem',
        boxShadow: '0 4px 16px rgba(52,152,219,0.2)',
        zIndex: 2000,
        cursor: 'pointer',
        textDecoration: 'none'
      }}>
        <MessageCircle size={28} />
      </Link>
      <style>{`
        .page-content { padding-top: calc(var(--navbar-height) + 2rem); min-height: 100vh; background: var(--color-bg); }
        .page-container { max-width: 800px; margin: 0 auto; padding: 2rem 2rem 4rem; }
        .page-card { background: var(--color-surface); border-radius: var(--radius-xl); padding: 2.5rem; box-shadow: var(--shadow-sm); }
        .page-title { font-size: 2rem; font-weight: 600; color: var(--color-text); margin-bottom: 2rem; }
        .faq-item { margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--color-border-light); }
        .faq-item:last-child { border-bottom: none; }
        .faq-question { font-weight: 600; color: var(--color-text); margin-bottom: 0.75rem; font-size: 1.1rem; }
        .faq-answer { color: var(--color-text-secondary); line-height: 1.7; }
      `}</style>
    </div>
  );
}

export default FAQ;
