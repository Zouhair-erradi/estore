import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// ── Auth ────────────────────────────────────────────────
export const register = (data) => api.post('/auth/register', data);
export const login    = (data) => api.post('/auth/login', data);
export const getUser  = (id)   => api.get(`/auth/users/${id}`);
export const updateProfile = (id, data) => api.put(`/auth/users/${id}/profile`, data);

// ── Catalog ─────────────────────────────────────────────
export const getProducts   = (params) => api.get('/products', { params });
export const getProduct    = (id)     => api.get(`/products/${id}`);
export const getCategories = ()       => api.get('/categories');

// ── Cart ────────────────────────────────────────────────
export const getCart      = (userId) => api.get(`/cart/${userId}`);
export const addToCart    = (data)   => api.post('/cart/add', data);
export const updateCart   = (itemId, quantity) => api.put(`/cart/update/${itemId}`, null, { params: { quantity } });
export const removeFromCart = (itemId) => api.delete(`/cart/remove/${itemId}`);
export const clearCart    = (userId) => api.delete(`/cart/clear/${userId}`);

// ── Orders ──────────────────────────────────────────────
export const placeOrder     = (data)   => api.post('/orders', data);
export const getUserOrders  = (userId) => api.get(`/orders/user/${userId}`);
export const getOrder       = (id)     => api.get(`/orders/${id}`);

// ── Inventory ───────────────────────────────────────────
export const checkStock = (productId, quantity) =>
  api.get('/inventory/check', { params: { productId, quantity } });

// ── Reviews (MongoDB) ───────────────────────────────────
export const addReview        = (data)      => api.post('/reviews', data);
export const getProductReviews = (productId) => api.get(`/reviews/product/${productId}`);

export default api;
