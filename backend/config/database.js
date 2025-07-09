const { Pool } = require('pg');
require('dotenv').config();

// Database configuration using individual environment variables
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 5432,
  ssl: {
    rejectUnauthorized: false
  },
  // Optimized connection pool settings for high performance
  max: 20, // Maximum number of clients in the pool
  min: 5,  // Minimum number of clients in the pool (keep connections alive)
  idleTimeoutMillis: 600000, // Keep idle connections for 10 minutes
  connectionTimeoutMillis: 10000, // 10 seconds to establish connection
  acquireTimeoutMillis: 20000, // 20 seconds to acquire connection from pool
  // Force IPv4 for Render compatibility
  family: 4,
  // Additional settings for Supabase Session Pooler
  statement_timeout: 30000, // 30 seconds for statements (faster timeout)
  query_timeout: 30000, // 30 seconds for queries (faster timeout)
  // Keep connections alive with heartbeat
  keepAlive: true,
  keepAliveInitialDelayMillis: 0,
  // Application name for monitoring
  application_name: 'fk-designers-api',
  // Connection validation
  allowExitOnIdle: false, // Don't exit when all connections are idle
};

console.log('🔗 Database connection config:', {
  host: dbConfig.host,
  database: dbConfig.database,
  user: dbConfig.user,
  port: dbConfig.port,
  ssl: !!dbConfig.ssl,
  max: dbConfig.max,
  min: dbConfig.min,
  idleTimeout: `${dbConfig.idleTimeoutMillis / 1000}s`,
  queryTimeout: `${dbConfig.query_timeout / 1000}s`
});

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars);
  console.error('💡 Please set these in your .env file or Render environment variables');
  process.exit(1);
}

// Create connection pool
const pool = new Pool(dbConfig);

// Connection pool statistics
let connectionStats = {
  totalConnections: 0,
  activeConnections: 0,
  idleConnections: 0,
  waitingClients: 0,
  lastActivity: new Date(),
  queryCount: 0,
  errorCount: 0
};

// Enhanced pool event handlers with better logging
pool.on('error', (err, client) => {
  connectionStats.errorCount++;
  console.error('❌ Database pool error:', err.message);
  console.error('🔍 Error details:', {
    code: err.code,
    errno: err.errno,
    syscall: err.syscall,
    timestamp: new Date().toISOString()
  });
  
  // Update stats
  connectionStats.lastActivity = new Date();
  
  // Don't exit the process, let it recover
  console.log('🔄 Pool will attempt to recover automatically...');
});

pool.on('connect', (client) => {
  connectionStats.totalConnections++;
  connectionStats.lastActivity = new Date();
  console.log('🔌 New database connection established (Total:', pool.totalCount, ')');
  
  // Set connection-specific settings for better performance
  client.query('SET statement_timeout = 30000').catch(() => {});
  client.query('SET lock_timeout = 15000').catch(() => {});
  client.query('SET idle_in_transaction_session_timeout = 300000').catch(() => {});
  client.query('SET work_mem = "16MB"').catch(() => {}); // Increase work memory for better query performance
});

pool.on('acquire', (client) => {
  connectionStats.activeConnections++;
  connectionStats.lastActivity = new Date();
  console.log('📤 Connection acquired from pool (Active:', pool.totalCount - pool.idleCount, 'Idle:', pool.idleCount, ')');
});

pool.on('release', (client) => {
  connectionStats.activeConnections = Math.max(0, connectionStats.activeConnections - 1);
  connectionStats.lastActivity = new Date();
  console.log('📥 Connection released back to pool (Active:', pool.totalCount - pool.idleCount, 'Idle:', pool.idleCount, ')');
});

pool.on('remove', (client) => {
  connectionStats.totalConnections = Math.max(0, connectionStats.totalConnections - 1);
  connectionStats.lastActivity = new Date();
  console.log('🔌 Connection removed from pool - normal cleanup (Remaining:', pool.totalCount, ')');
});

