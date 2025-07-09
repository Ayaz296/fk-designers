const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { execute } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Input validation rules
const registerValidation = [
  body('first_name').trim().isLength({ min: 2, max: 50 }).escape(),
  body('last_name').trim().isLength({ min: 2, max: 50 }).escape(),
  body('email').isEmail().normalizeEmail(),
  body('phone').isLength({ min: 10, max: 15 }).matches(/^[\+]?[0-9\s\-\(\)]+$/),
  body('password').isLength({ min: 6 }),
  body('date_of_birth').optional().isISO8601(),
  body('address_1').optional().trim().isLength({ max: 255 }).escape(),
  body('address_2').optional().trim().isLength({ max: 255 }).escape()
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

// Generate JWT token
const generateToken = (userId, email, role) => {
  return jwt.sign(
    { userId, email, role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Register endpoint
router.post('/register', registerValidation, async (req, res) => {
  try {
    console.log('📝 Registration attempt for:', req.body.email);
    
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
      first_name,
      last_name,
      email,
      phone,
      password,
      date_of_birth,
      address_1,
      address_2
    } = req.body;

    // Check if user already exists (case-insensitive)
    console.log('🔍 Checking if user exists:', email);
    const [existingUsers] = await execute(
      'SELECT user_id, email FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    if (existingUsers.length > 0) {
      console.log('❌ User already exists:', email);
      return res.status(409).json({
        success: false,
        message: 'This email is already registered. Please use a different email address or try logging in.'
      });
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user
    console.log('👤 Creating new user...');
    const [userResult] = await execute(
      `INSERT INTO users (first_name, last_name, email, phone, password_hash, role, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, 'customer', true, NOW(), NOW())
       RETURNING user_id`,
      [first_name, last_name, email, phone, hashedPassword]
    );

    const userId = userResult[0].user_id;
    console.log('✅ User created with ID:', userId);

    // Insert customer record
    console.log('📋 Creating customer record...');
    await execute(
      `INSERT INTO customers (user_id, date_of_birth, address_1, address_2)
       VALUES ($1, $2, $3, $4)`,
      [userId, date_of_birth || null, address_1 || null, address_2 || null]
    );

    // Log audit entry
    await execute(
      `INSERT INTO audit_logs (user_id, action, timestamp, ip_address, details)
       VALUES ($1, 'register', NOW(), $2, $3)`,
      [userId, req.ip, JSON.stringify({ email, role: 'customer' })]
    );

    // Generate token
    const token = generateToken(userId, email, 'customer');

    console.log('✅ Registration successful for:', email);
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          user_id: userId,
          first_name,
          last_name,
          email,
          phone,
          role: 'customer',
          is_active: true
        },
        token
      }
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    
    // Handle specific database errors
    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({
        success: false,
        message: 'This email is already registered. Please use a different email address.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
});

// Login endpoint
router.post('/login', loginValidation, async (req, res) => {
  try {
    console.log('🔐 Login attempt for:', req.body.email);
    
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

    const { email, password } = req.body;

    // Find user (case-insensitive)
    console.log('🔍 Looking up user:', email);
    const [users] = await execute(
      `SELECT user_id, first_name, last_name, email, phone, password_hash, role, is_active
       FROM users WHERE LOWER(email) = LOWER($1)`,
      [email]
    );

    if (users.length === 0) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please check your credentials and try again.'
      });
    }

    const user = users[0];

    // Check if user is active
    if (!user.is_active) {
      console.log('❌ User account is inactive:', email);
      return res.status(401).json({
        success: false,
        message: 'Account is inactive. Please contact support.'
      });
    }

    // Verify password
    console.log('🔐 Verifying password...');
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please check your credentials and try again.'
      });
    }

    // Generate token
    const token = generateToken(user.user_id, user.email, user.role);

    // Log audit entry
    await execute(
      `INSERT INTO audit_logs (user_id, action, timestamp, ip_address, details)
       VALUES ($1, 'login', NOW(), $2, $3)`,
      [user.user_id, req.ip, JSON.stringify({ email: user.email })]
    );

    // Remove password hash from response
    delete user.password_hash;

    console.log('✅ Login successful for:', email, 'Role:', user.role);
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
});

// Logout endpoint
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Log audit entry
    await execute(
      `INSERT INTO audit_logs (user_id, action, timestamp, ip_address, details)
       VALUES ($1, 'logout', NOW(), $2, $3)`,
      [req.user.user_id, req.ip, JSON.stringify({ email: req.user.email })]
    );

    console.log('✅ Logout successful for:', req.user.email);
    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const [users] = await execute(
      `SELECT u.user_id, u.first_name, u.last_name, u.email, u.phone, u.role, u.is_active, u.created_at,
              c.date_of_birth, c.address_1, c.address_2
       FROM users u
       LEFT JOIN customers c ON u.user_id = c.user_id
       WHERE u.user_id = $1`,
      [req.user.user_id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: users[0]
    });

  } catch (error) {
    console.error('❌ Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
});

module.exports = router;