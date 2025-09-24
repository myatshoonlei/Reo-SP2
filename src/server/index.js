import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import uploadLogoRoute from './routes/uploadLogo.js';
import getLogoRoute from './routes/getLogo.js';
import personalCardRoute from './routes/personalCard.js';
import teamCardRoutes from './routes/teamCard.js';
import saveColorRoute from './routes/saveColorRoute.js';
import teamInfoRoutes from './routes/teamInfo.js';
import templateRoutes from "./routes/templateRoutes.js";
import cardRoutes from './routes/cardRoutes.js';
import verifyEmailRouter from './routes/verifyEmailRoute.js';
import profilePhotoUploadRouter from './routes/profilePhotoUpload.js';
import contactRoutes from './routes/contactRoute.js';

// If you're on Node < 18, uncomment the next line and `npm i node-fetch`
// import fetch from 'node-fetch';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "https://come-pastor-considered-ends.trycloudflare.com"],

  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));

// Routes
app.use('/api', authRoutes);
app.use('/api/upload-logo', uploadLogoRoute);
app.use('/api/logo', getLogoRoute);
app.use('/api/personal-card', personalCardRoute);
app.use('/api/teamcard', teamCardRoutes);
app.use('/api/save-color', saveColorRoute);
app.use('/api/teamInfo', teamInfoRoutes);
app.use("/api/templates", templateRoutes);
app.use('/api/verify-email', verifyEmailRouter);
app.use("/api/card", cardRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/profile-photo', profilePhotoUploadRouter);

// ---------- Font CSS proxy (used by html-to-image) ----------
app.get('/api/proxy/font-css', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send('Missing url');

  try {
    // (optional safety) allow only Google Fonts
    const parsed = new URL(url);
    if (parsed.host !== 'fonts.googleapis.com') {
      return res.status(400).send('Only fonts.googleapis.com is allowed');
    }

    const r = await fetch(url);           // Node 18+ has global fetch
    if (!r.ok) return res.status(r.status).send('Upstream error');
    const css = await r.text();

    res.set('Content-Type', 'text/css');
    res.set('Cache-Control', 'public, max-age=86400'); // cache 1 day
    res.send(css);
  } catch (e) {
    console.error('Font proxy error:', e);
    res.status(500).send('Proxy failed');
  }
});

// Start Server
app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
