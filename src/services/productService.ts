import { apiClient } from '../config/api';
import { Product, ProductCategory } from '../types';

export interface ProductFilters {
  category?: string;
  subcategory?: string;
  search?: string;
  colors?: string;
  fabric_patterns?: string;
  featured?: boolean;
  best_seller?: boolean;
  new_arrival?: boolean;
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateProductData {
  id?: string;
  name: string;
  price: number;
  price_min?: number;
  price_max?: number;
  category: ProductCategory;
  subcategory: string;
  description: string;
  composition: string;
  fabric_pattern?: string;
  images: string[];
  colors: string[];
  featured?: boolean;
  best_seller?: boolean;
  new_arrival?: boolean;
}

// Professional caching system with TTL and size limits
class ProductCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 100;

  set(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    // Clean expired entries before adding new ones
    this.cleanExpired();
    
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  clearPattern(pattern: string): void {
    for (const [key] of this.cache) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  private cleanExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  getStats(): { size: number; keys: string[] } {
    this.cleanExpired();
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Request deduplication system
class RequestManager {
  private activeRequests = new Map<string, Promise<any>>();

  async execute<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // If request is already in progress, return the existing promise
    if (this.activeRequests.has(key)) {
      console.log(`🔄 Deduplicating request: ${key}`);
      return this.activeRequests.get(key) as Promise<T>;
    }

    // Create new request
    const promise = requestFn().finally(() => {
      this.activeRequests.delete(key);
    });

    this.activeRequests.set(key, promise);
    return promise;
  }

  cancel(key: string): void {
    this.activeRequests.delete(key);
  }

  cancelAll(): void {
    this.activeRequests.clear();
  }

  getActiveRequests(): string[] {
    return Array.from(this.activeRequests.keys());
  }
}

// Initialize managers
const cache = new ProductCache();
const requestManager = new RequestManager();

// Utility functions
const createCacheKey = (prefix: string, filters: ProductFilters): string => {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .sort(([a], [b]) => a.localeCompare(b)) // Sort for consistent keys
  );
  return `${prefix}:${JSON.stringify(cleanFilters)}`;
};

const sanitizeFilters = (filters: ProductFilters): Record<string, string> => {
  const params: Record<string, string> = {};
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        params[key] = value.join(',');
      } else {
        params[key] = value.toString();
      }
    }
  });

  return params;
};

