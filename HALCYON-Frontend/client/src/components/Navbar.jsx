import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Heart, ShoppingCart, User, Menu, X, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Welcome to HALCYON! Get 20% off on your first order.', read: false },
    { id: 2, text: 'New arrivals are now available!', read: false },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleWishlistClick = () => {
    setWishlistOpen(!wishlistOpen);
    setNotificationOpen(false);
  };

  const handleNotificationClick = () => {
    setNotificationOpen(!notificationOpen);
    setWishlistOpen(false);
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-brand">
          <img src="/bird.png" alt="HALCYON" />
          <span className="navbar-brand-text">HALCYON</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-nav">
          <Link to="/" className="nav-link">Shop</Link>
          <Link to="/" className="nav-link">Collections</Link>
          <Link to="/blogs" className="nav-link">Blog</Link>
          <Link to="/faq" className="nav-link">FAQ</Link>
        </div>

        {/* Search Bar */}
        <form className="search-bar" onSubmit={handleSearch}>
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* Actions */}
        <div className="navbar-actions">
          {/* Notifications */}
          <div className="notification-container">
            <button className="icon-btn" title="Notifications" onClick={handleNotificationClick}>
              <Bell size={20} />
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>
            
            {notificationOpen && (
              <div className="dropdown-menu notification-dropdown">
                <div className="dropdown-header">
                  <span>Notifications</span>
                  {unreadCount > 0 && <button onClick={markAllRead}>Mark all read</button>}
                </div>
                <div className="dropdown-content">
                  {notifications.map(n => (
                    <div key={n.id} className={`notification-item ${!n.read ? 'unread' : ''}`}>
                      {n.text}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Loyalty Points */}
          <button className="icon-btn" title="Loyalty Points">
            <Star size={20} />
          </button>
          
          {/* Wishlist */}
          <div className="wishlist-container">
            <button className="icon-btn" title="Wishlist" onClick={handleWishlistClick}>
              <Heart size={20} />
              {wishlist.length > 0 && <span className="wishlist-badge">{wishlist.length}</span>}
            </button>
            
            {wishlistOpen && (
              <div className="dropdown-menu wishlist-dropdown">
                <div className="dropdown-header">
                  <span>My Wishlist ({wishlist.length})</span>
                </div>
                <div className="dropdown-content">
                  {wishlist.length === 0 ? (
                    <div className="empty-wishlist">Your wishlist is empty</div>
                  ) : (
                    wishlist.map(id => (
                      <div key={id} className="wishlist-item">
                        Product ID: {id}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          
          <Link to="/cart" className="cart-btn">
            <ShoppingCart size={16} />
            <span>Cart ({cartCount})</span>
          </Link>

          {user ? (
            <div className="user-menu">
              <button className="user-avatar" onClick={handleLogout}>
                <User size={16} />
                <span>{user.Name || user.FirstName || 'Account'}</span>
              </button>
            </div>
          ) : (
            <Link to="/login" className="user-avatar">
              <User size={16} />
              <span>Login</span>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu active">
          <form className="mobile-search" onSubmit={handleSearch}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          <Link to="/" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
            Shop
          </Link>
          <Link to="/" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
            Collections
          </Link>
          <Link to="/blogs" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
            Blog
          </Link>
          <Link to="/faq" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
            FAQ
          </Link>
          <Link to="/cart" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
            Cart ({cartCount})
          </Link>
          {user ? (
            <button className="mobile-nav-link" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <Link to="/login" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              Login
            </Link>
          )}
        </div>
      )}

      <style>{`
        .notification-container, .wishlist-container {
          position: relative;
        }
        .notification-badge, .wishlist-badge {
          position: absolute;
          top: 2px;
          right: 2px;
          background: #ef4444;
          color: white;
          font-size: 0.65rem;
          padding: 2px 5px;
          border-radius: 10px;
          min-width: 16px;
          text-align: center;
        }
        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          min-width: 280px;
          z-index: 1000;
          margin-top: 8px;
          overflow: hidden;
        }
        .dropdown-header {
          padding: 1rem;
          border-bottom: 1px solid #eee;
          font-weight: 600;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .dropdown-header button {
          background: none;
          border: none;
          color: #c9a959;
          font-size: 0.8rem;
          cursor: pointer;
        }
        .dropdown-content {
          max-height: 300px;
          overflow-y: auto;
        }
        .notification-item {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #f5f5f5;
          font-size: 0.875rem;
          color: #666;
        }
        .notification-item.unread {
          background: #fafafa;
          font-weight: 500;
        }
        .empty-wishlist {
          padding: 2rem;
          text-align: center;
          color: #999;
        }
        .wishlist-item {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #f5f5f5;
          font-size: 0.875rem;
        }
        
        /* Mobile Styles */
        @media (max-width: 768px) {
          .notification-container, .wishlist-container, .star {
            display: none;
          }
          .mobile-menu-btn {
            display: flex;
          }
          .cart-btn {
            padding: 0.5rem 0.75rem;
          }
          .cart-btn span {
            display: none;
          }
          .user-avatar span {
            display: none;
          }
        }
        
        @media (max-width: 480px) {
          .navbar-brand-text {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
