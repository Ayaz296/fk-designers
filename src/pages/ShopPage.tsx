import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { debounce } from 'lodash';
import ProductFilter from '../components/shop/ProductFilter';
import ProductList from '../components/shop/ProductList';
import { productService } from '../services/productService';
import { Product, FilterOptions } from '../types';

// Constants
const INITIAL_PAGINATION = {
  page: 1,
  limit: 20,
  total: 0,
  pages: 0
};

const SORT_OPTIONS = [
  { value: 'created_at-DESC', label: 'Newest First' },
  { value: 'created_at-ASC', label: 'Oldest First' },
  { value: 'name-ASC', label: 'Name A-Z' },
  { value: 'name-DESC', label: 'Name Z-A' },
  { value: 'price-ASC', label: 'Price: Low to High' },
  { value: 'price-DESC', label: 'Price: High to Low' },
];

const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Core state
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Sorting state
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  
  // Pagination state
  const [pagination, setPagination] = useState(INITIAL_PAGINATION);
  
  // Filter state - initialized from URL params
  const [filters, setFilters] = useState<FilterOptions>(() => {
    const categoryParam = searchParams.get('category');
    const subcategoryParam = searchParams.get('subcategory');
    
    return {
      category: (categoryParam as any) || 'all',
      subcategory: subcategoryParam || 'all',
      priceRange: null,
      colors: [],
      fabricPatterns: [],
    };
  });

  // Refs for managing state and preventing race conditions
  const isInitializedRef = useRef(false);
  const lastRequestSignatureRef = useRef<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);

  // Memoized URL parameters
  const urlParams = useMemo(() => ({
    search: searchParams.get('search'),
    featured: searchParams.get('featured'),
    bestSeller: searchParams.get('best_seller'),
    newArrival: searchParams.get('new_arrival'),
  }), [searchParams]);

  // Create request signature for deduplication
  const createRequestSignature = useCallback((currentFilters: FilterOptions) => {
    const requestData = {
      filters: currentFilters,
      sort: { by: sortBy, order: sortOrder },
      pagination: { page: pagination.page, limit: pagination.limit },
      urlParams
    };
    return JSON.stringify(requestData);
  }, [sortBy, sortOrder, pagination.page, pagination.limit, urlParams]);

  // Main fetch function with proper error handling and deduplication
  const fetchProducts = useCallback(async (currentFilters: FilterOptions) => {
    const requestSignature = createRequestSignature(currentFilters);
    
    // Prevent duplicate requests
    if (requestSignature === lastRequestSignatureRef.current) {
      console.log('🚫 Skipping duplicate request');
      return;
    }

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    lastRequestSignatureRef.current = requestSignature;

    try {
      setLoading(true);
      setError(null);

      // Build API filters
      const apiFilters = {
        category: currentFilters.category !== 'all' ? currentFilters.category : undefined,
        subcategory: currentFilters.subcategory !== 'all' ? currentFilters.subcategory : undefined,
        search: urlParams.search || undefined,
        colors: currentFilters.colors.length > 0 ? currentFilters.colors.join(',') : undefined,
        fabric_patterns: currentFilters.fabricPatterns.length > 0 ? currentFilters.fabricPatterns.join(',') : undefined,
        featured: urlParams.featured === 'true' ? true : undefined,
        best_seller: urlParams.bestSeller === 'true' ? true : undefined,
        new_arrival: urlParams.newArrival === 'true' ? true : undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        page: pagination.page,
        limit: pagination.limit
      };

      // Remove undefined values
      const cleanFilters = Object.fromEntries(
        Object.entries(apiFilters).filter(([_, value]) => 
          value !== undefined && value !== null && value !== ''
        )
      );

      console.log('🔍 Fetching products with filters:', cleanFilters);

      const response = await productService.getProducts(cleanFilters);

      // Check if request was cancelled
      if (abortController.signal.aborted) {
        console.log('🚫 Request was cancelled');
        return;
      }

      // Check if this is still the latest request
      if (requestSignature !== lastRequestSignatureRef.current) {
        console.log('⚠️ Outdated response, ignoring');
        return;
      }

      setProducts(response.products);
      setPagination(response.pagination);
      
    } catch (err) {
      // Don't set error for cancelled requests
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('🚫 Request was cancelled');
        return;
      }

      console.error('❌ Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      setProducts([]);
      setPagination(INITIAL_PAGINATION);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [createRequestSignature, sortBy, sortOrder, pagination.page, pagination.limit, urlParams]);

  // Debounced fetch function
  const debouncedFetch = useMemo(
    () => debounce((currentFilters: FilterOptions) => {
      fetchProducts(currentFilters);
    }, 300),
    [fetchProducts]
  );

  // Initialize and handle filter changes
  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      fetchProducts(filters);
    } else {
      debouncedFetch(filters);
    }

    // Cleanup function
    return () => {
      debouncedFetch.cancel();
    };
  }, [filters, debouncedFetch, fetchProducts]);

  // Handle pagination changes (immediate fetch, no debounce)
  useEffect(() => {
    if (isInitializedRef.current) {
      fetchProducts(filters);
    }
  }, [pagination.page, pagination.limit]);

  // Handle sort changes (immediate fetch, no debounce)
  useEffect(() => {
    if (isInitializedRef.current) {
      fetchProducts(filters);
    }
  }, [sortBy, sortOrder]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      debouncedFetch.cancel();
    };
  }, [debouncedFetch]);

  // Filter change handler
  const handleFilterChange = useCallback((newFilters: FilterOptions) => {
    // Prevent unnecessary updates
    if (JSON.stringify(newFilters) === JSON.stringify(filters)) {
      return;
    }
    
    console.log('🔄 Filters changed:', newFilters);
    
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));

    // Update URL parameters
    const newParams = new URLSearchParams();
    if (urlParams.search) newParams.set('search', urlParams.search);
    if (newFilters.category !== 'all') newParams.set('category', newFilters.category);
    if (newFilters.subcategory !== 'all') newParams.set('subcategory', newFilters.subcategory);
    if (urlParams.featured) newParams.set('featured', urlParams.featured);
    if (urlParams.bestSeller) newParams.set('best_seller', urlParams.bestSeller);
    if (urlParams.newArrival) newParams.set('new_arrival', urlParams.newArrival);
    
    setSearchParams(newParams, { replace: true });
  }, [filters, urlParams, setSearchParams]);

  // Clear filters handler
  const handleClearFilters = useCallback(() => {
    console.log('🗑️ Clearing all filters');
    
    const clearedFilters: FilterOptions = {
      category: 'all',
      subcategory: 'all',
      priceRange: null,
      colors: [],
      fabricPatterns: [],
    };
    
    setFilters(clearedFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
    
    // Keep only search params, remove filter params
    const newParams = new URLSearchParams();
    if (urlParams.search) newParams.set('search', urlParams.search);
    
    setSearchParams(newParams, { replace: true });
  }, [urlParams.search, setSearchParams]);

  // Sort change handler
  const handleSortChange = useCallback((sortValue: string) => {
    const [field, order] = sortValue.split('-');
    setSortBy(field);
    setSortOrder(order as 'ASC' | 'DESC');
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Pagination handlers
  const handlePageChange = useCallback((newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  // Render error state
  if (error) {
    return (
      <div className="pt-24 pb-20">
        <div className="container-custom">
          <div className="text-center py-12">
            <h1 className="text-2xl font-serif mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={() => fetchProducts(filters)}
              className="btn btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20">
      <div className="container-custom">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-serif mb-4">
            {urlParams.search ? `Search Results for "${urlParams.search}"` : 'Our Collection'}
          </h1>
          <p className="text-gray-600 max-w-3xl">
            {urlParams.search 
              ? `Found ${pagination.total} products matching your search.`
              : 'Discover our exquisite range of premium Indian ethnic wear, crafted with the finest fabrics and intricate detailing.'
            }
          </p>
        </div>
        
        {/* Top Filters - Always Visible */}
        <ProductFilter 
          filters={filters} 
          onChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />
        
        <div className="space-y-6">
          {/* Product Grid */}
          <div>
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
              <p className="text-gray-600">
                {loading ? (
                  'Loading products...'
                ) : (
                  <>
                    Showing <span className="font-medium">{products.length}</span> of{' '}
                    <span className="font-medium">{pagination.total}</span> products
                  </>
                )}
              </p>
              
              {/* Sort Dropdown */}
              <div className="flex items-center">
                <span className="mr-2 text-sm text-gray-600">Sort by:</span>
                <select 
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-gold-500 focus:border-gold-500 bg-white"
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => handleSortChange(e.target.value)}
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Product List */}
            <ProductList products={products} loading={loading} />

            {/* Pagination */}
            {pagination.pages > 1 && !loading && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                  
                  <span className="px-4 py-2 text-sm text-gray-600">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  
                  <button
                    onClick={() => handlePageChange(Math.min(pagination.pages, pagination.page + 1))}
                    disabled={pagination.page === pagination.pages}
                    className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;