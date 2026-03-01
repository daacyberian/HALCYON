import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product, category }) => {
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('wishlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [showWishlistMsg, setShowWishlistMsg] = useState(false);

  const isInWishlist = wishlist.includes(product.ProductID);

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart(product.ProductID, product.Name, product.Price, 1);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    let newWishlist;
    if (isInWishlist) {
      newWishlist = wishlist.filter(id => id !== product.ProductID);
    } else {
      newWishlist = [...wishlist, product.ProductID];
    }
    
    setWishlist(newWishlist);
    localStorage.setItem('wishlist', JSON.stringify(newWishlist));
    
    setShowWishlistMsg(true);
    setTimeout(() => setShowWishlistMsg(false), 2000);
  };

  return (
    <Link to={`/product/${product.ProductID}`} className="product-card">
      <div className="product-image-wrapper">
        {product.Discount ? (
          <span className="product-badge sale">Sale</span>
        ) : (
          <span className="product-badge new">New</span>
        )}
        
        <img
          src={product.image || `https://picsum.photos/seed/${product.ProductID}/400/500`}
          alt={product.Name}
          className="product-image"
        />
        
        <button 
          className={`wishlist-btn ${isInWishlist ? 'active' : ''}`} 
          onClick={handleWishlist}
          style={isInWishlist ? { color: '#ef4444', opacity: 1, transform: 'translateY(0)' } : {}}
        >
          <Heart size={18} fill={isInWishlist ? '#ef4444' : 'none'} />
        </button>
        
        <button className="quick-add-btn" onClick={handleQuickAdd}>
          Quick Add
        </button>
      </div>
      
      <div className="product-info">
        <span className="product-category">{category || 'Product'}</span>
        <h3 className="product-title">{product.Name}</h3>
        <div className="product-price">
          <span className="product-current-price">${product.Price?.toFixed(2)}</span>
          {product.Discount && (
            <span className="product-original-price">
              ${(product.Price * 1.2).toFixed(2)}
            </span>
          )}
        </div>
      </div>

      {showWishlistMsg && (
        <div className="toast show" style={{bottom: '80px'}}>
          {isInWishlist ? 'Added to wishlist!' : 'Removed from wishlist'}
        </div>
      )}
    </Link>
  );
};

export default ProductCard;
