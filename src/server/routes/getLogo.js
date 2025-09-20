import express from 'express';
import pool from '../db.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// routes/getLogo.js
router.get('/:cardId', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];
    const { id: userId } = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const cardId = parseInt(req.params.cardId, 10);
    const result = await pool.query(
      'SELECT logo FROM personal_cards WHERE id=$1 AND user_id=$2',
      [cardId, userId]
    );

    const imageBuffer = result.rows[0]?.logo;
    if (!imageBuffer) return res.status(404).json({ error: 'No logo found' });

    res.set('Content-Type', 'image/jpeg');
    res.send(imageBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch logo' });
  }
});

export default router;