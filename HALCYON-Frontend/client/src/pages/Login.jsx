import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [success, setSuccess] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (isRegister) {
      const result = await register({
        FirstName: name.split(' ')[0] || '',
        LastName: name.split(' ').slice(1).join(' ') || '',
        Email: email,
        Password: password,
        Contact: contact,
        Address: address
      });
      
      if (result.success) {
        setSuccess('Registration successful!');
        setTimeout(() => navigate('/'), 1500);
      } else {
        setError(result.error);
      }
    } else {
      const result = await login(email, password);
      
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error);
      }
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-content">
          <h2>{isRegister ? 'Register' : 'Login'}</h2>
          
          {error && <div className="error-msg">{error}</div>}
          {success && <div className="success-msg">{success}</div>}
          
          <form onSubmit={handleSubmit}>
            {isRegister && (
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required={isRegister}
                />
              </div>
            )}
            
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            {isRegister && (
              <>
                <div className="form-group">
                  <label>Contact Number</label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="Enter your contact number"
                    required={isRegister}
                  />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your address"
                    required={isRegister}
                  />
                </div>
              </>
            )}
            
            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? (isRegister ? 'Registering...' : 'Logging in...') : (isRegister ? 'Register' : 'Login')}
            </button>
            
            {!isRegister && (
              <button type="button" className="cancel-btn" onClick={() => navigate('/')}>
                Cancel
              </button>
            )}
          </form>
          
          <p className="register-link">
            {isRegister ? (
              <>Already have an account? <Link to="#" onClick={() => { setIsRegister(false); setError(''); setSuccess(''); }}>Login here</Link></>
            ) : (
              <>Don't have an account? <Link to="#" onClick={() => { setIsRegister(true); setError(''); setSuccess(''); }}>Register here</Link></>
            )}
          </p>
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
        .login-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 2rem;
          width: 90%;
          max-width: 400px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        .login-content {
          text-align: center;
        }
        .login-content h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          color: #1a1a1a;
        }
        .form-group {
          margin-bottom: 1.25rem;
          text-align: left;
        }
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #1a1a1a;
        }
        .form-group input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #e8e8e8;
          border-radius: 8px;
          font-size: 0.9375rem;
          transition: border-color 0.2s;
        }
        .form-group input:focus {
          outline: none;
          border-color: #1a1a1a;
        }
        .login-submit {
          width: 100%;
          padding: 0.875rem;
          background: #1a1a1a;
          color: white;
          border: none;
          border-radius: 9999px;
          font-weight: 500;
          cursor: pointer;
          font-size: 1rem;
          margin-top: 0.5rem;
          transition: background 0.2s;
        }
        .login-submit:hover {
          background: #000000;
        }
        .login-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .cancel-btn {
          width: 100%;
          padding: 0.875rem;
          background: #ffffff;
          color: #1a1a1a;
          border: 1px solid #e8e8e8;
          border-radius: 9999px;
          font-weight: 500;
          cursor: pointer;
          font-size: 1rem;
          margin-top: 0.75rem;
          transition: all 0.2s;
        }
        .cancel-btn:hover {
          border-color: #1a1a1a;
        }
        .error-msg {
          color: #ef4444;
          margin-bottom: 1rem;
          padding: 0.75rem;
          background: #fef2f2;
          border-radius: 8px;
          font-size: 0.875rem;
          text-align: left;
        }
        .success-msg {
          color: #059669;
          margin-bottom: 1rem;
          padding: 0.75rem;
          background: #ecfdf5;
          border-radius: 8px;
          font-size: 0.875rem;
          text-align: left;
        }
        .register-link {
          margin-top: 1.25rem;
          text-align: center;
          font-size: 0.875rem;
        }
        .register-link a {
          color: #c9a959;
          font-weight: 500;
          text-decoration: none;
        }
      `}</style>
    </div>
  );
};

export default Login;
