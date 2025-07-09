import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Eye, Search, Filter, Edit } from 'lucide-react';
import { Product } from '../../types';
import { productService } from '../../services/productService';
import EditProductModal from './EditProductModal';

const ProductManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productService.getProducts({ limit: 100 });
        setProducts(response.products);
        setFilteredProducts(response.products);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search and category
  useEffect(() => {
    let filtered = products;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.composition.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(product => product.category === filterCategory);
    }

    setFilteredProducts(filtered);
  }, [searchTerm, filterCategory, products]);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(productId);
        // Refresh products list
        const response = await productService.getProducts({ limit: 100 });
        setProducts(response.products);
        setFilteredProducts(response.products);
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
      }
    }
  };

  const handleView = (productId: string) => {
    window.open(`/product/${productId}`, '_blank');
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
  };

  const handleCloseEdit = () => {
    setEditingProduct(null);
  };

  const handleSaveEdit = async (updatedProduct: Product) => {
    try {
      await productService.updateProduct(updatedProduct.id, {
        name: updatedProduct.name,
        price: updatedProduct.price,
        price_min: updatedProduct.priceRange?.min,
        price_max: updatedProduct.priceRange?.max,
        category: updatedProduct.category,
        subcategory: updatedProduct.subcategory,
        description: updatedProduct.description,
        composition: updatedProduct.composition,
        fabric_pattern: updatedProduct.fabricPattern,
        images: updatedProduct.images,
        colors: updatedProduct.colors,
        featured: updatedProduct.featured,
        best_seller: updatedProduct.bestSeller,
        new_arrival: updatedProduct.newArrival,
      });

      // Refresh products list
      const response = await productService.getProducts({ limit: 100 });
      setProducts(response.products);
      setFilteredProducts(response.products);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-serif mb-6">Product Management</h2>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-serif mb-6">Product Management</h2>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif">Product Management</h2>
        <div className="text-sm text-gray-600">
          {filteredProducts.length} products
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
          >
            <option value="all">All Categories</option>
            <option value="men">Men's</option>
            <option value="kids">Kids'</option>
            <option value="fabric">Fabrics</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-700">Product</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">ID</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Price</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Composition</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product, index) => (
              <motion.tr
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-md mr-3"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500 capitalize">
                        {product.subcategory}
                        {product.fabricPattern && ` • ${product.fabricPattern}`}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 font-mono text-sm">{product.id}</td>
                <td className="py-4 px-4 capitalize">{product.category}</td>
                <td className="py-4 px-4 font-medium">
                  {product.priceRange 
                    ? `${formatPrice(product.priceRange.min)} - ${formatPrice(product.priceRange.max)}`
                    : formatPrice(product.price)
                  }
                </td>
                <td className="py-4 px-4 text-sm text-gray-600">{product.composition}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleView(product.id)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="View Product"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                      title="Edit Product"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found matching your criteria.</p>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={handleCloseEdit}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};

export default ProductManagement;