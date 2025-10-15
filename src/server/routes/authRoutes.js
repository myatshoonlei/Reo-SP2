import cors from 'cors';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js';
import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';
import sendVerificationEmail from '../utils/sendVerificationEmail.js';
import { verifyEmail } from '../utils/verifyEmail.js';

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'https://reo-testing.vercel.app', 'https://rca-wiring-adds-unix.trycloudflare.com'],
  credentials: true
}));
app.use(express.json());

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

dotenv.config();

const router = express.Router();


// Signup Route
router.post('/signup', async (req, res) => {
  const BASE = process.env.VITE_PUBLIC_BASE_URL || "http://localhost:5173";
  const { fullname, email, password } = req.body;

  try {
    // 1️⃣ Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }

    // 2️⃣ Check if email already exists
    const existing = await pool.query('SELECT 1 FROM users WHERE email = $1', [email]);
    if (existing.rowCount) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const isValid = await verifyEmail(email);
    if (!isValid) {
      return res.status(400).json({ error: 'Please input a valid email address.' });
    }

    // 3️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4️⃣ Create token with user data
    const token = jwt.sign(
      { fullname, email, password: hashedPassword },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '15m' }
    );



    const link = `${BASE}/verify-email/${token}?redirect=true`;
    await sendVerificationEmail(email, link);


    res.json({ message: 'Verification link sent to your email.' });


  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error.' });
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

    // after creating token...
    res.json({ message: 'Login successful', token, fullname: user.fullname });

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
    let isNewUser = false; // 👈 add this

    if (userResult.rows.length === 0) {
      // Insert new Google user (no password required)
      const insertResult = await pool.query(
        'INSERT INTO users (fullname, email, picture) VALUES ($1, $2, $3) RETURNING *',
        [name, email, picture]
      );
      user = insertResult.rows[0];
      isNewUser = true; // 👈 mark new user
    } else {
      user = userResult.rows[0];
    }


    // Generate token for the user
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.json({ message: 'Google login successful', token, name: user.fullname, isNewUser, });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong with Google auth' });
  }
});

router.post('/verify-email-check', async (req, res) => {
  const { email } = req.body;
  console.log("🔍 Kickbox check for:", email); // This should appear in terminal

  try {
    const isValid = await verifyEmail(email); // your Kickbox-style function
    if (!isValid) {
      return res.status(400).json({ error: 'Please input a valid Gmail account.' });
    }
    res.json({ message: 'Email is valid.' });
  } catch (err) {
    console.error("❌ Kickbox error:", err);
    res.status(500).json({ error: 'Server error during email verification.' });
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


// Resend Verification Route
router.post('/resend-verification', async (req, res) => {
  const { fullname, email, password } = req.body;

  try {
    // Check if user already exists
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (existing.rowCount) {
      const user = existing.rows[0];

      if (user.isverified) {
        return res.status(400).json({ error: 'Email already verified. You can log in.' });
      }

      // Use stored hashed password if available
      const hashedPassword = user.password;
      const name = user.fullname || fullname;

      const token = jwt.sign(
        { fullname: name, email, password: hashedPassword },
        process.env.JWT_SECRET_KEY,
        { expiresIn: '15m' }
      );

      const link = `${BASE}/verify-email/${token}?redirect=true`;

      await sendVerificationEmail(email, link);

      return res.json({ message: 'Verification email resent. Please check your inbox.' });
    }

    // New user — hash password and send token
    const hashedPassword = await bcrypt.hash(password, 10);

    const token = jwt.sign(
      { fullname, email, password: hashedPassword },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '15m' }
    );

    const link = `${BASE}/verify-email/${token}?redirect=true`;
    await sendVerificationEmail(email, link);

    return res.json({ message: 'Verification email sent. Please check your inbox.' });

  } catch (err) {
    console.error('RESEND ERROR:', err);
    return res.status(500).json({ error: 'Failed to resend verification email.' });
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