// Test database connection with comprehensive retry logic
const testConnection = async (retries = 5) => {
  let client;
  try {
    console.log('🔄 Testing database connection...');
    console.log('🔗 Connecting to:', `${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
    
    client = await pool.connect();
    
    // Test basic query with timeout
    const result = await Promise.race([
      client.query('SELECT NOW() as current_time, version() as pg_version, current_database() as db_name'),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout')), 5000))
    ]);
    
    console.log('✅ Database connected successfully!');
    console.log('📅 Database time:', result.rows[0].current_time);
    console.log('🗄️ PostgreSQL version:', result.rows[0].pg_version.split(' ')[0]);
    console.log('💾 Database name:', result.rows[0].db_name);
    
    // Test if we can query users table
    try {
      const userCount = await client.query('SELECT COUNT(*) as count FROM users');
      console.log('👥 Users in database:', userCount.rows[0].count);
      
      // Test if admin user exists
      const adminCheck = await client.query('SELECT email, role FROM users WHERE role = $1 LIMIT 1', ['admin']);
      if (adminCheck.rows.length > 0) {
        console.log('👑 Admin user found:', adminCheck.rows[0].email);
      } else {
        console.log('⚠️ No admin user found - will be created on server start');
      }
    } catch (tableError) {
      console.log('⚠️ Users table not accessible yet (normal during first deployment)');
      console.log('📝 Table error:', tableError.message);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('🔍 Error details:', {
      code: error.code,
      errno: error.errno,
      syscall: error.syscall,
      address: error.address,
      host: dbConfig.host,
      port: dbConfig.port,
      timestamp: new Date().toISOString()
    });
    
    if (retries > 0) {
      const delay = Math.min(3000 * (6 - retries), 15000); // Exponential backoff, max 15s
      console.log(`🔄 Retrying connection in ${delay/1000} seconds... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return testConnection(retries - 1);
    }
    
    console.error('💡 Troubleshooting tips:');
    console.error('   1. Check your DB_HOST, DB_USER, DB_PASSWORD, DB_NAME environment variables');
    console.error('   2. Ensure you are using the Supabase Session Pooler host');
    console.error('   3. Verify your database password is correct');
    console.error('   4. Check if your IP is whitelisted in Supabase');
    console.error('   5. Try resetting your database password in Supabase');
    
    return false;
  } finally {
    if (client) {
      try {
        client.release();
      } catch (releaseError) {
        console.error('⚠️ Error releasing test client:', releaseError.message);
      }
    }
  }
};

// Enhanced query function with automatic retry and connection validation
const query = async (text, params, retries = 2) => {
  const start = Date.now();
  let client;
  
  try {
    connectionStats.queryCount++;
    
    // Validate pool health before acquiring connection
    if (pool.totalCount === 0) {
      console.log('⚠️ No connections in pool, creating new connection...');
    }
    
    // Get client from pool with timeout
    client = await Promise.race([
      pool.connect(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection acquire timeout')), dbConfig.acquireTimeoutMillis)
      )
    ]);
    
    // Validate connection is alive with a quick ping
    await Promise.race([
      client.query('SELECT 1'),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Connection validation timeout')), 2000))
    ]);
    
    // Execute query with timeout
    const res = await Promise.race([
      client.query(text, params),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query execution timeout')), dbConfig.query_timeout)
      )
    ]);
    
    const duration = Date.now() - start;
    
    // Only log slow queries to reduce noise
    if (duration > 1000) {
      console.log('🐌 Slow query detected:', { 
        query: text.substring(0, 50) + '...', 
        duration: `${duration}ms`, 
        rows: res.rowCount,
        poolStats: `${pool.totalCount - pool.idleCount}/${pool.totalCount} active`
      });
    } else if (duration > 100) {
      console.log('📊 Query executed:', { 
        query: text.substring(0, 30) + '...', 
        duration: `${duration}ms`, 
        rows: res.rowCount
      });
    }
    
    connectionStats.lastActivity = new Date();
    return res;
    
  } catch (error) {
    connectionStats.errorCount++;
    const duration = Date.now() - start;
    console.error('❌ Query error:', { 
      text: text.substring(0, 50) + '...', 
      error: error.message,
      code: error.code,
      duration: `${duration}ms`,
      poolStats: `${pool.totalCount - pool.idleCount}/${pool.totalCount} active`
    });
    
    // Handle specific PostgreSQL errors with retry logic
    const retryableErrors = [
      'ECONNRESET', 'ENOTFOUND', 'ECONNREFUSED', 'ETIMEDOUT', 
      'Connection acquire timeout', 'Query execution timeout', 'Connection validation timeout',
      '57P01', // admin_shutdown
      '57P02', // crash_shutdown  
      '57P03', // cannot_connect_now
      '08000', // connection_exception
      '08003', // connection_does_not_exist
      '08006', // connection_failure
      '53300', // too_many_connections
    ];
    
    const shouldRetry = retryableErrors.some(code => 
      error.code === code || error.message.includes(code)
    );
    
    if (shouldRetry && retries > 0) {
      console.log(`🔄 Retrying query due to connection issue... (${retries} attempts left)`);
      
      // Release the problematic client
      if (client) {
        try {
          client.release(true); // Force release with error flag
        } catch (releaseError) {
          console.error('⚠️ Error force-releasing client:', releaseError.message);
        }
        client = null;
      }
      
      // Wait before retry with exponential backoff
      const delay = Math.min(500 * (3 - retries), 2000);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return query(text, params, retries - 1);
    }
    
    // Handle specific error types
    if (error.code === '42P01') {
      console.error('📋 Table does not exist. Please run database migrations.');
      throw new Error('Database table not found. Please run migrations.');
    }
    
    if (error.code === '23505') {
      console.error('🔒 Unique constraint violation');
      throw new Error('Duplicate entry. This record already exists.');
    }
    
    if (error.code === '23503') {
      console.error('🔗 Foreign key constraint violation');
      throw new Error('Referenced record does not exist.');
    }
    
    connectionStats.lastActivity = new Date();
    throw error;
    
  } finally {
    if (client) {
      try {
        client.release();
      } catch (releaseError) {
        console.error('⚠️ Error releasing client:', releaseError.message);
      }
    }
  }
};

