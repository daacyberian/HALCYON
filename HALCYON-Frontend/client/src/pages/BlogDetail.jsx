import { useParams, Link } from 'react-router-dom';
import { MessageCircle, ArrowLeft } from 'lucide-react';

const blogs = [
  {
    id: 1,
    title: "The Latest Fashion Trends for 2024",
    category: "fashion",
    date: "March 15, 2024",
    author: "Sarah Johnson",
    image: "https://picsum.photos/seed/blog1/800/400",
    content: `
      <h2>Introduction</h2>
      <p>As we step into 2024, the fashion world is buzzing with exciting new trends that are set to redefine style. From sustainable fashion to bold patterns, this year promises to be a game-changer in the world of style.</p>
      
      <h2>Sustainable Fashion</h2>
      <p>The push for sustainability continues to grow stronger in 2024. More brands are embracing eco-friendly materials and production methods. Look out for:</p>
      <ul>
        <li>Recycled fabrics and materials</li>
        <li>Zero-waste production techniques</li>
        <li>Vegan leather alternatives</li>
        <li>Upcycled vintage pieces</li>
      </ul>
      
      <h2>Bold Patterns and Colors</h2>
      <p>This year, fashion is all about making a statement. Expect to see:</p>
      <ul>
        <li>Vibrant color combinations</li>
        <li>Geometric patterns</li>
        <li>Abstract prints</li>
        <li>Mixed textures</li>
      </ul>
      
      <h2>Conclusion</h2>
      <p>2024 is shaping up to be an exciting year for fashion, with sustainability and bold expression taking center stage. Whether you're updating your wardrobe or just staying informed, these trends are worth watching.</p>
    `
  },
  {
    id: 2,
    title: "Sustainable Living: A Complete Guide",
    category: "lifestyle",
    date: "March 10, 2024",
    author: "Michael Chen",
    image: "https://picsum.photos/seed/blog2/800/400",
    content: `
      <h2>Why Sustainable Living Matters</h2>
      <p>Sustainable living is no longer just a trend - it's a necessity. Our planet's resources are finite, and it's up to us to make conscious choices that reduce our environmental impact.</p>
      
      <h2>Simple Steps to Start</h2>
      <p>Here are some easy ways to incorporate sustainability into your daily life:</p>
      <ol>
        <li>Reduce single-use plastics</li>
        <li>Conserve water and energy</li>
        <li>Support local and sustainable businesses</li>
        <li>Practice mindful consumption</li>
      </ol>
      
      <h2>Sustainable Shopping Tips</h2>
      <p>When shopping, consider these factors:</p>
      <ul>
        <li>Look for eco-friendly certifications</li>
        <li>Choose quality over quantity</li>
        <li>Support brands with sustainable practices</li>
        <li>Consider second-hand options</li>
      </ul>
    `
  },
  {
    id: 3,
    title: "Top 10 Shopping Tips for Smart Buyers",
    category: "tips",
    date: "March 5, 2024",
    author: "Emily Davis",
    image: "https://picsum.photos/seed/blog3/800/400",
    content: `
      <h2>Smart Shopping Strategies</h2>
      <p>Becoming a smart shopper isn't just about finding the best deals - it's about making informed decisions that benefit both your wallet and your lifestyle.</p>
      
      <h2>Essential Tips</h2>
      <ol>
        <li>Always compare prices across different platforms</li>
        <li>Read product reviews thoroughly</li>
        <li>Check return policies before purchasing</li>
        <li>Look for seasonal sales and promotions</li>
        <li>Consider the total cost of ownership</li>
        <li>Use price tracking tools</li>
        <li>Sign up for loyalty programs</li>
        <li>Follow your favorite brands on social media</li>
        <li>Use cashback and reward programs</li>
        <li>Keep track of your purchases</li>
      </ol>
      
      <h2>Making the Most of Your Budget</h2>
      <p>Remember that smart shopping isn't just about spending less - it's about getting the best value for your money while making purchases that align with your needs and values.</p>
    `
  },
  {
    id: 4,
    title: "Spring Collection Preview",
    category: "fashion",
    date: "March 1, 2024",
    author: "David Wilson",
    image: "https://picsum.photos/seed/blog4/800/400",
    content: `
      <h2>Welcome to Spring 2024</h2>
      <p>Our new spring collection brings fresh energy and vibrant colors to your wardrobe. This season, we're focusing on versatile pieces that transition seamlessly from day to night.</p>
      
      <h2>Key Pieces</h2>
      <p>Here are the must-have items from our spring collection:</p>
      <ul>
        <li>Lightweight trench coats</li>
        <li>Floral print dresses</li>
        <li>Pastel-colored blazers</li>
        <li>Wide-leg trousers</li>
        <li>Statement accessories</li>
      </ul>
      
      <h2>Styling Tips</h2>
      <p>Make the most of your spring wardrobe with these styling suggestions:</p>
      <ol>
        <li>Layer lightweight pieces for changing temperatures</li>
        <li>Mix patterns and textures for visual interest</li>
        <li>Accessorize with bold, colorful pieces</li>
        <li>Transition winter pieces with spring colors</li>
      </ol>
      
      <h2>Conclusion</h2>
      <p>Our spring collection is designed to bring joy and versatility to your wardrobe. Each piece is crafted with care and attention to detail, ensuring you look and feel your best this season.</p>
    `
  }
];

