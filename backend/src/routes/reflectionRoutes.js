import express from 'express';
import { 
  submitReflection, 
  getUserReflections, 
  getReflection 
} from '../controllers/reflectionController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Submit a reflection with file upload
router.post('/', 
  protect,
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'audio', maxCount: 1 }
  ]),
  submitReflection
);

// Get all user reflections 
router.get('/', protect, getUserReflections);

// Get a specific reflection
router.get('/:id', protect, getReflection);

export default router;