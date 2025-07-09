import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, AlertCircle, ArrowLeft } from 'lucide-react';
import ProductGallery from '../components/product/ProductGallery';
import ProductInfo from '../components/product/ProductInfo';
import RelatedProducts from '../components/product/RelatedProducts';
import { productService } from '../services/productService';
import { Product } from '../types';

// Loading skeleton component
const ProductSkeleton: React.FC = () => (
  <div className="container-custom pt-32 pb-20">
    <div className="animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center space-x-2 mb-8">
        <div className="h-4 bg-gray-200 rounded w-12"></div>
        <div className="h-4 bg-gray-200 rounded w-1"></div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
        <div className="h-4 bg-gray-200 rounded w-1"></div>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </div>
      
      {/* Product content skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image skeleton */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-200 rounded-lg"></div>
          <div className="flex space-x-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-16 h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
        
        {/* Info skeleton */}
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
          <div className="h-12 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    </div>
  </div>
);

// Error component
const ProductError: React.FC<{ 
  error: string; 
  onRetry: () => void; 
  onGoBack: () => void;
}> = ({ error, onRetry, onGoBack }) => (
  <div className="container-custom pt-32 pb-20">
    <div className="text-center py-12">
      <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
      <h1 className="text-3xl font-serif mb-4">Product Not Found</h1>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        {error === 'Product not found' 
          ? 'The product you are looking for does not exist or has been removed.'
          : 'There was an error loading the product. Please try again.'
        }
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button 
          onClick={onRetry}
          className="btn btn-primary"
        >
          Try Again
        </button>
        <button 
          onClick={onGoBack}
          className="btn btn-outline flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </button>
        <Link to="/shop" className="btn btn-outline">
          Continue Shopping
        </Link>
      </div>
    </div>
  </div>
);

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // State management
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch product function with proper error handling
  const fetchProduct = useCallback(async (productId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔍 Fetching product: ${productId}`);
      
      const fetchedProduct = await productService.getProductById(productId);
      setProduct(fetchedProduct);
      
      console.log(`✅ Product loaded: ${fetchedProduct.name}`);
      
    } catch (err) {
      console.error('❌ Error fetching product:', err);
      
      if (err instanceof Error) {
        if (err.message.includes('not found') || err.message.includes('404')) {
          setError('Product not found');
        } else if (err.message.includes('Network') || err.message.includes('timeout')) {
          setError('Network error. Please check your connection and try again.');
        } else {
          setError(err.message);
        }
      } else {
        setError('An unexpected error occurred while loading the product.');
      }
      
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect to fetch product when ID changes
  useEffect(() => {
    if (!id) {
      setError('Product ID not provided');
      setLoading(false);
      return;
    }

    fetchProduct(id);
  }, [id, fetchProduct]);

  // Retry handler
  const handleRetry = useCallback(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id, fetchProduct]);

  // Go back handler
  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Update document title when product loads
  useEffect(() => {
    if (product) {
      document.title = `${product.name} | FK Designers`;
    }
    
    return () => {
      document.title = 'FK Designers | Luxury Indian Clothing';
    };
  }, [product]);

  // Render loading state
  if (loading) {
    return <ProductSkeleton />;
  }

  // Render error state
  if (error || !product) {
    return (
      <ProductError 
        error={error || 'Product not found'} 
        onRetry={handleRetry}
        onGoBack={handleGoBack}
      />
    );
  }

  // Render product page
  return (
    <>
      <div className="container-custom pt-32 pb-16">
        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm text-gray-500 mb-8" aria-label="Breadcrumb">
          <Link 
            to="/" 
            className="hover:text-gold-600 transition-colors"
            aria-label="Home"
          >
            Home
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" aria-hidden="true" />
          <Link 
            to="/shop" 
            className="hover:text-gold-600 transition-colors"
            aria-label="Shop"
          >
            Shop
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" aria-hidden="true" />
          <Link 
            to={`/shop?category=${product.category}`} 
            className="hover:text-gold-600 transition-colors capitalize"
            aria-label={`${product.category} category`}
          >
            {product.category}
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" aria-hidden="true" />
          <span className="text-gray-700 capitalize" aria-current="page">
            {product.subcategory}
          </span>
        </nav>
        
        {/* Product Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <ProductGallery 
            images={product.images} 
            productName={product.name} 
          />
          <ProductInfo product={product} />
        </div>
      </div>
      
      {/* Related Products */}
      <RelatedProducts 
        category={product.category} 
        productId={product.id} 
      />
    </>
  );
};

export default ProductPage;