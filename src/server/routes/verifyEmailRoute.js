// routes/verifyEmailRoute.js
import express from 'express';
import { verifyEmail } from '../utils/verifyEmail.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'email required' });

  try {
    const isDeliverable = await verifyEmail(email); // <--- use your existing function
    return res.json({ isDeliverable });
  } catch (e) {
    console.error('verify-email failed:', e);
    return res.status(502).json({ error: 'verification_failed' });
  }
});

router.get('/ping', (_req, res) => res.json({ ok: true }));

export default router;