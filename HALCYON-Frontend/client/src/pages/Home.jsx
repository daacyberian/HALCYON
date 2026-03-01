import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getCategories, getSubcategories, getProducts } from '../services/api';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery] = useState(searchParams.get('search') || '');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, subRes, prodRes] = await Promise.all([
          getCategories(),
          getSubcategories(),
          getProducts(),
        ]);
        
        setCategories(catRes.data || []);
        setSubcategories(subRes.data || []);
        setProducts(prodRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getFilteredProducts = () => {
    let filtered = products;
    
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.Name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.Description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (activeCategory !== 'all') {
      const categorySubcats = subcategories.filter(
        sub => sub.CategoryID === Number(activeCategory)
      );
      const subCategoryIds = categorySubcats.map(s => s.SubCategoryID);
      filtered = filtered.filter(p => 
        subCategoryIds.includes(p.SubCategoryID)
      );
    }
    
    return filtered;
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.CategoryID === categoryId);
    return category?.Name || 'Product';
  };

  const filteredProducts = getFilteredProducts();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to HALCYON</h1>
          <p className="hero-subtitle">Discover the latest trends in fashion and style. Shop now for exclusive collections.</p>
          <a href="#products" className="hero-btn">Shop Now</a>
        </div>
      </section>

      {/* Featured Products */}
      <section className="products-section">
        <div className="section-header">
          <h2 className="section-title">Featured Products</h2>
        </div>
        <div className="products-grid" id="products">
          {products.slice(0, 8).map(product => (
            <ProductCard
              key={product.ProductID}
              product={product}
              category={getCategoryName(product.SubCategoryID)}
            />
          ))}
        </div>
      </section>

      {/* Category Navigation */}
      <div className="category-nav">
        <button
          className={`category-btn ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          All
        </button>
        {categories.map(category => (
          <button
            key={category.CategoryID}
            className={`category-btn ${activeCategory === category.CategoryID ? 'active' : ''}`}
            onClick={() => setActiveCategory(category.CategoryID)}
          >
            {category.Name}
          </button>
        ))}
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div className="section-header">
          <h2 className="section-title">Search Results for "{searchQuery}"</h2>
        </div>
      )}

      {/* Products Grid */}
      {activeCategory === 'all' ? (
        categories.map(category => {
          const categorySubcats = subcategories.filter(
            sub => sub.CategoryID === category.CategoryID
          );
          const categoryProducts = products.filter(product =>
            categorySubcats.some(sub => product.SubCategoryID === sub.SubCategoryID)
          );

          if (categoryProducts.length === 0) return null;

          return (
            <section key={category.CategoryID} className="products-section">
              <div className="section-header">
                <h2 className="section-title">{category.Name}</h2>
                <a href="#" className="view-all-link">View All →</a>
              </div>
              <div className="products-grid" id="products">
                {categoryProducts.slice(0, 4).map(product => (
                  <ProductCard
                    key={product.ProductID}
                    product={product}
                    category={category.Name}
                  />
                ))}
              </div>
            </section>
          );
        })
      ) : (
        <section className="products-section">
          <div className="section-header">
            <h2 className="section-title">
              {categories.find(c => c.CategoryID === Number(activeCategory))?.Name}
            </h2>
          </div>
          <div className="products-grid" id="products">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.ProductID}
                product={product}
                category={getCategoryName(product.SubCategoryID)}
              />
            ))}
          </div>
        </section>
      )}

      {/* No Results */}
      {filteredProducts.length === 0 && searchQuery && (
        <div className="no-results">
          <p>No products found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default Home;
