import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js';
import dotenv from 'dotenv';



dotenv.config();

const router = express.Router();



// Signup Route
router.post('/signup', async (req, res) => {
  const { fullname, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (fullname, email, password) VALUES ($1, $2, $3) RETURNING *',
      [fullname, email, hashedPassword]
    );

    const token = jwt.sign(
      { id: result.rows[0].id, email: result.rows[0].email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.json({ message: 'Account created successfully!', token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Email not found' });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.json({ message: 'Login successful', token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Google Auth Route
router.post('/google-auth', async (req, res) => {
  const { name, email, picture } = req.body;

  try {
    // Check if user already exists
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    let user;

    if (userResult.rows.length === 0) {
      // Insert new Google user (no password required)
      const insertResult = await pool.query(
        'INSERT INTO users (fullname, email, picture) VALUES ($1, $2, $3) RETURNING *',
        [name, email, picture]
      );
      user = insertResult.rows[0];
    } else {
      user = userResult.rows[0];
    }

    // Generate token for the user
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.json({ message: 'Google login successful', token, name: user.fullname });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong with Google auth' });
  }
});

// Verification Route
router.get('/verify-email/:token', async (req, res) => {
  const { token } = req.params;

  try {
    // 🔓 Decode token first
    const { fullname, email, password } = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // 🔍 Check if user already exists
    const existing = await pool.query('SELECT * FROM users WHERE email=$1', [email]);

    if (existing.rowCount) {
      const user = existing.rows[0];

      if (user.isverified) {
        return res.status(200).json({ message: 'Email already verified. You can log in.' });
      }

      // ✅ If user exists but not verified, update them
      await pool.query(
        'UPDATE users SET fullname=$1, password=$2, isverified=TRUE WHERE email=$3',
        [fullname, password, email]
      );
    } else {
      // 🆕 If user doesn't exist, insert them
      await pool.query(
        'INSERT INTO users (fullname, email, password, isverified) VALUES ($1,$2,$3,TRUE)',
        [fullname, email, password]
      );
    }

    // ✅ Now check if token was used
    const used = await pool.query('SELECT 1 FROM used_tokens WHERE token=$1', [token]);
    if (used.rowCount) {
      return res.status(400).json({ error: 'This link has already been used.' });
    }

    // 📝 Mark token as used
    await pool.query('INSERT INTO used_tokens (token) VALUES ($1)', [token]);

    return res.status(200).json({ message: 'Email verified successfully! You can now log in.' });

  } catch (err) {
    console.error('VERIFY ERROR:', err);
    return res.status(400).json({ error: 'Invalid or expired verification link.' });
  }
});

router.get('/check-verification', async (req, res) => {
  const { email } = req.query;
  try {
    const result = await pool.query('SELECT isverified FROM users WHERE email = $1', [email]);
    const isverified = result.rows[0]?.isverified || false;
    res.json({ isverified });
  } catch (err) {
    console.error("Check verification error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;