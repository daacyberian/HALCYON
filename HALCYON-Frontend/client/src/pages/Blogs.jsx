import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

const blogs = [
  {
    id: 1,
    title: "The Latest Fashion Trends for 2024",
    category: "fashion",
    date: "March 15, 2024",
    author: "Sarah Johnson",
    image: "https://picsum.photos/seed/blog1/800/400",
    excerpt: "Discover the hottest fashion trends that will dominate 2024. From sustainable fashion to bold patterns, we've got you covered."
  },
  {
    id: 2,
    title: "Sustainable Living: A Complete Guide",
    category: "lifestyle",
    date: "March 10, 2024",
    author: "Michael Chen",
    image: "https://picsum.photos/seed/blog2/800/400",
    excerpt: "Learn how to incorporate sustainable practices into your daily life and make a positive impact on the environment."
  },
  {
    id: 3,
    title: "Top 10 Shopping Tips for Smart Buyers",
    category: "tips",
    date: "March 5, 2024",
    author: "Emily Davis",
    image: "https://picsum.photos/seed/blog3/800/400",
    excerpt: "Master the art of smart shopping with these expert tips that will help you save money and make better purchasing decisions."
  },
  {
    id: 4,
    title: "Spring Collection Preview",
    category: "fashion",
    date: "March 1, 2024",
    author: "David Wilson",
    image: "https://picsum.photos/seed/blog4/800/400",
    excerpt: "Get a first look at our upcoming spring collection and learn how to style these pieces for the perfect spring wardrobe."
  }
];

const categories = ['All Blogs', 'Fashion', 'Lifestyle', 'Trends', 'Tips & Tricks'];

function Blogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Blogs');

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All Blogs' || 
      blog.category.toLowerCase() === activeCategory.toLowerCase().replace(' ', '');
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="page-content">
      <div className="page-container">
        <h1 className="page-title">Our Blog</h1>
        
        <div className="search-container">
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search blogs..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="category-nav">
          {categories.map(cat => (
            <button
              key={cat}
              className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="blog-grid">
          {filteredBlogs.map(blog => (
            <div key={blog.id} className="blog-card">
              <img src={blog.image} alt={blog.title} className="blog-image" />
              <div className="blog-content">
                <h2 className="blog-title">{blog.title}</h2>
                <div className="blog-meta">
                  <span>{blog.date}</span>
                  <span>By {blog.author}</span>
                </div>
                <p className="blog-excerpt">{blog.excerpt}</p>
                <Link to={`/blog/${blog.id}`} className="read-more">Read More</Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Link to="/support" className="floating-support-btn" title="Customer Support">
        <MessageCircle size={28} />
      </Link>

      <style>{`
        .page-content { padding-top: calc(var(--navbar-height) + 2rem); min-height: 100vh; background: var(--color-bg); }
        .page-container { max-width: var(--container-max); margin: 0 auto; padding: 2rem 2rem 4rem; }
        .page-title { font-size: 2rem; font-weight: 600; color: var(--color-text); margin-bottom: 2rem; }
        .blog-card { background: var(--color-surface); border-radius: var(--radius-lg); overflow: hidden; transition: all var(--transition-base); border: 1px solid var(--color-border-light); }
        .blog-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
        .blog-image { width: 100%; height: 200px; object-fit: cover; }
        .blog-content { padding: 1.5rem; }
        .blog-title { font-size: 1.25rem; font-weight: 600; color: var(--color-text); margin-bottom: 0.5rem; }
        .blog-meta { display: flex; gap: 1rem; color: var(--color-text-muted); font-size: 0.875rem; margin-bottom: 1rem; }
        .blog-excerpt { color: var(--color-text-secondary); line-height: 1.6; margin-bottom: 1rem; }
        .search-input { padding: 0.75rem 1.25rem; width: 100%; max-width: 400px; border: 1px solid var(--color-border); border-radius: var(--radius-full); font-size: 0.9375rem; background: var(--color-surface); }
        .search-input:focus { border-color: var(--color-primary); outline: none; }
        .search-container { margin: 2rem auto; text-align: center; }
        .blog-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 2rem; margin-top: 2rem; }
        .read-more { display: inline-block; background: #1a1a1a; color: white; padding: 0.5rem 1rem; border-radius: 25px; text-decoration: none; font-weight: 500; transition: all 0.3s ease; }
        .read-more:hover { background: #1a1a1a; }
        .floating-support-btn { position: fixed; bottom: 32px; right: 32px; background: #1a1a1a; color: #fff; border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; font-size: 2rem; box-shadow: 0 4px 16px rgba(52,152,219,0.2); z-index: 2000; cursor: pointer; text-decoration: none; }
        @media (max-width: 768px) { .blog-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}

export default Blogs;
