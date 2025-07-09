import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import { Product } from '../../types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  // Format price to INR currency format
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatPriceRange = (priceRange: { min: number; max: number }): string => {
    return `${formatPrice(priceRange.min)} - ${formatPrice(priceRange.max)}`;
  };

  return (
    <motion.div 
      className="group product-card"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative overflow-hidden">
        {/* Product Image */}
        <Link to={`/product/${product.id}`} className="block">
          <div className="aspect-[3/4] overflow-hidden">
            <img 
              src={product.images[0]} 
              alt={product.name} 
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          
          {/* Quick View Button */}
          <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="bg-white bg-opacity-90 text-neutral-900 px-4 py-2 rounded-full flex items-center font-medium text-sm">
              <Eye className="h-4 w-4 mr-2" />
              Quick View
            </span>
          </div>
        </Link>
        
        {/* Product Badge */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          {product.newArrival && (
            <span className="bg-gold-500 text-white text-xs px-2 py-1 rounded">New Arrival</span>
          )}
          {product.bestSeller && !product.newArrival && (
            <span className="bg-gold-600 text-white text-xs px-2 py-1 rounded">Best Seller</span>
          )}
          {product.featured && !product.newArrival && !product.bestSeller && (
            <span className="bg-neutral-900 text-white text-xs px-2 py-1 rounded">Featured</span>
          )}
          {product.fabricPattern && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded capitalize">{product.fabricPattern}</span>
          )}
        </div>
      </div>
      
      {/* Product Details */}
      <div className="p-4">
        <h3 className="text-lg font-medium mb-1 truncate">
          <Link to={`/product/${product.id}`} className="hover:text-gold-600 transition-colors">
            {product.name}
          </Link>
        </h3>
        <div className="text-lg font-medium text-gold-600 mb-2">
          {product.priceRange ? formatPriceRange(product.priceRange) : formatPrice(product.price)}
        </div>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center capitalize">
            <span>{product.category}</span>
            <span className="mx-2">•</span>
            <span>{product.subcategory}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;