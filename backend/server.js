const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const contactRoutes = require('./routes/contact');

const app = express();
const PORT = process.env.PORT || 10000;

console.log('🚀 Starting FK Designers API Server...');
console.log('📊 Environment:', process.env.NODE_ENV || 'development');
console.log('🔌 Port:', PORT);

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));
app.use(compression());

// Trust proxy for accurate IP detection behind Render/Cloudflare
app.set('trust proxy', 1);

// Enhanced rate limiting with different limits for different endpoints
const createRateLimit = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message: {
    success: false,
    message
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use a combination of IP and user agent for better rate limiting
  keyGenerator: (req) => {
    return `${req.ip}-${req.get('User-Agent') || 'unknown'}`;
  },
  // Skip rate limiting for health checks
  skip: (req) => req.path === '/health',
  // Custom handler for rate limit exceeded
  handler: (req, res) => {
    console.log(`⚠️ Rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
    
    // CRITICAL: Always set CORS headers even for rate limited responses
    res.set({
      'Access-Control-Allow-Origin': process.env.FRONTEND_URL || 'https://fkdesigner.in',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Allow-Credentials': 'true'
    });
    
    res.status(429).json({
      success: false,
      message: 'Too many requests. Please wait a moment before trying again.',
      retryAfter: Math.ceil(windowMs / 1000)
    });
  }
});

// Different rate limits for different types of requests
const generalLimiter = createRateLimit(
  5 * 60 * 1000, // 5 minutes (shorter window)
  100, // 100 requests per 5 minutes
  'Too many requests. Please wait a moment before trying again.'
);

const authLimiter = createRateLimit(
  10 * 60 * 1000, // 10 minutes  
  15, // 15 auth attempts per 10 minutes (more generous)
  'Too many authentication attempts. Please try again later.'
);

const productLimiter = createRateLimit(
  1 * 60 * 1000, // 1 minute
  30, // 30 product requests per minute (more restrictive but prevents cascading)
  'Too many product requests. Please slow down.'
);

// Apply rate limiting
app.use('/api/auth', authLimiter);
app.use('/api/products', productLimiter);
// app.use(generalLimiter); // Temporarily disable general limiter

// CORS configuration with better error handling
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'https://fkdesigner.in',
      'http://localhost:3000',
      'http://localhost:5173',
      'https://localhost:5173',
      'https://fkdesigner.in',
      'https://www.fkdesigner.in',
      // Add development origins
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000'
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      // In production, be more permissive to prevent CORS issues
      callback(null, true);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  // Preflight cache for 24 hours
  maxAge: 86400,
  // Handle preflight requests properly
  preflightContinue: false
};
app.use(cors(corsOptions));

// Additional CORS middleware to ensure headers are always set
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'https://fkdesigner.in',
    'http://localhost:3000',
    'http://localhost:5173',
    'https://localhost:5173',
    'https://fkdesigner.in',
    'https://www.fkdesigner.in',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
  ];
  
  if (!origin || allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

// Body parsing middleware with size limits
app.use(express.json({ 
  limit: '10mb',
  // Better error handling for JSON parsing
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({
        success: false,
        message: 'Invalid JSON format'
      });
      throw new Error('Invalid JSON');
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Enhanced logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  // Custom production logging format
  app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms'));
}

// Request timeout middleware
app.use((req, res, next) => {
  // Set timeout for all requests (30 seconds)
  req.setTimeout(30000, () => {
    console.error('⏰ Request timeout for:', req.method, req.path);
    if (!res.headersSent) {
      res.status(408).json({
        success: false,
        message: 'Request timeout. Please try again.'
      });
    }
  });
  next();
});

// Static files with caching
app.use('/uploads', express.static('uploads', {
  maxAge: '1d', // Cache for 1 day
  etag: true
}));

// Health check endpoint with detailed info
app.get('/health', async (req, res) => {
  try {
    const { healthCheck } = require('./config/database');
    const dbHealth = await healthCheck();
    
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: dbHealth.status,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
      },
      version: '1.0.0'
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'FK Designers API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      products: '/api/products',
      users: '/api/users',
      contact: '/api/contact'
    },
    documentation: 'https://github.com/your-repo/api-docs'
  });
});

// API routes with error boundaries
app.use('/api/auth', (req, res, next) => {
  console.log(`🔐 Auth request: ${req.method} ${req.path} from ${req.ip}`);
  next();
}, authRoutes);

app.use('/api/products', (req, res, next) => {
  console.log(`📦 Product request: ${req.method} ${req.path} from ${req.ip}`);
  next();
}, productRoutes);

app.use('/api/users', (req, res, next) => {
  console.log(`👥 User request: ${req.method} ${req.path} from ${req.ip}`);
  next();
}, userRoutes);

app.use('/api/contact', (req, res, next) => {
  console.log(`📧 Contact request: ${req.method} ${req.path} from ${req.ip}`);
  next();
}, contactRoutes);

// 404 handler
app.use('*', (req, res) => {
  // CRITICAL: Always set CORS headers even for 404s
  const origin = req.headers.origin;
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'https://fkdesigner.in',
    'http://localhost:3000',
    'http://localhost:5173',
    'https://localhost:5173',
    'https://fkdesigner.in',
    'https://www.fkdesigner.in',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
  ];
  
  if (!origin || allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  console.log(`❌ 404 - Not found: ${req.method} ${req.originalUrl} from ${req.ip}`);
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: ['/health', '/api/auth', '/api/products', '/api/users', '/api/contact']
  });
});

// Enhanced global error handler
app.use((err, req, res, next) => {
  // CRITICAL: Always set CORS headers even for errors
  const origin = req.headers.origin;
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'https://fkdesigner.in',
    'http://localhost:3000',
    'http://localhost:5173',
    'https://localhost:5173',
    'https://fkdesigner.in',
    'https://www.fkdesigner.in',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
  ];
  
  if (!origin || allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  console.error('❌ Server Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Handle specific error types
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON format in request body'
    });
  }
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: 'File size too large'
    });
  }
  
  res.status(err.status || 500).json({
    success: false,
    message: isDevelopment ? err.message : 'Internal server error',
    ...(isDevelopment && { 
      stack: err.stack,
      details: err 
    })
  });
});

// Initialize admin user function with better error handling
const initializeAdminUser = async () => {
  try {
    const { execute } = require('./config/database');
    
    console.log('🔧 Initializing admin user...');
    
    const adminEmail = 'fk.designer1@gmail.com';
    const adminPassword = 'Aamirfkdesigner1';
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    // Check if admin exists
    const [existingUsers] = await execute(
      'SELECT user_id, email FROM users WHERE email = $1',
      [adminEmail]
    );
    
    if (existingUsers.length > 0) {
      // Update existing admin
      await execute(
        'UPDATE users SET password_hash = $1, first_name = $2, last_name = $3, phone = $4, role = $5, is_active = $6, updated_at = NOW() WHERE email = $7',
        [hashedPassword, 'FK', 'Designer', '+91 79890 65114', 'admin', true, adminEmail]
      );
      console.log('✅ Admin user updated successfully');
    } else {
      // Create new admin user
      const [userResult] = await execute(
        `INSERT INTO users (first_name, last_name, email, phone, password_hash, role, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, 'admin', true, NOW(), NOW())
         RETURNING user_id`,
        ['FK', 'Designer', adminEmail, '+91 79890 65114', hashedPassword]
      );
      
      const userId = userResult[0].user_id;
      
      // Insert staff record
      await execute(
        `INSERT INTO staff (user_id, position, department, start_date)
         VALUES ($1, $2, $3, $4)`,
        [userId, 'System Administrator', 'Management', '2025-01-01']
      );
      
      console.log('✅ New admin user created successfully');
    }
    
    console.log('📧 Admin Email:', adminEmail);
    console.log('🔑 Admin Password:', adminPassword);
    
  } catch (error) {
    console.error('❌ Error initializing admin user:', error.message);
    // Retry after 30 seconds with exponential backoff
    setTimeout(initializeAdminUser, 30000);
  }
};

// Start server with better error handling
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || 'https://fkdesigner.in'}`);
  console.log('✅ FK Designers API Server is ready!');
  
  // Initialize admin user after server starts
  setTimeout(initializeAdminUser, 5000);
});

// Handle server errors
server.on('error', (error) => {
  console.error('❌ Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
    process.exit(1);
  }
});

// Graceful shutdown with connection cleanup
const gracefulShutdown = (signal) => {
  console.log(`🛑 Received ${signal}, shutting down gracefully...`);
  
  server.close((err) => {
    if (err) {
      console.error('❌ Error during server shutdown:', err);
      process.exit(1);
    }
    
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
  
  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.error('⏰ Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

module.exports = app;