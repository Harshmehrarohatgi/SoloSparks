import Reward from '../models/Reward.js';
import User from '../models/User.js';

// @desc    Get all rewards
// @route   GET /api/rewards
// @access  Public
export const getAllRewards = async (req, res) => {
    try {
        const rewards = await Reward.find({ isActive: true });
        res.status(200).json(rewards);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Redeem a reward
// @route   POST /api/rewards/redeem
// @access  Private
export const redeemReward = async (req, res) => {
    const { rewardId } = req.body;
    try {
        const user = await User.findById(req.user.id);
        const reward = await Reward.findById(rewardId);

        if (!reward || !reward.isActive) {
            return res.status(404).json({ message: 'Reward not found' });
        }

        if (user.points < reward.pointsRequired) {
            return res.status(400).json({ message: 'Not enough points to redeem this reward' });
        }

        user.points -= reward.pointsRequired;
        await user.save();

        res.status(200).json({ message: 'Reward redeemed successfully', reward });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};