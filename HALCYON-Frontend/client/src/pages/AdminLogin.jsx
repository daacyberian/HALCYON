import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('https://ecom-backend-alpha-rust.vercel.app/auth/admin-login', {
        email,
        password
      });
      
      if (res.data.token) {
        localStorage.setItem('adminToken', res.data.token);
        navigate('/admin');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid admin credentials');
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="admin-login-container">
        <h1>Admin Login</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter admin email"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="back-to-home">
          <Link to="/">← Back to Store</Link>
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #1a1a1a 0%, #333 100%);
          padding: 2rem;
        }
        .admin-login-container {
          background: var(--color-surface);
          padding: 2.5rem;
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-xl);
          width: 90%;
          max-width: 400px;
        }
        .admin-login-container h1 {
          text-align: center;
          margin-bottom: 2rem;
          font-size: 1.75rem;
          font-weight: 600;
        }
        .form-group {
          margin-bottom: 1.5rem;
        }
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: var(--color-text);
        }
        .form-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          font-size: 0.9375rem;
        }
        .form-input:focus {
          outline: none;
          border-color: var(--color-primary);
        }
        .btn-primary {
          width: 100%;
          padding: 0.875rem;
          background: var(--color-primary);
          color: white;
          border: none;
          border-radius: var(--radius-full);
          font-weight: 500;
          cursor: pointer;
          font-size: 1rem;
          transition: background 0.2s;
        }
        .btn-primary:hover {
          background: var(--color-primary-dark);
        }
        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .error-message {
          color: var(--color-error);
          text-align: center;
          margin-bottom: 1rem;
          padding: 0.75rem;
          background: #fef2f2;
          border-radius: var(--radius-md);
          font-size: 0.875rem;
        }
        .back-to-home {
          text-align: center;
          margin-top: 1.5rem;
        }
        .back-to-home a {
          color: var(--color-accent);
          text-decoration: none;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;
