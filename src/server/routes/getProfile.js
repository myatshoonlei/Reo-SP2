import express from 'express';
import pool from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/personal-card/:cardId/profile-photo
 * auth: Bearer token
 */
router.get('/:cardId/profile-photo', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { cardId } = req.params;

    const result = await pool.query(
      `SELECT profile_photo FROM personal_cards
       WHERE id = $1 AND user_id = $2`,
      [cardId, userId]
    );

    const imageBuffer = result.rows[0]?.profile_photo;
    if (!imageBuffer) {
      return res.status(404).json({ error: 'No profile photo found' });
    }

    res.set('Content-Type', 'image/jpeg');
    res.send(imageBuffer);
  } catch (err) {
    console.error('GET PROFILE PHOTO ERROR:', err);
    res.status(500).json({ error: 'Failed to fetch profile photo' });
  }
});

export default router;