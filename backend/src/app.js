import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import questRoutes from './routes/questRoutes.js';
import reflectionRoutes from './routes/reflectionRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5174', 'http://127.0.0.1:5173', '*'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// Increase payload size limits - ADD THIS BEFORE OTHER MIDDLEWARE
app.use(express.json({ limit: '50mb' }));  // Increase JSON payload size limit
app.use(express.urlencoded({ extended: true, limit: '50mb' }));  // Increase URL-encoded payload size

// Default route
app.get('/', (req, res) => {
  res.json({ message: 'Solo Sparks API is running' });
});

// Add a global response check middleware
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function(body) {
    // If body is undefined or null, send an empty object/array instead
    if (body === undefined || body === null) {
      return originalJson.call(this, {});
    }
    return originalJson.call(this, body);
  };
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/reflections', reflectionRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  // Special handler for payload size errors
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ 
      message: 'File too large', 
      error: 'The uploaded file exceeds the size limit. Please use a smaller file.' 
    });
  }
  
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Server error', error: err.message });
});

// Database connection
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

export default app;