// Helper function to execute queries with single result
const execute = async (text, params) => {
  try {
    const result = await query(text, params);
    return [result.rows, result];
  } catch (error) {
    console.error('❌ Execute error:', error.message);
    throw error;
  }
};

// Enhanced health check function for monitoring
const healthCheck = async () => {
  try {
    const start = Date.now();
    const result = await query(
      'SELECT NOW() as time, current_database() as db, version() as version', 
      []
    );
    const duration = Date.now() - start;
    
    return {
      status: 'healthy',
      timestamp: result.rows[0].time,
      database: result.rows[0].db,
      version: result.rows[0].version.split(' ')[0],
      responseTime: `${duration}ms`,
      pool: {
        total: pool.totalCount,
        idle: pool.idleCount,
        active: pool.totalCount - pool.idleCount,
        waiting: pool.waitingCount
      },
      stats: {
        totalQueries: connectionStats.queryCount,
        errors: connectionStats.errorCount,
        lastActivity: connectionStats.lastActivity
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      code: error.code,
      pool: {
        total: pool.totalCount,
        idle: pool.idleCount,
        active: pool.totalCount - pool.idleCount,
        waiting: pool.waitingCount
      },
      stats: {
        totalQueries: connectionStats.queryCount,
        errors: connectionStats.errorCount,
        lastActivity: connectionStats.lastActivity
      }
    };
  }
};

// Connection maintenance function
const maintainConnections = async () => {
  try {
    console.log('🔧 Running connection maintenance...');
    
    // Get current pool stats
    const stats = {
      total: pool.totalCount,
      idle: pool.idleCount,
      active: pool.totalCount - pool.idleCount,
      waiting: pool.waitingCount
    };
    
    console.log('📊 Pool stats:', {
      ...stats,
      queries: connectionStats.queryCount,
      errors: connectionStats.errorCount,
      errorRate: connectionStats.queryCount > 0 ? `${(connectionStats.errorCount / connectionStats.queryCount * 100).toFixed(2)}%` : '0%'
    });
    
    // If we have very few connections, create a test connection to warm up the pool
    if (stats.total < dbConfig.min) {
      console.log('🔥 Warming up connection pool...');
      try {
        const client = await pool.connect();
        await client.query('SELECT 1');
        client.release();
        console.log('✅ Pool warmed up successfully');
      } catch (error) {
        console.error('❌ Pool warmup failed:', error.message);
      }
    }
    
    // Update connection stats
    connectionStats = {
      ...connectionStats,
      totalConnections: stats.total,
      activeConnections: stats.active,
      idleConnections: stats.idle,
      waitingClients: stats.waiting
    };
    
  } catch (error) {
    console.error('❌ Connection maintenance error:', error.message);
  }
};

// Initialize database connection
testConnection();

// Periodic health check and maintenance (every 5 minutes)
setInterval(async () => {
  const health = await healthCheck();
  console.log('💓 Database health check:', {
    status: health.status,
    responseTime: health.responseTime,
    pool: health.pool,
    errorRate: health.stats ? `${health.stats.errors}/${health.stats.totalQueries}` : 'N/A',
    timeSinceLastActivity: `${Math.round((Date.now() - new Date(connectionStats.lastActivity).getTime()) / 1000)}s`
  });
  
  // Run maintenance if needed
  if (health.status === 'healthy') {
    await maintainConnections();
  }
}, 5 * 60 * 1000);

// Graceful shutdown with proper cleanup
const gracefulShutdown = async (signal) => {
  console.log(`🛑 Received ${signal}, shutting down gracefully...`);
  
  try {
    // Stop accepting new connections
    console.log('🔒 Stopping new connections...');
    
    // Wait for active queries to complete (max 30 seconds)
    const shutdownTimeout = 30000;
    const shutdownStart = Date.now();
    
    while (pool.totalCount - pool.idleCount > 0 && Date.now() - shutdownStart < shutdownTimeout) {
      console.log(`⏳ Waiting for ${pool.totalCount - pool.idleCount} active connections to finish...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Close all connections in the pool
    await pool.end();
    console.log('✅ Database pool closed successfully');
    
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error.message);
  }
  
  process.exit(0);
};

// Process event handlers
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught exceptions gracefully
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('🔄 Attempting graceful shutdown...');
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  console.error('🔄 Attempting graceful shutdown...');
  gracefulShutdown('unhandledRejection');
});

module.exports = {
  pool,
  query,
  execute,
  testConnection,
  healthCheck,
  maintainConnections
};