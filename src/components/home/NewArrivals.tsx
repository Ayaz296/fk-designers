import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import SectionTitle from '../common/SectionTitle';
import ProductCard from '../common/ProductCard';
import { productService } from '../../services/productService';
import { Product } from '../../types';

// Request deduplication key
const REQUEST_KEY = 'new-arrivals-homepage';

const NewArrivals: React.FC = () => {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchNewArrivals = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🆕 Fetching new arrivals for homepage');
        
        const products = await productService.getNewArrivalProducts();
        
        if (isMounted) {
          setNewArrivals(products);
          console.log(`✅ New arrivals loaded: ${products.length} products`);
        }
      } catch (err) {
        console.error('❌ Error fetching new arrivals:', err);
        if (isMounted) {
          setError('Failed to load new arrivals');
          setNewArrivals([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Add a small delay to prevent simultaneous requests from multiple components
    const timeoutId = setTimeout(fetchNewArrivals, 100);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []); // Empty dependency array - only run once on mount

  // Loading state
  if (loading) {
    return (
      <section className="py-20">
        <div className="container-custom">
          <SectionTitle 
            title="New Arrivals" 
            subtitle="Discover our latest additions to the collection" 
            centered={false}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
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
      <section className="py-20">
        <div className="container-custom">
          <SectionTitle 
            title="New Arrivals" 
            subtitle="Discover our latest additions to the collection" 
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
  if (newArrivals.length === 0) {
    return (
      <section className="py-20">
        <div className="container-custom">
          <SectionTitle 
            title="New Arrivals" 
            subtitle="Discover our latest additions to the collection" 
            centered={false}
          />
          <div className="text-center py-12">
            <p className="text-gray-600">No new arrivals available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
          <SectionTitle 
            title="New Arrivals" 
            subtitle="Discover our latest additions to the collection" 
            centered={false}
          />
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Link 
              to="/shop?new_arrival=true" 
              className="inline-flex items-center text-gold-600 hover:text-gold-700 font-medium transition-colors"
            >
              View All New Arrivals <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </motion.div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {newArrivals.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;