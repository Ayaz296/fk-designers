import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X, Filter, RotateCcw } from 'lucide-react';
import { FilterOptions } from '../../types';

interface ProductFilterProps {
  filters: FilterOptions;
  onChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
}

// Constants for better maintainability
const COLOR_OPTIONS = [
  { name: 'Red', value: 'Red' },
  { name: 'Blue', value: 'Blue' },
  { name: 'Green', value: 'Green' },
  { name: 'Black', value: 'Black' },
  { name: 'Gold', value: 'Gold' },
  { name: 'Maroon', value: 'Maroon' },
  { name: 'Pink', value: 'Pink' },
  { name: 'Navy', value: 'Navy Blue' },
  { name: 'Teal', value: 'Teal' },
  { name: 'Purple', value: 'Purple' },
  { name: 'Cream', value: 'Cream' },
  { name: 'White', value: 'White' },
  { name: 'Beige', value: 'Beige' },
  { name: 'Coral', value: 'Coral' },
  { name: 'Royal Blue', value: 'Royal Blue' },
  { name: 'Burgundy', value: 'Burgundy' },
  { name: 'Golden', value: 'Golden' },
  { name: 'Mint Green', value: 'Mint Green' },
  { name: 'Powder Blue', value: 'Powder Blue' },
  { name: 'Peach', value: 'Peach' },
  { name: 'Natural', value: 'Natural' },
  { name: 'Light Gray', value: 'Light Gray' },
  { name: 'Light Blue', value: 'Light Blue' },
  { name: 'Charcoal', value: 'Charcoal' },
] as const;

const FABRIC_PATTERN_OPTIONS = [
  { name: 'Solid', value: 'Solid' },
  { name: 'Striped', value: 'Striped' },
  { name: 'Textured', value: 'Textured' },
  { name: 'Printed', value: 'Printed' },
  { name: 'Embroidered', value: 'Embroidered' },
  { name: 'Jacquard', value: 'Jacquard' },
] as const;

const SUBCATEGORY_OPTIONS = {
  men: ['ethnic', 'suits', 'kurta', 'sherwani', 'jackets', 'pathani'],
  kids: ['ethnic', 'suits', 'kurta', 'sherwani', 'jackets', 'pathani'],
  fabric: ['silk', 'cotton', 'linen', 'wool', 'synthetic'],
  all: ['ethnic', 'suits', 'kurta', 'sherwani', 'jackets', 'pathani', 'silk', 'cotton', 'linen', 'wool', 'synthetic']
} as const;

