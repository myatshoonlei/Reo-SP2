import path from 'path';
import { fileURLToPath } from 'url';



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

// If you're on Node < 18, uncomment and install node-fetch
// import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load backend .env only in local dev (Render uses dashboard env)
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.join(__dirname, '.env') });
}

const app = express();
app.set('trust proxy', 1);

// ---- CORS (allow dev + prod FE) ----
const allowedOrigins = [
  'http://localhost:5173',
  'https://reo-testing.vercel.app',
  'https://reo-deploy-test.onrender.com',
  "https://rca-wiring-adds-unix.trycloudflare.com"
  // add your real FE domains below (pick the one you use)
  
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // curl/Postman
    try {
      const ok =
        allowedOrigins.includes(origin) ||
        /\.trycloudflare\.com$/i.test(new URL(origin).host); // dev tunnel
      return cb(ok ? null : new Error('Not allowed by CORS'), ok);
    } catch {
      return cb(new Error('Bad origin'), false);
    }
  },
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));

// ---- Routes ----
app.use('/api', authRoutes);
app.use('/api/upload-logo', uploadLogoRoute);
app.use('/api/logo', getLogoRoute);
app.use('/api/personal-card', personalCardRoute);
app.use('/api/teamcard', teamCardRoutes);
app.use('/api/save-color', saveColorRoute);
app.use('/api/teamInfo', teamInfoRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/verify-email', verifyEmailRouter);
app.use('/api/card', cardRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/profile-photo', profilePhotoUploadRouter);

// ---- Proxy: images ----
app.get('/api/proxy/image', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'URL parameter is required' });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) throw new Error('URL does not point to a valid image');

    const imageBuffer = Buffer.from(await response.arrayBuffer());

    res.set({
      'Content-Type': contentType,
      'Content-Length': imageBuffer.length,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'public, max-age=86400',
      'Expires': new Date(Date.now() + 86400000).toUTCString(),
    });
    res.send(imageBuffer);
  } catch (error) {
    console.error('Image proxy error:', error);
    if (error.name === 'AbortError') {
      res.status(408).json({ error: 'Request timeout', details: 'Image took too long to load' });
    } else {
      res.status(502).json({ error: 'Failed to fetch image from source', details: error.message });
    }
  }
});

// ---- Proxy: Google Fonts CSS ----
app.get('/api/proxy/font-css', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing url parameter' });

  try {
    const parsed = new URL(url);
    if (parsed.host !== 'fonts.googleapis.com') {
      return res.status(400).json({ error: 'Only fonts.googleapis.com is allowed' });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/css,*/*;q=0.1' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Upstream error', details: `HTTP ${response.status}: ${response.statusText}` });
    }

    const css = await response.text();
    res.set({
      'Content-Type': 'text/css',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=86400',
      'Expires': new Date(Date.now() + 86400000).toUTCString(),
    });
    res.send(css);
  } catch (error) {
    console.error('Font CSS proxy error:', error);
    res.status(500).json({ error: 'Proxy failed', details: error.message });
  }
});

// ---- Health checks ----
app.get('/healthz', (_req, res) => res.send('ok'));
app.get('/api/proxy/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Proxy services are running', timestamp: new Date().toISOString() });
});

// ---- Start ----
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