function BlogDetail() {
  const { id } = useParams();
  const blog = blogs.find(b => b.id === parseInt(id));

  if (!blog) {
    return (
      <div className="page-content">
        <div className="page-container">
          <div className="blog-detail-card">
            <div className="error-message">
              <h2>Blog not found</h2>
              <p>The blog you're looking for doesn't exist or has been removed.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="page-container">
        <Link to="/blogs" className="back-link">
          <ArrowLeft size={20} /> Back to Blogs
        </Link>
        <div className="blog-detail-card">
          <div className="blog-header">
            <h1 className="blog-title">{blog.title}</h1>
            <div className="blog-meta">
              <span>{blog.date}</span>
              <span>By {blog.author}</span>
              <span>Category: {blog.category}</span>
            </div>
          </div>
          <img src={blog.image} alt={blog.title} className="blog-image" />
          <div className="blog-content" dangerouslySetInnerHTML={{ __html: blog.content }} />
        </div>
      </div>

      <Link to="/support" className="floating-support-btn" title="Customer Support">
        <MessageCircle size={28} />
      </Link>

      <style>{`
        .page-content { padding-top: calc(var(--navbar-height) + 2rem); min-height: 100vh; background: var(--color-bg); }
        .page-container { max-width: 800px; margin: 0 auto; padding: 2rem 2rem 4rem; }
        .blog-detail-card { background: var(--color-surface); border-radius: var(--radius-xl); overflow: hidden; box-shadow: var(--shadow-sm); }
        .blog-hero-image { width: 100%; height: 400px; object-fit: cover; }
        .blog-detail-content { padding: 2.5rem; }
        .blog-detail-title { font-size: 2rem; font-weight: 600; color: var(--color-text); margin-bottom: 1rem; line-height: 1.3; }
        .blog-detail-meta { display: flex; gap: 1.5rem; color: var(--color-text-muted); font-size: 0.875rem; margin-bottom: 2rem; }
        .blog-detail-body { color: var(--color-text-secondary); line-height: 1.8; font-size: 1rem; }
        .back-link { display: inline-flex; align-items: center; gap: 0.5rem; color: var(--color-accent); font-weight: 500; margin-bottom: 1.5rem; text-decoration: none; }
        .blog-header { text-align: center; margin-bottom: 2rem; }
        .blog-title { font-size: 2rem; color: var(--color-text); margin-bottom: 1rem; font-weight: 600; }
        .blog-meta { display: flex; justify-content: center; gap: 2rem; color: var(--color-text-muted); margin-bottom: 2rem; }
        .blog-image { width: 100%; height: 400px; object-fit: cover; border-radius: var(--radius-lg); margin-bottom: 2rem; }
        .blog-content { background: var(--color-surface); padding: 2rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); line-height: 1.8; color: var(--color-text); }
        .blog-content p { margin-bottom: 1.5rem; }
        .blog-content h2 { color: var(--color-text); margin: 2rem 0 1rem; font-weight: 600; }
        .blog-content ul, .blog-content ol { margin-left: 2rem; margin-bottom: 1.5rem; }
        .floating-support-btn { position: fixed; bottom: 32px; right: 32px; background: #1a1a1a; color: #fff; border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; font-size: 2rem; box-shadow: 0 4px 16px rgba(52,152,219,0.2); z-index: 2000; cursor: pointer; text-decoration: none; }
        .error-message { text-align: center; padding: 3rem; color: var(--color-text-secondary); }
        @media (max-width: 768px) { .blog-title { font-size: 1.5rem; } .blog-image { height: 250px; } .blog-meta { flex-direction: column; gap: 0.5rem; } }
      `}</style>
    </div>
  );
}

export default BlogDetail;
