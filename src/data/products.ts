import { Product, ProductCategory } from '../types';
import { productService } from '../services/productService';

// Centralized data access layer with proper error handling and caching
// This prevents multiple components from making duplicate API calls

// Cache for frequently accessed data
const dataCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

// Helper function to get cached data
const getCachedData = (key: string) => {
  const cached = dataCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  dataCache.delete(key);
  return null;
};

// Helper function to set cached data
const setCachedData = (key: string, data: any) => {
  dataCache.set(key, {
    data,
    timestamp: Date.now()
  });
  
  // Clean up old cache entries
  if (dataCache.size > 20) {
    const oldestKey = dataCache.keys().next().value;
    if (oldestKey) {
      dataCache.delete(oldestKey);
    }
  }
};

// Request deduplication map
const activeRequests = new Map<string, Promise<any>>();

// Helper function to deduplicate requests
const deduplicateRequest = async <T>(key: string, requestFn: () => Promise<T>): Promise<T> => {
  // If request is already in progress, return the existing promise
  if (activeRequests.has(key)) {
    console.log(`🔄 Deduplicating request: ${key}`);
    return activeRequests.get(key) as Promise<T>;
  }

  // Create new request
  const promise = requestFn().finally(() => {
    activeRequests.delete(key);
  });

  activeRequests.set(key, promise);
  return promise;
};

export const getProductById = async (id: string): Promise<Product | undefined> => {
  const cacheKey = `product:${id}`;
  
  try {
    // Check cache first
    const cached = getCachedData(cacheKey);
    if (cached) {
      console.log(`📦 Cache hit for product: ${id}`);
      return cached;
    }

    // Deduplicate request
    const product = await deduplicateRequest(cacheKey, async () => {
      console.log(`🔍 Fetching product from service: ${id}`);
      return await productService.getProductById(id);
    });

    // Cache the result
    setCachedData(cacheKey, product);
    return product;
  } catch (error) {
    console.error(`❌ Error fetching product ${id}:`, error);
    return undefined;
  }
};

export const getRelatedProducts = async (categoryType: ProductCategory, excludeId: string): Promise<Product[]> => {
  const cacheKey = `related:${categoryType}:${excludeId}`;
  
  try {
    // Check cache first
    const cached = getCachedData(cacheKey);
    if (cached) {
      console.log(`📦 Cache hit for related products: ${categoryType}`);
      return cached;
    }

    // Deduplicate request
    const products = await deduplicateRequest(cacheKey, async () => {
      console.log(`🔍 Fetching related products from service: ${categoryType}`);
      return await productService.getRelatedProducts(categoryType, excludeId);
    });

    // Cache the result
    setCachedData(cacheKey, products);
    return products;
  } catch (error) {
    console.error(`❌ Error fetching related products for ${categoryType}:`, error);
    return [];
  }
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
  const cacheKey = 'featured-products';
  
  try {
    // Check cache first
    const cached = getCachedData(cacheKey);
    if (cached) {
      console.log('📦 Cache hit for featured products');
      return cached;
    }

    // Deduplicate request
    const products = await deduplicateRequest(cacheKey, async () => {
      console.log('🔍 Fetching featured products from service');
      return await productService.getFeaturedProducts();
    });

    // Cache the result
    setCachedData(cacheKey, products);
    return products;
  } catch (error) {
    console.error('❌ Error fetching featured products:', error);
    return [];
  }
};

export const getBestSellerProducts = async (): Promise<Product[]> => {
  const cacheKey = 'bestseller-products';
  
  try {
    // Check cache first
    const cached = getCachedData(cacheKey);
    if (cached) {
      console.log('📦 Cache hit for bestseller products');
      return cached;
    }

    // Deduplicate request
    const products = await deduplicateRequest(cacheKey, async () => {
      console.log('🔍 Fetching bestseller products from service');
      return await productService.getBestSellerProducts();
    });

    // Cache the result
    setCachedData(cacheKey, products);
    return products;
  } catch (error) {
    console.error('❌ Error fetching bestseller products:', error);
    return [];
  }
};

export const getNewArrivalProducts = async (): Promise<Product[]> => {
  const cacheKey = 'newarrival-products';
  
  try {
    // Check cache first
    const cached = getCachedData(cacheKey);
    if (cached) {
      console.log('📦 Cache hit for new arrival products');
      return cached;
    }

    // Deduplicate request
    const products = await deduplicateRequest(cacheKey, async () => {
      console.log('🔍 Fetching new arrival products from service');
      return await productService.getNewArrivalProducts();
    });

    // Cache the result
    setCachedData(cacheKey, products);
    return products;
  } catch (error) {
    console.error('❌ Error fetching new arrival products:', error);
    return [];
  }
};

// Clear cache function for admin operations
export const clearProductCache = (): void => {
  dataCache.clear();
  activeRequests.clear();
  console.log('🗑️ Product data cache cleared');
};