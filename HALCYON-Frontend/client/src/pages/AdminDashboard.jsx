import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  adminDashboard, 
  getAdminAnalytics,
  addProduct,
  deleteProduct 
} from '../services/api';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  FileText, 
  BarChart3, 
  LogOut,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    products: [],
    categories: [],
  });
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    categoryId: '',
    description: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchDashboard();
  }, [navigate]);

  const fetchDashboard = async () => {
    try {
      const response = await adminDashboard();
      setData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      if (error.response?.status === 401) {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const handleCalculateSales = async () => {
    try {
      await calculateTotalSales();
      await fetchDashboard();
      alert('Total sales calculated!');
    } catch (error) {
      alert('Failed to calculate sales');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.ProductID, formData);
      } else {
        await addProduct(formData);
      }
      setShowProductForm(false);
      setEditingProduct(null);
      setFormData({ name: '', price: '', categoryId: '', description: '' });
      await fetchDashboard();
      alert('Product saved successfully!');
    } catch (error) {
      alert('Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.Name,
      price: product.Price,
      categoryId: product.CategoryID,
      description: product.Description || '',
    });
    setShowProductForm(true);
  };

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(productId);
      await fetchDashboard();
      alert('Product deleted!');
    } catch (error) {
      alert('Failed to delete product');
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading...</div>;
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-logo">HALCYON Admin</div>
        </div>
        <nav className="admin-sidebar-nav">
          <Link to="/admin" className="admin-nav-item active">
            <LayoutDashboard size={20} />
            Dashboard
          </Link>
          <Link to="/admin/products" className="admin-nav-item">
            <Package size={20} />
            Products
          </Link>
          <Link to="/admin/customers" className="admin-nav-item">
            <Users size={20} />
            Customers
          </Link>
          <Link to="/admin/orders" className="admin-nav-item">
            <FileText size={20} />
            Orders
          </Link>
          <Link to="/admin/analytics" className="admin-nav-item">
            <BarChart3 size={20} />
            Analytics
          </Link>
          <button className="admin-nav-item" onClick={handleLogout}>
            <LogOut size={20} />
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <h1 className="admin-header-title">Dashboard</h1>
        </header>

        <div className="admin-content">
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-title">Total Products</span>
                <div className="stat-card-icon">
                  <Package size={20} />
                </div>
              </div>
              <p className="stat-card-value">{data.totalProducts}</p>
            </div>
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-title">Total Orders</span>
                <div className="stat-card-icon">
                  <FileText size={20} />
                </div>
              </div>
              <p className="stat-card-value">{data.totalOrders}</p>
            </div>
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-title">Total Users</span>
                <div className="stat-card-icon">
                  <Users size={20} />
                </div>
              </div>
              <p className="stat-card-value">{data.totalUsers}</p>
            </div>
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-title">Total Revenue</span>
                <div className="stat-card-icon">
                  <BarChart3 size={20} />
                </div>
              </div>
              <p className="stat-card-value">${data.totalRevenue?.toFixed(2)}</p>
            </div>
          </div>

          {/* Products Table */}
          <div className="admin-section">
            <div className="admin-section-header">
              <h2 className="admin-section-title">Manage Products</h2>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setShowProductForm(true);
                  setEditingProduct(null);
                  setFormData({ name: '', price: '', categoryId: '', description: '' });
                }}
              >
                <Plus size={18} />
                Add Product
              </button>
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Category</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.products.map(product => (
                    <tr key={product.ProductID}>
                      <td>{product.ProductID}</td>
                      <td>{product.Name}</td>
                      <td>${product.Price?.toFixed(2)}</td>
                      <td>{product.CategoryName}</td>
                      <td>
                        <div className="admin-actions">
                          <button 
                            className="admin-action-btn edit"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            className="admin-action-btn delete"
                            onClick={() => handleDelete(product.ProductID)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add/Edit Product Form */}
          {showProductForm && (
            <div className="admin-form-container">
              <h2 className="admin-section-title">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="admin-form-grid">
                  <div className="form-group">
                    <label className="form-label">Product Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-input"
                      value={formData.categoryId}
                      onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                      required
                    >
                      <option value="">Select Category</option>
                      {data.categories.map(cat => (
                        <option key={cat.CategoryID} value={cat.CategoryID}>
                          {cat.Name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-input"
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowProductForm(false);
                      setEditingProduct(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
