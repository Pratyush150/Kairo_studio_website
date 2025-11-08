import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Get all projects
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM projects ORDER BY display_order ASC, created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get featured projects
router.get('/featured', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM projects WHERE featured = true ORDER BY display_order ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching featured projects:', error);
    res.status(500).json({ error: 'Failed to fetch featured projects' });
  }
});

// Get single project by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await pool.query(
      'SELECT * FROM projects WHERE slug = $1',
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

export default router;
