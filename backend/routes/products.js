const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { execute } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Input validation rules
const productValidation = [
  body('name').trim().isLength({ min: 2, max: 255 }).escape(),
  body('price').isFloat({ min: 0 }),
  body('price_min').optional().isFloat({ min: 0 }),
  body('price_max').optional().isFloat({ min: 0 }),
  body('category').isIn(['men', 'kids', 'fabric']),
  body('subcategory').trim().isLength({ min: 2, max: 50 }).escape(),
  body('description').trim().isLength({ min: 10, max: 1000 }).escape(),
  body('composition').trim().isLength({ min: 2, max: 255 }).escape(),
  body('fabric_pattern').optional().trim().isLength({ max: 50 }).escape(),
  body('images').isArray({ min: 1 }),
  body('colors').isArray({ min: 1 }),
  body('featured').optional().isBoolean(),
  body('best_seller').optional().isBoolean(),
  body('new_arrival').optional().isBoolean()
];

// Enhanced cache for frequently accessed data
const cache = new Map();
const CACHE_TTL = 3 * 60 * 1000; // 3 minutes (reduced for faster updates)

// Helper function to get cached data
const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  cache.delete(key); // Clean up expired cache
  return null;
};

// Helper function to set cached data
const setCachedData = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
  
  // Clean up old cache entries more aggressively
  if (cache.size > 50) {
    const entries = Array.from(cache.entries());
    const now = Date.now();
    
    // Remove expired entries first
    entries.forEach(([key, value]) => {
      if (now - value.timestamp > CACHE_TTL) {
        cache.delete(key);
      }
    });
    
    // If still too many, remove oldest
    if (cache.size > 50) {
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }
  }
};

