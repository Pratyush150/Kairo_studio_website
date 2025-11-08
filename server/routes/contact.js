import express from 'express';
import pool from '../config/database.js';
import Joi from 'joi';

const router = express.Router();

// Validation schema
const contactSchema = Joi.object({
  name: Joi.string().required().min(2).max(255),
  email: Joi.string().email().required(),
  company: Joi.string().allow('').max(255),
  phone: Joi.string().allow('').max(50),
  service: Joi.string().required().max(100),
  message: Joi.string().required().min(10),
  budget: Joi.string().allow('').max(50),
  timeline: Joi.string().allow('').max(50)
});

// Submit contact form
router.post('/', async (req, res) => {
  try {
    // Validate input
    const { error, value } = contactSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const {
      name,
      email,
      company,
      phone,
      service,
      message,
      budget,
      timeline
    } = value;

    // Get client info
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    // Insert into database
    const result = await pool.query(
      `INSERT INTO contact_submissions
       (name, email, company, phone, service, message, budget, timeline, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, submitted_at`,
      [name, email, company, phone, service, message, budget, timeline, ipAddress, userAgent]
    );

    // Here you could add email notification logic using nodemailer
    // await sendNotificationEmail({ name, email, message });

    res.status(201).json({
      success: true,
      message: 'Your inquiry has been submitted successfully! We\'ll get back to you within 24 hours.',
      submissionId: result.rows[0].id
    });

  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({ error: 'Failed to submit form. Please try again.' });
  }
});

// Get all submissions (admin endpoint - should be protected in production)
router.get('/submissions', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM contact_submissions ORDER BY submitted_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

export default router;
