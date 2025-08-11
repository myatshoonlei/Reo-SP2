// File: src/server/routes/saveColorRoute.js

import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import pool from '../db.js';

const router = express.Router();

router.post('/', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { cardId, primaryColor, secondaryColor } = req.body;

  // 🆕 Debugging log: What is the server receiving?
  console.log('Received request body:', req.body);

  if (!cardId) {
    return res.status(400).json({ error: 'Card ID is missing from request body.' });
  }

  try {
    if (primaryColor) {
      const query = `UPDATE personal_cards SET primary_color = $1 WHERE id = $2 AND user_id = $3`;
      const values = [primaryColor, cardId, userId];
      
      // 🆕 Debugging log: What query is about to be executed?
      console.log('Executing query:', query);
      console.log('With values:', values);
      
      await pool.query(query, values);
    }

    if (secondaryColor) {
      const query = `UPDATE personal_cards SET secondary_color = $1 WHERE id = $2 AND user_id = $3`;
      const values = [secondaryColor, cardId, userId];
      
      // 🆕 Debugging log: What query is about to be executed?
      console.log('Executing query:', query);
      console.log('With values:', values);
      
      await pool.query(query, values);
    }

    res.json({ message: 'Color(s) saved successfully!' });
  } catch (err) {
    console.error('Save color error:', err);
    res.status(500).json({ error: 'Failed to save color' });
  }
});

export default router;