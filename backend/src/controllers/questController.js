import Quest from '../models/Quest.js';
import User from '../models/User.js';
import Reflection from '../models/Reflection.js';
import mongoose from 'mongoose';

// Temporary solution with hardcoded quests
export const getPersonalizedQuests = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if there are actual quests in the DB
        const dbQuests = await Quest.find({}).lean();
        
        // If DB has quests, return those
        if (dbQuests && dbQuests.length > 0) {
            return res.status(200).json(dbQuests.map(quest => ({
                ...quest,
                completed: false
            })));
        }
        
        // Otherwise return hardcoded quests
        const hardcodedQuests = [
            {
                _id: new mongoose.Types.ObjectId().toString(),
                title: "Daily Gratitude",
                description: "Write down three things you are grateful for today.",
                category: "Reflection",
                moodTargeted: "Positive",
                frequency: "daily",
                reflectionPrompts: [
                    { question: "What three things are you grateful for today?", type: "text" },
                    { question: "How did focusing on gratitude affect your mood?", type: "text" }
                ],
                pointsReward: 10,
                completed: false
            },
            {
                _id: new mongoose.Types.ObjectId().toString(),
                title: "Mindful Breathing",
                description: "Take 5 minutes to focus on your breath.",
                category: "Mindfulness",
                moodTargeted: "Anxious",
                frequency: "daily",
                reflectionPrompts: [
                    { question: "How did you feel before and after?", type: "text" }
                ],
                pointsReward: 10,
                completed: false
            },
            {
                _id: new mongoose.Types.ObjectId().toString(),
                title: "Weekly Nature Connection",
                description: "Spend time in nature this week.",
                category: "Physical",
                moodTargeted: "Stressed",
                frequency: "weekly",
                reflectionPrompts: [
                    { question: "Capture a photo of nature", type: "photo" }
                ],
                pointsReward: 20,
                completed: false
            }
        ];
        
        return res.status(200).json(hardcodedQuests);
    } catch (error) {
        console.error('Error in getPersonalizedQuests:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Assign a new quest to a user
export const assignQuest = async (req, res) => {
    try {
        const { questId } = req.body;
        
        if (!questId) {
            return res.status(400).json({ message: 'Quest ID is required' });
        }
        
        // Check if quest exists
        const quest = await Quest.findById(questId);
        if (!quest) {
            return res.status(404).json({ message: 'Quest not found' });
        }
        
        // Get user
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Check if user already has this quest assigned
        const alreadyAssigned = user.completedQuests.some(
            q => q.questId.toString() === questId
        );
        
        if (alreadyAssigned) {
            return res.status(400).json({ 
                message: 'This quest is already assigned to you',
                quest: quest 
            });
        }
        
        // Assign the quest (add to user's completedQuests array)
        user.completedQuests.push({
            questId: quest._id,
            assignedAt: new Date(),
            completedAt: null // Will be updated when a reflection is submitted
        });
        
        await user.save();
        
        res.status(200).json({ 
            message: 'Quest assigned successfully',
            quest: quest
        });
    } catch (error) {
        console.error('Error in assignQuest:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get quests available for reflection
export const getQuestsForReflection = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Get all assigned quests (need to handle case where completedQuests might be empty)
        const assignedQuestIds = (user.completedQuests || [])
            .filter(q => !q.completedAt)
            .map(q => q.questId);
            
        if (!assignedQuestIds || assignedQuestIds.length === 0) {
            // If no assigned quests, just return available quests by mood
            const availableQuests = await Quest.find({
                moodTargeted: { 
                    $in: [
                        user.mood?.current || 'Awareness',
                        'Any'
                    ] 
                }
            }).limit(5).lean();
            
            return res.status(200).json(availableQuests || []);
        }
            
        // Get the actual quest objects for assigned quests
        const assignedQuests = await Quest.find({
            _id: { $in: assignedQuestIds }
        }).lean();
            
        // Also include some available quests that match the user's current mood
        const otherQuests = await Quest.find({
            moodTargeted: { 
                $in: [
                    user.mood?.current || 'Awareness',
                    'Any'
                ] 
            },
            _id: { $nin: assignedQuestIds }
        }).limit(3).lean();
        
        const allAvailableQuests = [...(assignedQuests || []), ...(otherQuests || [])];
        
        // Always return a JSON array, even if empty
        return res.status(200).json(allAvailableQuests || []);
    } catch (error) {
        console.error('Error in getQuestsForReflection:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Mark a quest as completed via reflection
export const completeQuest = async (req, res) => {
    try {
        const { questId, reflectionId } = req.body;
        
        if (!questId || !reflectionId) {
            return res.status(400).json({ message: 'Quest ID and Reflection ID are required' });
        }
        
        // Update the user's completedQuests array
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Find the quest in user's completedQuests
        const questIndex = user.completedQuests.findIndex(
            q => q.questId.toString() === questId
        );
        
        if (questIndex === -1) {
            // If quest wasn't previously assigned, add it now
            user.completedQuests.push({
                questId,
                assignedAt: new Date(),
                completedAt: new Date(),
                reflectionId
            });
        } else {
            // Update the existing quest
            user.completedQuests[questIndex].completedAt = new Date();
            user.completedQuests[questIndex].reflectionId = reflectionId;
        }
        
        // Get quest to determine points
        const quest = await Quest.findById(questId);
        if (quest) {
            // Award points based on quest type
            const pointsEarned = quest.pointsReward || 
                (quest.frequency === 'daily' ? 10 : 
                 quest.frequency === 'weekly' ? 20 : 
                 quest.frequency === 'monthly' ? 50 : 10);
                 
            user.points = (user.points || 0) + pointsEarned;
        }
        
        await user.save();
        
        res.status(200).json({ 
            message: 'Quest completed successfully',
            points: user.points
        });
    } catch (error) {
        console.error('Error in completeQuest:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};