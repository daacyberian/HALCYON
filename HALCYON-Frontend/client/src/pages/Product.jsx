import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById, getReviews } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Heart, ArrowLeft, Star } from 'lucide-react';

const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('wishlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [showWishlistMsg, setShowWishlistMsg] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();

  const isInWishlist = wishlist.includes(product?.ProductID);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const [productRes, reviewsRes] = await Promise.all([
          getProductById(id),
          getReviews(id),
        ]);
        setProduct(productRes.data);
        setReviews(reviewsRes.data || []);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    setAddingToCart(true);
    await addToCart(product.ProductID, product.Name, product.Price, 1);
    setAddingToCart(false);
  };

  const handleAddToWishlist = () => {
    let newWishlist;
    if (isInWishlist) {
      newWishlist = wishlist.filter(wId => wId !== product.ProductID);
    } else {
      newWishlist = [...wishlist, product.ProductID];
    }
    setWishlist(newWishlist);
    localStorage.setItem('wishlist', JSON.stringify(newWishlist));
    setShowWishlistMsg(true);
    setTimeout(() => setShowWishlistMsg(false), 2000);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedRating || !reviewText) {
      alert('Please provide rating and review');
      return;
    }
    alert('Review submitted!');
    setSelectedRating(0);
    setReviewText('');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container">
        <div className="product-not-found">
          <h2>Product not found</h2>
          <Link to="/" className="btn btn-primary">Back to Store</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="page-container">
        <Link to="/" className="back-link">
          <ArrowLeft size={20} />
          Back to Store
        </Link>
        
        <div className="product-detail-grid">
          <div className="product-detail-image">
            <img
              src={product.image || `https://picsum.photos/seed/${product.ProductID}/400/500`}
              alt={product.Name}
            />
          </div>
          
          <div className="product-detail-info">
            <h1 className="product-detail-title">{product.Name}</h1>
            <div className="product-detail-price">${product.Price?.toFixed(2)}</div>
            <p className="product-detail-desc">{product.Description}</p>
            
            <div className="product-meta-item">
              <strong>Stock:</strong> {product.Stock || 'Available'}
            </div>
            
            {product.Discount && (
              <div className="product-meta-item">
                <strong>Discount:</strong> {product.Discount}%
              </div>
            )}
            
            <div className="product-detail-actions">
              <button
                className="btn btn-primary"
                onClick={handleAddToCart}
                disabled={addingToCart}
              >
                <ShoppingCart size={18} />
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
              <button 
                className={`btn ${isInWishlist ? 'btn-primary' : 'btn-secondary'}`} 
                onClick={handleAddToWishlist}
                style={isInWishlist ? {background: '#ef4444'} : {}}
              >
                <Heart size={18} fill={isInWishlist ? 'white' : 'none'} />
                {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="reviews-section">
          <h2 className="reviews-title">Customer Reviews</h2>
          
          {reviews.length > 0 ? (
            <div className="reviews-list">
              {reviews.map((review, index) => (
                <div key={index} className="review-card">
                  <div className="review-header">
                    <span className="review-author">
                      {review.CustomerName || 'Anonymous'}
                    </span>
                    <span className="review-rating">
                      {'★'.repeat(review.Rating)}{'☆'.repeat(5 - review.Rating)}
                    </span>
                  </div>
                  <p className="review-text">{review.Review}</p>
                  {review.Date && (
                    <span className="review-date">{review.Date}</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="no-reviews">No reviews yet.</p>
          )}

          {/* Review Form */}
          {user ? (
            <form className="review-form" onSubmit={handleSubmitReview}>
              <h3>Write a Review</h3>
              <div className="rating-input">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-btn ${star <= selectedRating ? 'active' : ''}`}
                    onClick={() => setSelectedRating(star)}
                  >
                    <Star size={24} fill={star <= selectedRating ? '#c9a959' : 'none'} />
                  </button>
                ))}
              </div>
              <textarea
                placeholder="Write your review..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary">Submit Review</button>
            </form>
          ) : (
            <p className="login-to-review">Please login to leave a review.</p>
          )}
        </section>
      </div>

      {showWishlistMsg && (
        <div className="toast show">
          {isInWishlist ? 'Removed from wishlist!' : 'Added to wishlist!'}
        </div>
      )}

      <style>{`
        .product-meta-item {
          margin-bottom: 0.5rem;
          color: var(--color-text-secondary);
        }
      `}</style>
    </div>
  );
};

export default Product;
