import axios from 'axios';

const API_URL = 'https://ecom-backend-alpha-rust.vercel.app';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
  const adminToken = localStorage.getItem('adminToken');
  
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  }
  return config;
});

// Categories & Products
export const getCategories = () => api.get('/categories');
export const getSubcategories = () => api.get('/subcategories');
export const getProducts = () => api.get('/products');
export const getProductById = (id) => api.get(`/product?id=${id}`);

// Cart - For logged in users
export const addToCartAPI = (productId, quantity = 1) => 
  api.post('/cart/add', { productId, quantity });
export const getCart = () => api.get('/cart');
export const removeFromCartAPI = (productId) => 
  api.post('/cart/remove', { productId });
export const incrementCartItem = (productId) => 
  api.post('/cart/increment', { productId });
export const decrementCartItem = (productId) => 
  api.post('/cart/decrement', { productId });
export const getCartCount = () => api.get('/cart/count');

// Wishlist - For logged in users
export const addToWishlistAPI = (productId) => 
  api.post('/wishlist/add', { productId });
export const getWishlistAPI = () => api.get('/wishlist');
export const removeFromWishlistAPI = (productId) => 
  api.post('/wishlist/remove', { productId });

// Customer Login/Register
export const customerLogin = (credentials) => 
  api.post('/auth/login', credentials);
export const customerRegister = (userData) => 
  api.post('/auth/register', userData);

// Admin
export const adminLogin = (credentials) => 
  api.post('/auth/admin-login', credentials);
export const adminDashboard = () => api.get('/admin/dashboard');
export const getAdminAnalytics = () => api.get('/admin/analytics/all');
export const addProduct = (productData) => 
  api.post('/admin/products', productData);
export const deleteProduct = (id) => 
  api.delete(`/admin/products/${id}`);

// Orders
export const checkout = (orderData) => 
  api.post('/order/checkout', orderData);
export const getOrders = () => api.get('/orders');
export const getOrderItems = (email) => 
  api.get(`/orderitems/by-customer?email=${encodeURIComponent(email)}`);

// Return & Exchange
export const requestReturn = (returnData) => 
  api.post('/return/request', returnData);
export const requestExchange = (exchangeData) => 
  api.post('/exchange/request', exchangeData);
export const getReturnsByCustomer = (customerId) => 
  api.get(`/returns/by-customer?customerId=${customerId}`);
export const getExchangesByCustomer = (customerId) => 
  api.get(`/exchange/by-customer?customerId=${customerId}`);

// Reviews
export const getReviews = (productId) => 
  api.get(`/reviews?productId=${productId}`);
export const addReview = (reviewData) => 
  api.post('/reviews', reviewData);

// Discount
export const applyDiscount = (code) => 
  api.post('/discount/apply', { code });

// Blogs
export const getBlogs = () => api.get('/blogs');
export const getBlogById = (id) => api.get(`/blogs/${id}`);

// Loyalty Points
export const getLoyaltyPoints = () => api.get('/loyalty/points');
export const redeemLoyaltyPoints = (points) => 
  api.post('/loyalty/redeem', { points });

export default api;
