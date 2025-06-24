import express from 'express';
import { getCurrentUser, updateUserMood, updateUserProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get current user profile
router.get('/me', protect, getCurrentUser);

// Update current mood
router.patch('/updateMood', protect, updateUserMood);

// Update personality and preferences
router.patch('/updateProfile', protect, updateUserProfile);

export default router;