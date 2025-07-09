import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import SectionTitle from '../common/SectionTitle';
import ProductCard from '../common/ProductCard';
import { productService } from '../../services/productService';
import { Product } from '../../types';

// Request deduplication key
const REQUEST_KEY = 'best-sellers-homepage';

const BestSellers: React.FC = () => {
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchBestSellers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🏆 Fetching best sellers for homepage');
        
        const products = await productService.getBestSellerProducts();
        
        if (isMounted) {
          setBestSellers(products);
          console.log(`✅ Best sellers loaded: ${products.length} products`);
        }
      } catch (err) {
        console.error('❌ Error fetching best sellers:', err);
        if (isMounted) {
          setError('Failed to load best sellers');
          setBestSellers([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Add a delay to prevent simultaneous requests from multiple components
    const timeoutId = setTimeout(fetchBestSellers, 200);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []); // Empty dependency array - only run once on mount

  // Loading state
  if (loading) {
    return (
      <section className="py-20 bg-neutral-100">
        <div className="container-custom">
          <SectionTitle 
            title="Best Sellers" 
            subtitle="Our most popular and sought-after pieces" 
            centered={false}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-gray-200 animate-pulse rounded-lg h-96"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-20 bg-neutral-100">
        <div className="container-custom">
          <SectionTitle 
            title="Best Sellers" 
            subtitle="Our most popular and sought-after pieces" 
            centered={false}
          />
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (bestSellers.length === 0) {
    return (
      <section className="py-20 bg-neutral-100">
        <div className="container-custom">
          <SectionTitle 
            title="Best Sellers" 
            subtitle="Our most popular and sought-after pieces" 
            centered={false}
          />
          <div className="text-center py-12">
            <p className="text-gray-600">No best sellers available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-neutral-100">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
          <SectionTitle 
            title="Best Sellers" 
            subtitle="Our most popular and sought-after pieces" 
            centered={false}
          />
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Link 
              to="/shop?best_seller=true" 
              className="inline-flex items-center text-gold-600 hover:text-gold-700 font-medium transition-colors"
            >
              View All Best Sellers <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </motion.div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8">
          {bestSellers.slice(0, 3).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        {bestSellers.length > 3 && (
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {bestSellers.slice(3, 6).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BestSellers;