// Optimized query builder with better performance
const buildProductQuery = (filters) => {
  const {
    category = 'all',
    subcategory = 'all',
    search = '',
    colors = '',
    fabric_patterns = '',
    featured,
    best_seller,
    new_arrival
  } = filters;

  let whereConditions = [];
  let queryParams = [];
  let paramIndex = 1;

  // Build WHERE conditions efficiently
  if (category !== 'all') {
    whereConditions.push(`category = $${paramIndex++}`);
    queryParams.push(category);
  }

  if (subcategory !== 'all') {
    whereConditions.push(`subcategory = $${paramIndex++}`);
    queryParams.push(subcategory);
  }

  if (search.trim()) {
    // Use simpler ILIKE for better performance
    whereConditions.push(`(
      name ILIKE $${paramIndex} OR 
      description ILIKE $${paramIndex} OR 
      composition ILIKE $${paramIndex}
    )`);
    queryParams.push(`%${search.trim()}%`);
    paramIndex++;
  }

  if (colors) {
    const colorArray = colors.split(',').map(c => c.trim()).filter(Boolean);
    if (colorArray.length > 0) {
      // Simplified color search for better performance
      const colorConditions = colorArray.map(() => {
        const condition = `colors::text ILIKE $${paramIndex++}`;
        return condition;
      });
      whereConditions.push(`(${colorConditions.join(' OR ')})`);
      colorArray.forEach(color => {
        queryParams.push(`%"${color}"%`);
      });
    }
  }

  if (fabric_patterns) {
    const patternArray = fabric_patterns.split(',').map(p => p.trim()).filter(Boolean);
    if (patternArray.length > 0) {
      const patternConditions = patternArray.map(() => `fabric_pattern = $${paramIndex++}`);
      whereConditions.push(`(${patternConditions.join(' OR ')})`);
      queryParams.push(...patternArray);
    }
  }

  if (featured === 'true' || featured === true) {
    whereConditions.push('featured = true');
  }

  if (best_seller === 'true' || best_seller === true) {
    whereConditions.push('best_seller = true');
  }

  if (new_arrival === 'true' || new_arrival === true) {
    whereConditions.push('new_arrival = true');
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  return { whereClause, queryParams, paramIndex };
};

// Optimized product formatter with better error handling
const formatProduct = (product) => {
  try {
    // Handle images safely with fallback
    let images = [];
    if (product.images) {
      if (typeof product.images === 'string') {
        try {
          if (product.images.startsWith('data:image')) {
            images = [product.images];
          } else if (product.images.startsWith('[') || product.images.startsWith('{')) {
            images = JSON.parse(product.images);
          } else {
            images = [product.images];
          }
        } catch (e) {
          console.warn('⚠️ Failed to parse images for product', product.id, '- using fallback');
          images = [product.images];
        }
      } else if (Array.isArray(product.images)) {
        images = product.images;
      } else {
        images = [product.images];
      }
    }

    // Handle colors safely with fallback
    let colors = [];
    if (product.colors) {
      if (typeof product.colors === 'string') {
        try {
          if (product.colors.startsWith('[') || product.colors.startsWith('{')) {
            colors = JSON.parse(product.colors);
          } else {
            colors = [product.colors];
          }
        } catch (e) {
          console.warn('⚠️ Failed to parse colors for product', product.id, '- using fallback');
          colors = [product.colors];
        }
      } else if (Array.isArray(product.colors)) {
        colors = product.colors;
      } else {
        colors = [product.colors];
      }
    }

    // Ensure arrays and provide fallbacks
    const formattedProduct = {
      ...product,
      images: Array.isArray(images) && images.length > 0 ? images : [
        'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      ],
      colors: Array.isArray(colors) && colors.length > 0 ? colors : ['Black'],
      price: parseFloat(product.price) || 0
    };

    // Add price range if applicable
    if (product.price_min && product.price_max) {
      formattedProduct.priceRange = {
        min: parseFloat(product.price_min),
        max: parseFloat(product.price_max)
      };
    }

    return formattedProduct;
  } catch (error) {
    console.error('❌ Error formatting product', product.id, ':', error);
    // Return safe fallback
    return {
      ...product,
      images: ['https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'],
      colors: ['Black'],
      price: parseFloat(product.price) || 0
    };
  }
};

// Get all products with filtering and pagination - HIGHLY OPTIMIZED
router.get('/', async (req, res) => {
  const startTime = Date.now();
  
  try {
    console.log('📊 Products request:', {
      query: Object.keys(req.query).length > 0 ? req.query : 'no filters',
      ip: req.ip
    });
    
    const {
      sort_by = 'created_at',
      sort_order = 'DESC',
      page = 1,
      limit = 20
    } = req.query;

    // Create cache key - more specific for better cache hits
    const cacheKey = `products:${JSON.stringify({
      ...req.query,
      page: parseInt(page),
      limit: parseInt(limit)
    })}`;
    
    const cachedResult = getCachedData(cacheKey);
    
    if (cachedResult) {
      const responseTime = Date.now() - startTime;
      console.log('⚡ Cache hit - returning cached products:', {
        count: cachedResult.products.length,
        responseTime: responseTime + 'ms'
      });
      
      return res.json({
        success: true,
        data: cachedResult,
        cached: true,
        responseTime: responseTime + 'ms'
      });
    }

    // Build optimized query
    const { whereClause, queryParams, paramIndex } = buildProductQuery(req.query);

    // Validate sort parameters
    const allowedSortFields = ['name', 'price', 'created_at', 'updated_at'];
    const sortField = allowedSortFields.includes(sort_by) ? sort_by : 'created_at';
    const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Calculate pagination with limits
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit))); // Max 50 items per page
    const offset = (pageNum - 1) * limitNum;

    // Parallel execution for better performance
    const [countResult, productsResult] = await Promise.all([
      // Count query with timeout
      Promise.race([
        execute(`SELECT COUNT(*) as total FROM products ${whereClause}`, queryParams),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Count query timeout')), 8000))
      ]),
      
      // Products query with timeout
      Promise.race([
        execute(`
          SELECT id, name, price, price_min, price_max, category, subcategory, 
                 description, composition, fabric_pattern, images, colors,
                 featured, best_seller, new_arrival, created_at, updated_at
          FROM products 
          ${whereClause}
          ORDER BY ${sortField} ${sortDirection}
          LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `, [...queryParams, limitNum, offset]),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Products query timeout')), 10000))
      ])
    ]);

    const total = parseInt(countResult[0][0].total);
    const products = productsResult[0];

    // Format products efficiently
    const formattedProducts = products.map(formatProduct);

    const result = {
      products: formattedProducts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    };

    // Cache the result
    setCachedData(cacheKey, result);

    const responseTime = Date.now() - startTime;
    console.log('✅ Products fetched successfully:', {
      count: formattedProducts.length,
      total,
      responseTime: responseTime + 'ms',
      cached: false
    });

    res.json({
      success: true,
      data: result,
      responseTime: responseTime + 'ms'
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('❌ Get products error:', {
      error: error.message,
      query: req.query,
      responseTime: responseTime + 'ms'
    });
    
    // Return appropriate error based on type
    if (error.message.includes('timeout')) {
      return res.status(504).json({
        success: false,
        message: 'Request timeout. Please try again with fewer filters.',
        responseTime: responseTime + 'ms'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products. Please try again.',
      responseTime: responseTime + 'ms'
    });
  }
});

// Get single product by ID - OPTIMIZED
router.get('/:id', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { id } = req.params;
    
    console.log('📊 Get single product:', { id, ip: req.ip });

    // Check cache first
    const cacheKey = `product:${id}`;
    const cachedProduct = getCachedData(cacheKey);
    
    if (cachedProduct) {
      const responseTime = Date.now() - startTime;
      console.log('⚡ Cache hit - returning cached product:', { id, responseTime: responseTime + 'ms' });
      
      return res.json({
        success: true,
        data: cachedProduct,
        cached: true,
        responseTime: responseTime + 'ms'
      });
    }

    const [products] = await Promise.race([
      execute(
        `SELECT id, name, price, price_min, price_max, category, subcategory, 
                description, composition, fabric_pattern, images, colors,
                featured, best_seller, new_arrival, created_at, updated_at
         FROM products WHERE id = $1`,
        [id]
      ),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout')), 5000))
    ]);

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        responseTime: Date.now() - startTime + 'ms'
      });
    }

    const formattedProduct = formatProduct(products[0]);
    
    // Cache the result
    setCachedData(cacheKey, formattedProduct);

    const responseTime = Date.now() - startTime;
    console.log('✅ Single product fetched:', { id, responseTime: responseTime + 'ms' });

    res.json({
      success: true,
      data: formattedProduct,
      responseTime: responseTime + 'ms'
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('❌ Get product error:', {
      error: error.message,
      id: req.params.id,
      responseTime: responseTime + 'ms'
    });
    
    if (error.message.includes('timeout')) {
      return res.status(504).json({
        success: false,
        message: 'Request timeout. Please try again.',
        responseTime: responseTime + 'ms'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      responseTime: responseTime + 'ms'
    });
  }
});

