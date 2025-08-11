import express from 'express';
import multer from 'multer';
import pool from '../db.js';
import jwt from 'jsonwebtoken';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', verifyToken, upload.single('logo'), async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request file:', req.file); // <-- Add this line
    
    const userId = req.user.id; // ✅ Use the middleware result

    const fileBuffer = req.file?.buffer;
    if (!fileBuffer) return res.status(400).json({ error: 'No logo uploaded' });

    await pool.query(
      'UPDATE personal_cards SET logo = $1 WHERE user_id = $2',
      [fileBuffer, userId]
    );
    res.status(200).json({ message: 'Logo uploaded successfully!' });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Server error while uploading logo' });
  }
});


export default router;