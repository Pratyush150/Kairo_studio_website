import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Get all services
router.get('/services', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM services ORDER BY display_order ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// Get all demos
router.get('/demos', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM demos ORDER BY display_order ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching demos:', error);
    res.status(500).json({ error: 'Failed to fetch demos' });
  }
});

// Get content block by section
router.get('/blocks/:section', async (req, res) => {
  try {
    const { section } = req.params;
    const result = await pool.query(
      'SELECT * FROM content_blocks WHERE section = $1',
      [section]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching content blocks:', error);
    res.status(500).json({ error: 'Failed to fetch content blocks' });
  }
});

// Get specific content block
router.get('/blocks/:section/:key', async (req, res) => {
  try {
    const { section, key } = req.params;
    const result = await pool.query(
      'SELECT * FROM content_blocks WHERE section = $1 AND key = $2',
      [section, key]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Content block not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching content block:', error);
    res.status(500).json({ error: 'Failed to fetch content block' });
  }
});

export default router;