// Create new product (Admin/Staff only) - OPTIMIZED
router.post('/', authenticateToken, requireRole(['admin', 'staff']), productValidation, async (req, res) => {
  const startTime = Date.now();
  
  try {
    console.log('📝 Create product request:', { 
      user: req.user.email, 
      productName: req.body.name,
      ip: req.ip 
    });
    
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      id,
      name,
      price,
      price_min,
      price_max,
      category,
      subcategory,
      description,
      composition,
      fabric_pattern,
      images,
      colors,
      featured = false,
      best_seller = false,
      new_arrival = false
    } = req.body;

    // Check if product ID already exists (if provided)
    if (id) {
      const [existingProducts] = await execute(
        'SELECT id FROM products WHERE id = $1',
        [id]
      );

      if (existingProducts.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Product ID already exists'
        });
      }
    }

    // Generate ID if not provided
    let productId = id;
    if (!productId) {
      const [lastProduct] = await execute(
        'SELECT id FROM products ORDER BY created_at DESC LIMIT 1'
      );
      
      if (lastProduct.length > 0) {
        const lastId = lastProduct[0].id;
        const numPart = parseInt(lastId.replace('FK', '')) || 0;
        productId = `FK${String(numPart + 1).padStart(3, '0')}`;
      } else {
        productId = 'FK001';
      }
    }

    // Ensure proper JSON formatting
    const imagesJson = JSON.stringify(Array.isArray(images) ? images : [images]);
    const colorsJson = JSON.stringify(Array.isArray(colors) ? colors : [colors]);

    // Insert product
    await execute(
      `INSERT INTO products (
        id, name, price, price_min, price_max, category, subcategory,
        description, composition, fabric_pattern, images, colors,
        featured, best_seller, new_arrival, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())`,
      [
        productId, name, price, price_min || null, price_max || null,
        category, subcategory, description, composition, fabric_pattern || null,
        imagesJson, colorsJson,
        featured, best_seller, new_arrival
      ]
    );

    // Log audit entry
    await execute(
      `INSERT INTO audit_logs (user_id, action, timestamp, ip_address, details)
       VALUES ($1, 'create_product', NOW(), $2, $3)`,
      [req.user.user_id, req.ip, JSON.stringify({ product_id: productId, name })]
    );

    // Clear relevant caches
    cache.clear(); // Clear all cache for simplicity

    const responseTime = Date.now() - startTime;
    console.log('✅ Product created successfully:', { 
      id: productId, 
      responseTime: responseTime + 'ms' 
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { id: productId },
      responseTime: responseTime + 'ms'
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('❌ Create product error:', {
      error: error.message,
      user: req.user?.email,
      responseTime: responseTime + 'ms'
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      responseTime: responseTime + 'ms'
    });
  }
});