const ProductFilter: React.FC<ProductFilterProps> = ({ 
  filters, 
  onChange,
  onClearFilters
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Optimized filter handlers with proper dependency arrays
  const handleCategoryChange = useCallback((category: 'men' | 'kids' | 'fabric' | 'all') => {
    if (category === filters.category) return;
    
    const newFilters: FilterOptions = { 
      ...filters, 
      category,
      subcategory: 'all' // Reset subcategory when category changes
    };
    onChange(newFilters);
  }, [filters, onChange]);

  const handleSubcategoryChange = useCallback((subcategory: string) => {
    if (subcategory === filters.subcategory) return;
    
    const newFilters: FilterOptions = { ...filters, subcategory };
    onChange(newFilters);
  }, [filters, onChange]);

  const handleColorToggle = useCallback((color: string) => {
    const isSelected = filters.colors.includes(color);
    const newColors = isSelected
      ? filters.colors.filter(c => c !== color)
      : [...filters.colors, color];
    
    const newFilters: FilterOptions = { ...filters, colors: newColors };
    onChange(newFilters);
  }, [filters, onChange]);

  const handleFabricPatternToggle = useCallback((pattern: string) => {
    const isSelected = filters.fabricPatterns.includes(pattern);
    const newPatterns = isSelected
      ? filters.fabricPatterns.filter(p => p !== pattern)
      : [...filters.fabricPatterns, pattern];
    
    const newFilters: FilterOptions = { ...filters, fabricPatterns: newPatterns };
    onChange(newFilters);
  }, [filters, onChange]);

  // Memoized subcategories based on selected category
  const availableSubcategories = useMemo(() => {
    return SUBCATEGORY_OPTIONS[filters.category] || [];
  }, [filters.category]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => 
    filters.colors.length > 0 || 
    filters.category !== 'all' || 
    filters.subcategory !== 'all' ||
    filters.fabricPatterns.length > 0
  , [filters.colors.length, filters.category, filters.subcategory, filters.fabricPatterns.length]);

  // Count active filters for display
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category !== 'all') count++;
    if (filters.subcategory !== 'all') count++;
    count += filters.colors.length;
    count += filters.fabricPatterns.length;
    return count;
  }, [filters]);

  // Animation variants
  const expandVariants = {
    collapsed: {
      height: 0,
      opacity: 0,
      transition: { duration: 0.3, ease: "easeInOut" }
    },
    expanded: {
      height: "auto",
      opacity: 1,
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
      {/* Filter Header - Always Visible */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 text-lg font-medium hover:text-gold-600 transition-colors"
          >
            <Filter className="h-5 w-5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-gold-500 text-white text-xs px-2 py-1 rounded-full">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown 
              className={`h-5 w-5 transform transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`} 
            />
          </button>
          
          <div className="flex items-center space-x-3">
            {hasActiveFilters && (
              <button 
                onClick={onClearFilters}
                className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Filters Summary - Always Visible */}
        {hasActiveFilters && (
          <div className="mt-3 flex flex-wrap gap-2">
            {filters.category !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                Category: {filters.category === 'men' ? "Men's" : filters.category === 'kids' ? "Kids'" : 'Fabric'}
                <button
                  onClick={() => handleCategoryChange('all')}
                  className="ml-1 hover:text-blue-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            
            {filters.subcategory !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 capitalize">
                Style: {filters.subcategory === 'jackets' ? 'Sadri & Waistcoat' : filters.subcategory}
                <button
                  onClick={() => handleSubcategoryChange('all')}
                  className="ml-1 hover:text-green-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            
            {filters.colors.map(color => (
              <span
                key={color}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700"
              >
                {color}
                <button
                  onClick={() => handleColorToggle(color)}
                  className="ml-1 hover:text-purple-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            
            {filters.fabricPatterns.map(pattern => (
              <span
                key={pattern}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-700"
              >
                {pattern}
                <button
                  onClick={() => handleFabricPatternToggle(pattern)}
                  className="ml-1 hover:text-orange-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Expandable Filter Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={expandVariants}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-6">
              {/* Category Filter */}
              <div>
                <h4 className="font-medium mb-3 text-gray-900">Category</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { value: 'all', label: 'All Categories' },
                    { value: 'men', label: "Men's Wear" },
                    { value: 'kids', label: "Kids' Wear" },
                    { value: 'fabric', label: 'Fabrics' }
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => handleCategoryChange(value as any)}
                      className={`px-3 py-2 text-sm rounded-md border transition-all ${
                        filters.category === value
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subcategory Filter */}
              <div>
                <h4 className="font-medium mb-3 text-gray-900">Style</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  <button
                    onClick={() => handleSubcategoryChange('all')}
                    className={`px-3 py-2 text-sm rounded-md border transition-all ${
                      filters.subcategory === 'all'
                        ? 'bg-green-500 text-white border-green-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-green-300 hover:bg-green-50'
                    }`}
                  >
                    All Styles
                  </button>

                  {availableSubcategories.map((subcategory) => (
                    <button
                      key={subcategory}
                      onClick={() => handleSubcategoryChange(subcategory)}
                      className={`px-3 py-2 text-sm rounded-md border transition-all capitalize ${
                        filters.subcategory === subcategory
                          ? 'bg-green-500 text-white border-green-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-green-300 hover:bg-green-50'
                      }`}
                    >
                      {subcategory === 'jackets' ? 'Sadri & Waistcoat' : subcategory}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Filter */}
              <div>
                <h4 className="font-medium mb-3 text-gray-900">Colors</h4>
                <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => handleColorToggle(color.value)}
                      className={`px-3 py-2 text-sm rounded-md border transition-all ${
                        filters.colors.includes(color.value) 
                          ? 'bg-purple-500 text-white border-purple-500' 
                          : 'bg-white text-gray-700 border-gray-300 hover:border-purple-300 hover:bg-purple-50'
                      }`}
                    >
                      {color.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fabric Pattern Filter - Only show for fabric category */}
              {filters.category === 'fabric' && (
                <div>
                  <h4 className="font-medium mb-3 text-gray-900">Pattern</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                    {FABRIC_PATTERN_OPTIONS.map((pattern) => (
                      <button
                        key={pattern.value}
                        onClick={() => handleFabricPatternToggle(pattern.value)}
                        className={`px-3 py-2 text-sm rounded-md border transition-all ${
                          filters.fabricPatterns.includes(pattern.value) 
                            ? 'bg-orange-500 text-white border-orange-500' 
                            : 'bg-white text-gray-700 border-gray-300 hover:border-orange-300 hover:bg-orange-50'
                        }`}
                      >
                        {pattern.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Collapse Filters
                </button>
                
                {hasActiveFilters && (
                  <button 
                    onClick={onClearFilters}
                    className="flex items-center space-x-1 px-4 py-2 text-sm bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Clear All Filters</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductFilter;