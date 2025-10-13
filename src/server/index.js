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

  origin: ["http://localhost:5173","https://longitude-reconstruction-sticky-priced.trycloudflare.com"],


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

// ---------- PROXY ENDPOINTS FOR MOBILE BUSINESS CARD FIX ----------

// Image proxy to handle CORS issues for business card generation
app.get('/api/proxy/image', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    console.log('Proxying image request for:', url);
    
    // Add timeout and better headers
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    
    // Validate that it's actually an image
    if (!contentType || !contentType.startsWith('image/')) {
      throw new Error('URL does not point to a valid image');
    }

    // Get the image data as array buffer for better handling
    const imageBuffer = Buffer.from(await response.arrayBuffer());

    // Set appropriate headers for CORS and caching
    res.set({
      'Content-Type': contentType,
      'Content-Length': imageBuffer.length,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      'Expires': new Date(Date.now() + 86400000).toUTCString(),
    });

    res.send(imageBuffer);

  } catch (error) {
    console.error('Image proxy error:', error);
    
    // Handle different types of errors
    if (error.name === 'AbortError') {
      res.status(408).json({ 
        error: 'Request timeout',
        details: 'Image took too long to load' 
      });
    } else if (error.message.includes('Failed to fetch')) {
      res.status(502).json({ 
        error: 'Failed to fetch image from source',
        details: error.message 
      });
    } else {
      res.status(500).json({ 
        error: 'Internal server error while proxying image',
        details: error.message 
      });
    }
  }
});

// Font CSS proxy (existing one, enhanced)
app.get('/api/proxy/font-css', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing url parameter' });

  try {
    // Optional safety check - only allow Google Fonts
    const parsed = new URL(url);
    if (parsed.host !== 'fonts.googleapis.com') {
      return res.status(400).json({ error: 'Only fonts.googleapis.com is allowed' });
    }

    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/css,*/*;q=0.1',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: 'Upstream error',
        details: `HTTP ${response.status}: ${response.statusText}` 
      });
    }

    const css = await response.text();

    res.set({
      'Content-Type': 'text/css',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=86400', // cache 1 day
      'Expires': new Date(Date.now() + 86400000).toUTCString(),
    });

    res.send(css);

  } catch (error) {
    console.error('Font CSS proxy error:', error);
    
    if (error.name === 'AbortError') {
      res.status(408).json({ error: 'Request timeout' });
    } else {
      res.status(500).json({ 
        error: 'Proxy failed',
        details: error.message 
      });
    }
  }
});

// Health check endpoint for the proxy services
app.get('/api/proxy/health', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Proxy services are running',
    timestamp: new Date().toISOString() 
  });
});

// Start Server
app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});