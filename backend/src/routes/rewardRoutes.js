import express from 'express';
import { getAllRewards, redeemReward } from '../controllers/rewardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get all rewards
// @route   GET /api/rewards
// @access  Private
router.get('/', protect, getAllRewards);

// @desc    Redeem a reward
// @route   POST /api/rewards/redeem
// @access  Private
router.post('/redeem', protect, redeemReward);

export default router;