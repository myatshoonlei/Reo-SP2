import express from 'express';
import multer from 'multer';
import pool from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', verifyToken, upload.single('profile'), async (req, res) => {
  try {
    const userId = req.user.id;
    const fileBuffer = req.file?.buffer;
    const { cardId } = req.body;

    if (!fileBuffer) return res.status(400).json({ error: 'No photo uploaded' });

    // Update the profile_photo column for the user's card
    const sql = `UPDATE personal_cards
                 SET profile_photo = $1
                 WHERE id = $2 AND user_id = $3`;
    const params = [fileBuffer, cardId, userId];

    await pool.query(sql, params);
    return res.status(200).json({ message: 'Profile photo uploaded successfully!' });
  } catch (err) {
    console.error('SERVER-SIDE UPLOAD ERROR:', err);
    return res.status(500).json({ error: 'Server error while uploading profile photo' });
  }
});

export default router; 