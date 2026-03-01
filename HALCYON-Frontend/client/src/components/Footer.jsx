import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-section">
          <h4>Shop</h4>
          <ul className="footer-links">
            <li><Link to="/">New Arrivals</Link></li>
            <li><Link to="/">Best Sellers</Link></li>
            <li><Link to="/">Sale</Link></li>
            <li><Link to="/">Collections</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Customer Service</h4>
          <ul className="footer-links">
            <li><Link to="/support">Contact Us</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/">Shipping</Link></li>
            <li><Link to="/return">Returns</Link></li>
            <li><Link to="/exchange">Exchange</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Company</h4>
          <ul className="footer-links">
            <li><Link to="/">About Us</Link></li>
            <li><Link to="/blogs">Blog</Link></li>
            <li><Link to="/">Careers</Link></li>
            <li><Link to="/">Press</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Connect</h4>
          <ul className="footer-links">
            <li><a href="#">Instagram</a></li>
            <li><a href="#">Twitter</a></li>
            <li><a href="#">Facebook</a></li>
            <li><a href="#">Pinterest</a></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p className="footer-copyright">© 2025 HALCYON. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
