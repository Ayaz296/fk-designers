import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import CustomizationPage from './pages/CustomizationPage';
import ReturnsPage from './pages/ReturnsPage';
import NotFoundPage from './pages/NotFoundPage';
import AdminDashboard from './components/admin/AdminDashboard';

// Scroll to top component
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isStaff, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
      </div>
    );
  }
  
  if (!isAuthenticated || !isStaff) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Admin Redirect Component
const AdminRedirect: React.FC = () => {
  const { isAuthenticated, isStaff } = useAuth();
  
  React.useEffect(() => {
    if (isAuthenticated && isStaff) {
      window.location.href = '/admin';
    }
  }, [isAuthenticated, isStaff]);
  
  return null;
};

function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<><HomePage /><AdminRedirect /></>} />
          <Route path="shop" element={<ShopPage />} /> {/* Main shop route */}
          <Route path="product/:id" element={<ProductPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="customization" element={<CustomizationPage />} />
          <Route path="returns" element={<ReturnsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;