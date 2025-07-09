const express = require('express');
const { body, validationResult } = require('express-validator');
const { execute } = require('../config/database');

const router = express.Router();

// Input validation rules
const contactValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).escape(),
  body('email').isEmail().normalizeEmail(),
  body('phone').optional().isLength({ min: 10, max: 15 }).matches(/^[\+]?[0-9\s\-\(\)]+$/),
  body('subject').trim().isLength({ min: 2, max: 200 }).escape(),
  body('message').trim().isLength({ min: 10, max: 1000 }).escape()
];

const customizationValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).escape(),
  body('email').isEmail().normalizeEmail(),
  body('phone').isLength({ min: 10, max: 15 }).matches(/^[\+]?[0-9\s\-\(\)]+$/),
  body('serviceType').isIn(['custom-tailoring', 'fabric-selection', 'design-consultation', 'alterations']),
  body('description').trim().isLength({ min: 10, max: 1000 }).escape(),
  body('budget').optional().trim().escape(),
  body('timeline').optional().trim().escape(),
  body('measurements').optional().trim().isLength({ max: 1000 }).escape()
];

// Contact form submission
router.post('/contact', contactValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, phone, subject, message } = req.body;

    // Insert contact inquiry
    const [result] = await execute(
      `INSERT INTO contact_inquiries (name, email, phone, subject, message, ip_address, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING inquiry_id`,
      [name, email, phone || null, subject, message, req.ip]
    );

    res.status(201).json({
      success: true,
      message: 'Contact inquiry submitted successfully',
      data: { inquiry_id: result[0].inquiry_id }
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact inquiry'
    });
  }
});

// Customization request submission
router.post('/customization', customizationValidation, async (req, res) => {
  try {
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
      email,
      phone,
      serviceType,
      description,
      budget,
      timeline,
      measurements
    } = req.body;

    // Insert customization request
    const [result] = await execute(
      `INSERT INTO customization_requests (
        name, email, phone, service_type, description, budget, timeline, measurements, ip_address, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) RETURNING request_id`,
      [name, email, phone, serviceType, description, budget || null, timeline || null, measurements || null, req.ip]
    );

    res.status(201).json({
      success: true,
      message: 'Customization request submitted successfully',
      data: { request_id: result[0].request_id }
    });

  } catch (error) {
    console.error('Customization request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit customization request'
    });
  }
});

module.exports = router;