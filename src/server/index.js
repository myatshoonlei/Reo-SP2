// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import authRoutes from './routes/authRoutes.js';
// import uploadLogoRoute from './routes/uploadLogo.js';
// import getLogoRoute from './routes/getLogo.js';
// import myselfCardRoute from './routes/myselfCard.js';
// import saveColorRoute from './routes/saveColorRoute.js';

// dotenv.config();

// const app = express();

// app.use(cors({
//   origin: "http://localhost:5173",
//   methods: ["GET", "POST","PUT"],
//   credentials: true
// }));

// app.use(express.json());

// // Route middleware
// app.use('/api', authRoutes);
// app.use('/api/upload-logo', uploadLogoRoute);
// app.use('/api/logo', getLogoRoute);
// app.use('/api/myself-card/', myselfCardRoute);
// app.use('/api/save-color', saveColorRoute);

// app.listen(5000, () => {
//   console.log('Server running on http://localhost:5000');
// });

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import uploadLogoRoute from './routes/uploadLogo.js';
import getLogoRoute from './routes/getLogo.js';
import personalCardRoute from './routes/personalCard.js'; // ✅ your new route file
import saveColorRoute from './routes/saveColorRoute.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT"],
  credentials: true
}));
app.use(express.json());

// Register Routes
app.use('/api', authRoutes); // handles /signup and /login
app.use('/api/upload-logo', uploadLogoRoute);
app.use('/api/logo', getLogoRoute);
app.use('/api/personal-card', personalCardRoute);
app.use('/api/save-color', saveColorRoute);

// Start Server
app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});