import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Plus, Users, LogOut, ArrowLeft } from 'lucide-react';
import ProductManagement from './ProductManagement';
import AddProductForm from './AddProductForm';
import CustomerManagement from './CustomerManagement';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

type AdminView = 'products' | 'add-product' | 'customers';

const AdminDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<AdminView>('products');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { id: 'products', label: 'Manage Products', icon: Package },
    { id: 'add-product', label: 'Add Product', icon: Plus },
    { id: 'customers', label: 'Customers', icon: Users },
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'products':
        return <ProductManagement />;
      case 'add-product':
        return <AddProductForm onProductAdded={() => setActiveView('products')} />;
      case 'customers':
        return <CustomerManagement />;
      default:
        return <ProductManagement />;
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container-custom">
        <div className="mb-8">
          <h1 className="text-3xl font-serif mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user?.first_name} {user?.last_name}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveView(item.id as AdminView)}
                      className={`w-full flex items-center px-3 py-2 text-left rounded-md transition-colors ${
                        activeView === item.id
                          ? 'bg-gold-100 text-gold-700 border border-gold-200'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {item.label}
                    </button>
                  );
                })}
                
                {/* Divider */}
                <div className="border-t border-gray-200 my-4"></div>
                
                {/* Back to Home Button */}
                <button
                  onClick={handleBackToHome}
                  className="w-full flex items-center px-3 py-2 text-left rounded-md transition-colors text-blue-600 hover:bg-blue-50"
                >
                  <ArrowLeft className="h-5 w-5 mr-3" />
                  Back to Home
                </button>
                
                {/* Sign Out Button */}
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center px-3 py-2 text-left rounded-md transition-colors text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Sign Out
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200"
            >
              {renderContent()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;