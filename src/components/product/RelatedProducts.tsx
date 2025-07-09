import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import SectionTitle from '../common/SectionTitle';
import ProductCard from '../common/ProductCard';
import { productService } from '../../services/productService';
import { ProductCategory, Product } from '../../types';

interface RelatedProductsProps {
  category: ProductCategory;
  productId: string;
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({ category, productId }) => {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`🔗 Fetching related products for ${category}, excluding ${productId}`);
        
        const products = await productService.getRelatedProducts(category, productId);
        
        if (isMounted) {
          setRelatedProducts(products);
          console.log(`✅ Related products loaded: ${products.length} products`);
        }
      } catch (err) {
        console.error('❌ Error fetching related products:', err);
        if (isMounted) {
          setError('Failed to load related products');
          setRelatedProducts([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Add a delay to prevent simultaneous requests
    const timeoutId = setTimeout(fetchRelatedProducts, 300);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [category, productId]); // Only re-run when category or productId changes

  // Loading state
  if (loading) {
    return (
      <section className="py-16 bg-neutral-50">
        <div className="container-custom">
          <SectionTitle 
            title="You May Also Like" 
            subtitle="Explore other products similar to this one" 
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

  // Error state - don't show error section, just log and return null
  if (error) {
    console.warn('Related products failed to load, hiding section');
    return null;
  }

  // Empty state - don't show section if no related products
  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-neutral-50">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
          <SectionTitle 
            title="You May Also Like" 
            subtitle="Explore other products similar to this one" 
            centered={false}
          />
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Link 
              to={`/shop?category=${category}`}
              className="inline-flex items-center text-gold-600 hover:text-gold-700 font-medium transition-colors"
            >
              View All <span className="capitalize">{category}'s</span> Collection <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </motion.div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {relatedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RelatedProducts;