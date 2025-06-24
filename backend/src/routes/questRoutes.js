import express from 'express';
import { 
    getPersonalizedQuests, 
    assignQuest, 
    getQuestsForReflection,
    completeQuest
} from '../controllers/questController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Explicitly set response type for all routes
router.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Route to get personalized quests based on user mood/profile
router.get('/', protect, getPersonalizedQuests);

// Route to assign a new quest to a user
router.post('/assign', protect, assignQuest);

// Route to get quests available for reflection
router.get('/reflection-options', protect, getQuestsForReflection);

// Route to mark quest as completed via reflection
router.post('/complete', protect, completeQuest);

export default router;