import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import PrivateAdminRoute from './components/PrivateAdminRoute';
import Navbar from './components/Navbar';

import LoginPage            from './features/auth/LoginPage';
import RegisterPage         from './features/auth/RegisterPage';
import ProductListPage      from './features/catalog/ProductListPage';
import ProductDetailPage    from './features/catalog/ProductDetailPage';
import CartPage             from './features/cart/CartPage';
import OrderHistoryPage     from './features/orders/OrderHistoryPage';
import ProfilePage          from './features/profile/ProfilePage';
import AdminProductsPage    from './features/admin/AdminProductsPage';
import AdminProductFormPage from './features/admin/AdminProductFormPage';
import AdminInventoryPage   from './features/admin/AdminInventoryPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/"             element={<Navigate to="/products" replace />} />
            <Route path="/login"        element={<LoginPage />} />
            <Route path="/register"     element={<RegisterPage />} />
            <Route path="/products"     element={<ProductListPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/cart"         element={<PrivateRoute><CartPage /></PrivateRoute>} />
            <Route path="/orders"       element={<PrivateRoute><OrderHistoryPage /></PrivateRoute>} />
            <Route path="/profile"      element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
            <Route path="/admin"        element={<PrivateAdminRoute><AdminProductsPage /></PrivateAdminRoute>} />
            <Route path="/admin/products/new"      element={<PrivateAdminRoute><AdminProductFormPage /></PrivateAdminRoute>} />
            <Route path="/admin/products/edit/:id" element={<PrivateAdminRoute><AdminProductFormPage /></PrivateAdminRoute>} />
            <Route path="/admin/inventory"         element={<PrivateAdminRoute><AdminInventoryPage /></PrivateAdminRoute>} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}
