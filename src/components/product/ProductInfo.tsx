import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Product } from '../../types';

interface ProductInfoProps {
  product: Product;
}

const ProductInfo: React.FC<ProductInfoProps> = ({ product }) => {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  
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
    <div className="mt-8 md:mt-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Product ID */}
        <div className="text-sm text-gray-500 mb-2">Product ID: {product.id}</div>
        
        {/* Product Title and Price */}
        <h1 className="text-3xl font-serif mb-2">{product.name}</h1>
        <div className="text-2xl font-medium text-gold-600 mb-4">
          {product.priceRange ? formatPriceRange(product.priceRange) : formatPrice(product.price)}
        </div>
        
        {/* Product Category */}
        <div className="flex items-center text-sm text-gray-500 mb-6 capitalize">
          <span>{product.category}</span>
          <span className="mx-2">•</span>
          <span>{product.subcategory}</span>
          {product.fabricPattern && (
            <>
              <span className="mx-2">•</span>
              <span>{product.fabricPattern}</span>
            </>
          )}
        </div>
        
        {/* Composition */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Composition</h3>
          <p className="text-gray-700 bg-gray-50 px-4 py-2 rounded-md">
            {product.composition}
          </p>
        </div>
        
        {/* Product Description */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-2">Description</h3>
          <p className="text-gray-700 leading-relaxed">
            {product.description}
          </p>
        </div>
        
        {/* Color Selection */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-2">Available Colors</h3>
          
          <div className="flex flex-wrap gap-3">
            {product.colors.map((color, index) => (
              <button
                key={index}
                onClick={() => setSelectedColor(color)}
                className={`px-3 py-2 border rounded-md transition-all ${
                  selectedColor === color
                    ? 'bg-gold-500 text-white border-gold-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
        
        {/* Call to Action */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button className="btn btn-primary btn-lg flex-1">
            Contact for Purchase
          </button>
        </div>
        
        {/* Additional Information */}
        <div className="mt-8 text-sm text-gray-500">
          <p>Need assistance? Call us at <a href="tel:+919876543210" className="text-gold-600">+91 98765 43210</a></p>
          {product.priceRange && (
            <p className="mt-2 text-gold-600">💡 Price varies based on customization and fabric selection</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ProductInfo;