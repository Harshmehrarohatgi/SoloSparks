import Reflection from '../models/Reflection.js';
import User from '../models/User.js';
import Quest from '../models/Quest.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

// Submit a reflection
export const submitReflection = async (req, res) => {
    try {
        console.log('Reflection submission received');
        console.log('Request body:', req.body);
        console.log('Files:', req.files);
        
        const { questId, reflectionText, moodBefore, moodAfter, photoBase64, audioBase64 } = req.body;
        const userId = req.user.id;

        // Validate required fields
        if (!questId || !reflectionText || !moodBefore || !moodAfter) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        let photoUrl = null;
        let audioUrl = null;

        // Process base64 image if provided
        if (photoBase64) {
            try {
                // Upload to Cloudinary if configured, otherwise use placeholder
                if (process.env.CLOUDINARY_CLOUD_NAME) {
                    const photoUploadResult = await cloudinary.uploader.upload(photoBase64, {
                        folder: 'reflections/photos'
                    });
                    photoUrl = photoUploadResult.secure_url;
                } else {
                    // Use placeholder URL in development
                    photoUrl = 'https://via.placeholder.com/300x200?text=Reflection+Photo';
                }
            } catch (uploadError) {
                console.error('Error uploading photo:', uploadError);
                // Continue without the photo
            }
        }

        // Process base64 audio if provided
        if (audioBase64) {
            try {
                // Upload to Cloudinary if configured, otherwise use placeholder
                if (process.env.CLOUDINARY_CLOUD_NAME) {
                    const audioUploadResult = await cloudinary.uploader.upload(audioBase64, {
                        resource_type: 'auto',
                        folder: 'reflections/audio'
                    });
                    audioUrl = audioUploadResult.secure_url;
                } else {
                    // Use placeholder URL in development
                    audioUrl = 'https://example.com/placeholder-audio.mp3';
                }
            } catch (uploadError) {
                console.error('Error uploading audio:', uploadError);
                // Continue without the audio
            }
        }

        // Create and save the reflection
        const reflection = new Reflection({
            questId,
            userId,
            reflectionText,
            photoUrl,
            audioUrl,
            moodBefore,
            moodAfter,
            submittedAt: new Date(),
        });

        const savedReflection = await reflection.save();
        console.log('Reflection saved to database');

        // Update user's mood
        await User.findByIdAndUpdate(userId, {
            'mood.current': moodAfter,
            $push: {
                'mood.previousMoods': {
                    mood: moodBefore,
                    timestamp: new Date()
                }
            }
        });
        console.log('User mood updated');

        // Find the quest to calculate points
        const quest = await Quest.findById(questId);
        
        // Calculate points reward (default 10 if quest not found)
        const pointsReward = quest?.pointsReward || 10;
        
        // Update user points and mark quest as completed
        await User.findOneAndUpdate(
            { _id: userId },
            {
                $inc: { points: pointsReward },
                $set: {
                    'completedQuests.$[elem].completedAt': new Date(),
                    'completedQuests.$[elem].reflectionId': savedReflection._id
                }
            },
            {
                arrayFilters: [{ 'elem.questId': questId }],
                new: true
            }
        );
        console.log('User points updated');

        // Populate quest details before returning
        const populatedReflection = await Reflection.findById(savedReflection._id)
            .populate('questId', 'title category frequency')
            .lean();

        res.status(201).json({
            message: `Reflection submitted successfully! You've earned ${pointsReward} points!`,
            reflection: populatedReflection,
            pointsEarned: pointsReward
        });
    } catch (error) {
        console.error('Error submitting reflection:', error);
        res.status(500).json({ 
            message: 'Failed to submit reflection', 
            error: error.message 
        });
    }
};

// Get user reflections
export const getUserReflections = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const reflections = await Reflection.find({ userId })
            .populate('questId', 'title category frequency')
            .sort({ submittedAt: -1 })
            .lean();
            
        res.status(200).json(reflections);
    } catch (error) {
        console.error('Error fetching reflections:', error);
        res.status(500).json({ message: 'Failed to retrieve reflections', error: error.message });
    }
};

// Get a single reflection
export const getReflection = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        const reflection = await Reflection.findOne({ _id: id, userId })
            .populate('questId', 'title description category frequency')
            .lean();
            
        if (!reflection) {
            return res.status(404).json({ message: 'Reflection not found' });
        }
        
        res.status(200).json(reflection);
    } catch (error) {
        console.error('Error fetching reflection:', error);
        res.status(500).json({ message: 'Failed to retrieve reflection', error: error.message });
    }
};