export const productService = {
  /**
   * Get products with advanced caching and deduplication
   */
  async getProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
    const cacheKey = createCacheKey('products', filters);
    
    return requestManager.execute(cacheKey, async () => {
      try {
        // Check cache first
        const cached = cache.get(cacheKey);
        if (cached) {
          console.log(`📦 Cache hit for products: ${cacheKey}`);
          return cached;
        }

        // Sanitize and prepare filters
        const params = sanitizeFilters(filters);
        
        console.log(`🔍 Fetching products from API:`, params);
        
        const response = await apiClient.get<ProductsResponse>('/products', params);
        
        // Cache with shorter TTL for paginated results
        const ttl = filters.page && filters.page > 1 ? 2 * 60 * 1000 : 5 * 60 * 1000;
        cache.set(cacheKey, response, ttl);
        
        return response;
      } catch (error) {
        console.error('❌ Error fetching products:', error);
        throw error;
      }
    });
  },

  /**
   * Get single product by ID
   */
  async getProductById(id: string): Promise<Product> {
    const cacheKey = `product:${id}`;
    
    return requestManager.execute(cacheKey, async () => {
      try {
        // Check cache first
        const cached = cache.get(cacheKey);
        if (cached) {
          console.log(`📦 Cache hit for product: ${id}`);
          return cached;
        }

        console.log(`🔍 Fetching product from API: ${id}`);
        
        const product = await apiClient.get<Product>(`/products/${id}`);
        
        // Cache individual products for longer
        cache.set(cacheKey, product, 10 * 60 * 1000); // 10 minutes
        
        return product;
      } catch (error) {
        console.error(`❌ Error fetching product ${id}:`, error);
        throw error;
      }
    });
  },

  /**
   * Create new product
   */
  async createProduct(productData: CreateProductData): Promise<{ id: string }> {
    try {
      console.log('📝 Creating product:', productData.name);
      
      const result = await apiClient.post<{ id: string }>('/products', productData);
      
      // Invalidate related caches
      cache.clearPattern('products:');
      cache.clearPattern('featured-products');
      cache.clearPattern('bestseller-products');
      cache.clearPattern('newarrival-products');
      
      console.log(`✅ Product created: ${result.id}`);
      return result;
    } catch (error) {
      console.error('❌ Error creating product:', error);
      throw error;
    }
  },

  /**
   * Update existing product
   */
  async updateProduct(id: string, productData: CreateProductData): Promise<void> {
    try {
      console.log(`📝 Updating product: ${id}`);
      
      await apiClient.put<void>(`/products/${id}`, productData);
      
      // Invalidate specific product and related caches
      cache.delete(`product:${id}`);
      cache.clearPattern('products:');
      cache.clearPattern('related:');
      cache.clearPattern('featured-products');
      cache.clearPattern('bestseller-products');
      cache.clearPattern('newarrival-products');
      
      console.log(`✅ Product updated: ${id}`);
    } catch (error) {
      console.error(`❌ Error updating product ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete product
   */
  async deleteProduct(id: string): Promise<void> {
    try {
      console.log(`🗑️ Deleting product: ${id}`);
      
      await apiClient.delete<void>(`/products/${id}`);
      
      // Invalidate specific product and related caches
      cache.delete(`product:${id}`);
      cache.clearPattern('products:');
      cache.clearPattern('related:');
      cache.clearPattern('featured-products');
      cache.clearPattern('bestseller-products');
      cache.clearPattern('newarrival-products');
      
      console.log(`✅ Product deleted: ${id}`);
    } catch (error) {
      console.error(`❌ Error deleting product ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get featured products
   */
  async getFeaturedProducts(): Promise<Product[]> {
    const cacheKey = 'featured-products';
    
    return requestManager.execute(cacheKey, async () => {
      try {
        const cached = cache.get(cacheKey);
        if (cached) {
          console.log('📦 Cache hit for featured products');
          return cached;
        }

        const response = await this.getProducts({ featured: true, limit: 4 });
        const products = response.products;
        
        cache.set(cacheKey, products, 10 * 60 * 1000); // 10 minutes
        return products;
      } catch (error) {
        console.error('❌ Error fetching featured products:', error);
        return [];
      }
    });
  },

  /**
   * Get best seller products
   */
  async getBestSellerProducts(): Promise<Product[]> {
    const cacheKey = 'bestseller-products';
    
    return requestManager.execute(cacheKey, async () => {
      try {
        const cached = cache.get(cacheKey);
        if (cached) {
          console.log('📦 Cache hit for bestseller products');
          return cached;
        }

        const response = await this.getProducts({ best_seller: true, limit: 6 });
        const products = response.products;
        
        cache.set(cacheKey, products, 10 * 60 * 1000); // 10 minutes
        return products;
      } catch (error) {
        console.error('❌ Error fetching bestseller products:', error);
        return [];
      }
    });
  },

  /**
   * Get new arrival products
   */
  async getNewArrivalProducts(): Promise<Product[]> {
    const cacheKey = 'newarrival-products';
    
    return requestManager.execute(cacheKey, async () => {
      try {
        const cached = cache.get(cacheKey);
        if (cached) {
          console.log('📦 Cache hit for new arrival products');
          return cached;
        }

        const response = await this.getProducts({ new_arrival: true, limit: 6 });
        const products = response.products;
        
        cache.set(cacheKey, products, 10 * 60 * 1000); // 10 minutes
        return products;
      } catch (error) {
        console.error('❌ Error fetching new arrival products:', error);
        return [];
      }
    });
  },

  /**
   * Get related products
   */
  async getRelatedProducts(category: ProductCategory, excludeId: string): Promise<Product[]> {
    const cacheKey = `related:${category}:${excludeId}`;
    
    return requestManager.execute(cacheKey, async () => {
      try {
        const cached = cache.get(cacheKey);
        if (cached) {
          console.log(`📦 Cache hit for related products: ${category}`);
          return cached;
        }

        const response = await this.getProducts({ category, limit: 4 });
        const products = response.products.filter(product => product.id !== excludeId);
        
        cache.set(cacheKey, products, 10 * 60 * 1000); // 10 minutes
        return products;
      } catch (error) {
        console.error(`❌ Error fetching related products for ${category}:`, error);
        return [];
      }
    });
  },

  /**
   * Clear all caches (admin function)
   */
  clearCache(): void {
    cache.clear();
    requestManager.cancelAll();
    console.log('🗑️ All caches cleared');
  },

  /**
   * Get cache statistics (debugging)
   */
  getCacheStats(): { cache: any; activeRequests: string[] } {
    return {
      cache: cache.getStats(),
      activeRequests: requestManager.getActiveRequests()
    };
  }
};