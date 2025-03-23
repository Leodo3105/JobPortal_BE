import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import errorHandler from './middlewares/error.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Logging middleware in development mode
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Get directory path for serving static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to JobPortal API' });
});

// Serve static files from uploads folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Import Routes
import authRoutes from './routes/auth/authRoutes.js';
import profileRoutes from './routes/jobseeker/profileRoutes.js';
import cvRoutes from './routes/jobseeker/cvRoutes.js';
import jobRoutes from './routes/job/jobRoutes.js';
import applicationRoutes from './routes/job/applicationRoutes.js';
import savedJobRoutes from './routes/job/savedJobRoutes.js';
import companyRoutes from './routes/employer/companyRoutes.js';
import notificationRoutes from './routes/notification/notificationRoutes.js';
import messageRoutes from './routes/chat/messageRoutes.js';
import categoryRoutes from './routes/category/categoryRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';


// Mount Routes
// Auth routes
app.use('/api/auth', authRoutes);

// Jobseeker routes
app.use('/api/profiles', profileRoutes);
app.use('/api/cv', cvRoutes);
app.use('/api/saved-jobs', savedJobRoutes);

// Job routes
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);

// Employer routes
app.use('/api/companies', companyRoutes);

// General routes
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/dashboard', dashboardRoutes);



// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});