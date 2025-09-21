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


dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));

// Register Routes
app.use('/api', authRoutes); // handles /signup and /login
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

// Start Server
app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});