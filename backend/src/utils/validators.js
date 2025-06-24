const { body, validationResult } = require('express-validator');

const validateRegistration = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

const validateLogin = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
];

const validateUpdateMood = [
    body('mood').notEmpty().withMessage('Mood is required'),
];

const validateUpdateProfile = [
    body('personalityProfile').notEmpty().withMessage('Personality profile is required'),
];

const validateQuestAssignment = [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('moodTargeted').notEmpty().withMessage('Mood targeted is required'),
    body('frequency').isIn(['daily', 'weekly', 'monthly']).withMessage('Frequency must be daily, weekly, or monthly'),
];

const validateReflectionSubmission = [
    body('questId').notEmpty().withMessage('Quest ID is required'),
    body('reflectionText').notEmpty().withMessage('Reflection text is required'),
];

const validateRewardRedemption = [
    body('rewardId').notEmpty().withMessage('Reward ID is required'),
];

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

module.exports = {
    validateRegistration,
    validateLogin,
    validateUpdateMood,
    validateUpdateProfile,
    validateQuestAssignment,
    validateReflectionSubmission,
    validateRewardRedemption,
    validate,
};