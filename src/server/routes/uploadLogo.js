// routes/uploadLogo.js
import express from 'express';
import multer from 'multer';
import pool from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// routes/uploadLogo.js
router.post('/', verifyToken, upload.single('logo'), async (req, res) => {
  try {
    const userId = req.user.id;
    const fileBuffer = req.file?.buffer;
    const { cardType, cardId, teamId } = req.body;

    if (!fileBuffer) return res.status(400).json({ error: 'No logo uploaded' });

    if (cardType === 'Myself') {
      const idNum = parseInt(cardId, 10);
      if (!idNum) return res.status(400).json({ error: 'cardId required' });

      const result = await pool.query(
        `UPDATE personal_cards SET logo = $1 WHERE id = $2 AND user_id = $3`,
        [fileBuffer, idNum, userId]
      );
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'card not found or not owned by user' });
      }
    } else if (cardType === 'Team') {
      const teamNum = parseInt(teamId, 10);
      if (!teamNum) return res.status(400).json({ error: 'teamId required' });

      const result = await pool.query(
        `UPDATE team_cards SET logo = $1 WHERE id = $2`,
        [fileBuffer, teamNum]
      );
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'team card not found' });
      }
    } else {
      return res.status(400).json({ error: 'Invalid card type' });
    }

    return res.json({ message: 'Logo uploaded successfully!' });
  } catch (err) {
    console.error('SERVER-SIDE UPLOAD ERROR:', err);
    return res.status(500).json({ error: 'Server error while uploading logo' });
  }
});


export default router;