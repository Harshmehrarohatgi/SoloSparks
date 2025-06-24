import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Load env variables
dotenv.config();

// Set up MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Define Quest schema with updated fields
const questSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  moodTargeted: String,
  frequency: String,
  reflectionPrompts: [{
    question: String,
    type: {
      type: String,
      enum: ['text', 'photo', 'audio', 'any'],
      default: 'text'
    }
  }],
  pointsReward: Number
});

const Quest = mongoose.models.Quest || mongoose.model('Quest', questSchema);

const quests = [
    {
        title: 'Daily Gratitude',
        description: 'Write down three things you are grateful for today. Focusing on gratitude can shift your mindset toward positivity.',
        category: 'Reflection',
        moodTargeted: 'Positive',
        frequency: 'daily',
        reflectionPrompts: [
            { 
                question: "What three things are you grateful for today?", 
                type: 'text' 
            },
            { 
                question: "How did focusing on gratitude affect your mood?", 
                type: 'text' 
            }
        ],
        pointsReward: 10
    },
    {
        title: 'Mindful Breathing',
        description: 'Take 5 minutes to focus entirely on your breath. Count to four as you inhale, hold for four, and exhale for four.',
        category: 'Mindfulness',
        moodTargeted: 'Anxious',
        frequency: 'daily',
        reflectionPrompts: [
            { 
                question: "How did you feel before and after the breathing exercise?", 
                type: 'text' 
            },
            { 
                question: "Where did your mind wander during the exercise?", 
                type: 'text' 
            }
        ],
        pointsReward: 10
    },
    {
        title: 'Weekly Nature Connection',
        description: 'Spend at least 20 minutes in nature this week. Walk in a park, sit under a tree, or simply observe natural elements around you.',
        category: 'Physical',
        moodTargeted: 'Stressed',
        frequency: 'weekly',
        reflectionPrompts: [
            { 
                question: "Capture a photo of something in nature that caught your attention", 
                type: 'photo' 
            },
            { 
                question: "How did connecting with nature influence your mental state?", 
                type: 'text' 
            }
        ],
        pointsReward: 20
    },
    {
        title: 'Morning Affirmations',
        description: 'Start your day by speaking three positive affirmations aloud. For example: "I am capable", "I am worthy", "I am enough".',
        category: 'Mindfulness',
        moodTargeted: 'Sad',
        frequency: 'daily',
        reflectionPrompts: [
            { 
                question: "Record yourself saying your affirmations", 
                type: 'audio' 
            },
            { 
                question: "How did speaking these affirmations make you feel?", 
                type: 'text' 
            }
        ],
        pointsReward: 10
    },
    {
        title: 'Creativity Hour',
        description: 'Dedicate an hour to a creative activity you enjoy - drawing, writing, music, cooking, or any form of creative expression.',
        category: 'Creativity',
        moodTargeted: 'Bored',
        frequency: 'weekly',
        reflectionPrompts: [
            { 
                question: "Share what you created or a photo of your creative process", 
                type: 'photo' 
            },
            { 
                question: "How did engaging in creativity affect your emotional state?", 
                type: 'text' 
            }
        ],
        pointsReward: 20
    },
    {
        title: 'Social Connection',
        description: 'Reach out to someone you care about but haven\'t spoken to recently. Have a meaningful conversation.',
        category: 'Social',
        moodTargeted: 'Lonely',
        frequency: 'weekly',
        reflectionPrompts: [
            { 
                question: "What value did this connection bring to your day?", 
                type: 'text' 
            },
            { 
                question: "What did you learn about yourself or the other person?", 
                type: 'text' 
            }
        ],
        pointsReward: 25
    },
    {
        title: 'Digital Detox',
        description: 'Take a 4-hour break from all digital devices. Notice how you feel without the constant notifications and stimulation.',
        category: 'Mindfulness',
        moodTargeted: 'Overwhelmed',
        frequency: 'weekly',
        reflectionPrompts: [
            { 
                question: "What did you do during your digital-free time?", 
                type: 'text' 
            },
            { 
                question: "How did your mind and body respond to this break?", 
                type: 'text' 
            }
        ],
        pointsReward: 25
    },
    {
        title: 'Monthly Values Review',
        description: 'Reflect on your core values and assess if your daily actions are aligned with them. Identify one area to improve.',
        category: 'Reflection',
        moodTargeted: 'Awareness',
        frequency: 'monthly',
        reflectionPrompts: [
            { 
                question: "What are your top 3 values and how well are you honoring them?", 
                type: 'text' 
            },
            { 
                question: "What specific action will you take this month to better align with your values?", 
                type: 'text' 
            }
        ],
        pointsReward: 50
    },
    {
        title: 'Body Scan Meditation',
        description: 'Find a quiet place to lie down. Starting from your toes and moving upward, focus on each part of your body, noticing sensations without judgment.',
        category: 'Mindfulness',
        moodTargeted: 'Tense',
        frequency: 'daily',
        reflectionPrompts: [
            { 
                question: "Where in your body did you notice tension or discomfort?", 
                type: 'text' 
            },
            { 
                question: "How did you feel after completing the body scan?", 
                type: 'text' 
            }
        ],
        pointsReward: 15
    },
    {
        title: 'Mood Tracking',
        description: 'Track your mood at three points throughout the day, noting any triggers or patterns you observe.',
        category: 'Awareness',
        moodTargeted: 'Any',
        frequency: 'daily',
        reflectionPrompts: [
            { 
                question: "What patterns did you notice in your mood fluctuations today?", 
                type: 'text' 
            },
            { 
                question: "What factors most influenced your mood today?", 
                type: 'text' 
            }
        ],
        pointsReward: 10
    }
];

const seedQuests = async () => {
    try {
        await connectDB();
        await Quest.deleteMany({});
        const insertedQuests = await Quest.insertMany(quests);
        console.log(`${insertedQuests.length} quests seeded successfully!`);
        process.exit(0);
    } catch (error) {
        console.error('Error seeding quests:', error);
        process.exit(1);
    }
};

// Run the seeder
seedQuests();