// Update product (Admin/Staff only) - OPTIMIZED
router.put('/:id', authenticateToken, requireRole(['admin', 'staff']), productValidation, async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { id } = req.params;
    
    console.log('📝 Update product request:', { 
      id, 
      user: req.user.email,
      ip: req.ip 
    });
    
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      name,
      price,
      price_min,
      price_max,
      category,
      subcategory,
      description,
      composition,
      fabric_pattern,
      images,
      colors,
      featured = false,
      best_seller = false,
      new_arrival = false
    } = req.body;

    // Check if product exists
    const [existingProducts] = await execute(
      'SELECT id FROM products WHERE id = $1',
      [id]
    );

    if (existingProducts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Ensure proper JSON formatting
    const imagesJson = JSON.stringify(Array.isArray(images) ? images : [images]);
    const colorsJson = JSON.stringify(Array.isArray(colors) ? colors : [colors]);

    // Update product
    await execute(
      `UPDATE products SET 
        name = $1, price = $2, price_min = $3, price_max = $4, category = $5, subcategory = $6,
        description = $7, composition = $8, fabric_pattern = $9, images = $10, colors = $11,
        featured = $12, best_seller = $13, new_arrival = $14, updated_at = NOW()
       WHERE id = $15`,
      [
        name, price, price_min || null, price_max || null, category, subcategory,
        description, composition, fabric_pattern || null,
        imagesJson, colorsJson,
        featured, best_seller, new_arrival, id
      ]
    );

    // Log audit entry
    await execute(
      `INSERT INTO audit_logs (user_id, action, timestamp, ip_address, details)
       VALUES ($1, 'update_product', NOW(), $2, $3)`,
      [req.user.user_id, req.ip, JSON.stringify({ product_id: id, name })]
    );

    // Clear relevant caches
    cache.clear(); // Clear all cache for simplicity

    const responseTime = Date.now() - startTime;
    console.log('✅ Product updated successfully:', { 
      id, 
      responseTime: responseTime + 'ms' 
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      responseTime: responseTime + 'ms'
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('❌ Update product error:', {
      error: error.message,
      id: req.params.id,
      user: req.user?.email,
      responseTime: responseTime + 'ms'
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      responseTime: responseTime + 'ms'
    });
  }
});

// Delete product (Admin only) - OPTIMIZED
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { id } = req.params;
    
    console.log('🗑️ Delete product request:', { 
      id, 
      user: req.user.email,
      ip: req.ip 
    });

    // Check if product exists
    const [existingProducts] = await execute(
      'SELECT id, name FROM products WHERE id = $1',
      [id]
    );

    if (existingProducts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const product = existingProducts[0];

    // Delete product
    await execute('DELETE FROM products WHERE id = $1', [id]);

    // Log audit entry
    await execute(
      `INSERT INTO audit_logs (user_id, action, timestamp, ip_address, details)
       VALUES ($1, 'delete_product', NOW(), $2, $3)`,
      [req.user.user_id, req.ip, JSON.stringify({ product_id: id, name: product.name })]
    );

    // Clear relevant caches
    cache.clear(); // Clear all cache for simplicity

    const responseTime = Date.now() - startTime;
    console.log('✅ Product deleted successfully:', { 
      id, 
      responseTime: responseTime + 'ms' 
    });

    res.json({
      success: true,
      message: 'Product deleted successfully',
      responseTime: responseTime + 'ms'
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('❌ Delete product error:', {
      error: error.message,
      id: req.params.id,
      user: req.user?.email,
      responseTime: responseTime + 'ms'
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      responseTime: responseTime + 'ms'
    });
  }
});

module.exports = router;