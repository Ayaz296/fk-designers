const express = require('express');
const { body, validationResult } = require('express-validator');
const { execute } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all customers (Admin/Staff only)
router.get('/customers', authenticateToken, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const [customers] = await execute(`
      SELECT 
        u.user_id, u.first_name, u.last_name, u.email, u.phone, u.is_active, u.created_at,
        c.customer_id, c.date_of_birth, c.address_1, c.address_2
      FROM users u
      INNER JOIN customers c ON u.user_id = c.user_id
      WHERE u.role = 'customer'
      ORDER BY u.created_at DESC
    `);

    res.json({
      success: true,
      data: customers
    });

  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customers'
    });
  }
});

// Get all staff (Admin only)
router.get('/staff', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const [staff] = await execute(`
      SELECT 
        u.user_id, u.first_name, u.last_name, u.email, u.phone, u.role, u.is_active, u.created_at,
        s.staff_id, s.position, s.department, s.start_date
      FROM users u
      INNER JOIN staff s ON u.user_id = s.user_id
      WHERE u.role IN ('staff', 'admin')
      ORDER BY u.created_at DESC
    `);

    res.json({
      success: true,
      data: staff
    });

  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch staff'
    });
  }
});

// Update user status (Admin only)
router.patch('/:userId/status', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { userId } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'is_active must be a boolean value'
      });
    }

    // Check if user exists
    const [users] = await execute(
      'SELECT user_id, email FROM users WHERE user_id = $1',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];

    // Update user status
    await execute(
      'UPDATE users SET is_active = $1, updated_at = NOW() WHERE user_id = $2',
      [is_active, userId]
    );

    // Log audit entry
    await execute(
      `INSERT INTO audit_logs (user_id, action, timestamp, ip_address, details)
       VALUES ($1, 'update_user_status', NOW(), $2, $3)`,
      [req.user.user_id, req.ip, JSON.stringify({ 
        target_user_id: userId, 
        target_email: user.email, 
        new_status: is_active 
      })]
    );

    res.json({
      success: true,
      message: `User ${is_active ? 'activated' : 'deactivated'} successfully`
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
});

// Get audit logs (Admin only)
router.get('/audit-logs', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 50, user_id, action } = req.query;

    let whereConditions = [];
    let queryParams = [];

    if (user_id) {
      whereConditions.push('al.user_id = ?');
      queryParams.push(user_id);
    }

    if (action) {
      whereConditions.push('al.action = ?');
      queryParams.push(action);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Calculate pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM audit_logs al 
      LEFT JOIN users u ON al.user_id = u.user_id 
      ${whereClause}
    `;
    const [countResult] = await execute(countQuery, queryParams);
    const total = countResult[0].total;

    // Get audit logs
    const logsQuery = `
      SELECT 
        al.log_id, al.user_id, al.action, al.timestamp, al.ip_address, al.details,
        u.first_name, u.last_name, u.email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.user_id
      ${whereClause}
      ORDER BY al.timestamp DESC
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;

    const [logs] = await execute(logsQuery, [...queryParams, parseInt(limit), offset]);

    // Parse JSON details
    const formattedLogs = logs.map(log => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : null
    }));

    res.json({
      success: true,
      data: {
        logs: formattedLogs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs'
    });
  }
});

module.exports = router;