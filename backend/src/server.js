import app from './app.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Environment variables
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.DATABASE_URL;

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    
    // Start server with auto port selection if primary port is busy
    const server = app.listen(PORT)
      .on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`Port ${PORT} is busy, trying alternative port...`);
          // Try a different port
          const altPort = parseInt(PORT) + 1;
          server.listen(altPort);
        } else {
          console.error('Server error:', err);
        }
      })
      .on('listening', () => {
        const address = server.address();
        console.log(`Server running on port ${address.port}`);
      });
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });