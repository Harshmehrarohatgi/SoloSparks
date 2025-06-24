import User from '../models/User.js';

export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateUserMood = async (req, res) => {
    const { mood } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.mood = mood;
        await user.save();
        res.json({ message: 'Mood updated successfully', mood: user.mood });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateUserProfile = async (req, res) => {
    const { personalityProfile } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.personalityProfile = personalityProfile;
        await user.save();
        res.json({ message: 'Profile updated successfully', personalityProfile: user.personalityProfile });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};