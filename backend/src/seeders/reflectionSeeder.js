import mongoose from 'mongoose';
import dotenv from 'dotenv';

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

// Define schemas for all models needed
const reflectionSchema = new mongoose.Schema({
  questId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quest',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reflectionText: {
    type: String,
    required: true
  },
  photoUrl: {
    type: String,
    default: null
  },
  audioUrl: {
    type: String,
    default: null
  },
  moodBefore: {
    type: String,
    required: true
  },
  moodAfter: {
    type: String,
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Define user schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  personalityProfile: {
    traits: [String],
    interests: [String],
    learningStyle: String
  },
  mood: {
    current: String,
    previousMoods: [{
      mood: String,
      timestamp: Date
    }]
  },
  points: Number,
  completedQuests: [{
    questId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quest'
    },
    assignedAt: Date,
    completedAt: Date,
    reflectionId: mongoose.Schema.Types.ObjectId
  }]
});

// Define quest schema
const questSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  moodTargeted: String,
  frequency: String,
  reflectionPrompts: [{
    question: String,
    type: String
  }],
  pointsReward: Number
});

// Get models
const Reflection = mongoose.models.Reflection || mongoose.model('Reflection', reflectionSchema);
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Quest = mongoose.models.Quest || mongoose.model('Quest', questSchema);

const seedReflections = async () => {
  try {
    await connectDB();
    
    // Clear existing reflections
    await Reflection.deleteMany({});
    
    // Get users and quests to create proper relationships
    const users = await User.find({});
    const quests = await Quest.find({});
    
    if (users.length === 0 || quests.length === 0) {
      console.warn('No users or quests found. Run userSeeder.js and questSeeder.js first!');
      process.exit(1);
    }
    
    // Create sample reflection data
    const reflections = [];
    
    // Get completed quests from users and create reflections for them
    for (const user of users) {
      // Skip if user has no completedQuests array
      if (!user.completedQuests || !Array.isArray(user.completedQuests)) {
        continue;
      }
      
      // Only create reflections for completed quests
      const completedQuests = user.completedQuests.filter(q => q.completedAt);
      
      for (const completedQuest of completedQuests) {
        const quest = await Quest.findById(completedQuest.questId);
        if (quest) {
          // Create a new reflection
          const newReflection = new Reflection({
            questId: completedQuest.questId,
            userId: user._id,
            reflectionText: generateReflectionText(quest.title, user.name),
            photoUrl: quest.category === 'Creativity' ? 'https://res.cloudinary.com/demo/image/upload/sample.jpg' : null,
            audioUrl: quest.category === 'Mindfulness' ? 'https://res.cloudinary.com/demo/video/upload/sample.mp3' : null,
            moodBefore: randomMood('before'),
            moodAfter: randomMood('after'),
            submittedAt: completedQuest.completedAt
          });
          
          // Save reflection to get an _id
          const savedReflection = await newReflection.save();
          reflections.push(savedReflection);
          
          // Update user's completedQuests with reflectionId
          completedQuest.reflectionId = savedReflection._id;
        }
      }
      
      // Save updated user with reflection IDs
      await user.save();
    }
    
    console.log(`${reflections.length} reflections seeded successfully!`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding reflections:', error);
    process.exit(1);
  }
};

// Helper function to generate realistic reflection text
function generateReflectionText(questTitle, userName) {
  const reflectionTemplates = [
    `I found this quest really enlightening. ${questTitle} helped me gain perspective on my day.`,
    `Taking time for ${questTitle} was exactly what I needed today. I feel much more centered now.`,
    `At first I was skeptical about ${questTitle}, but after trying it I can see the value.`,
    `This practice helped me notice my thought patterns. I'll definitely make ${questTitle} a regular habit.`,
    `I struggled a bit with ${questTitle} today, but pushing through helped me learn about myself.`
  ];
  
  const randomTemplate = reflectionTemplates[Math.floor(Math.random() * reflectionTemplates.length)];
  return `${randomTemplate} - ${userName}`;
}

// Helper function to generate appropriate moods
function randomMood(type) {
  const beforeMoods = ['Anxious', 'Stressed', 'Tired', 'Bored', 'Sad', 'Neutral'];
  const afterMoods = ['Calm', 'Relaxed', 'Energized', 'Happy', 'Motivated', 'Grateful'];
  
  const moodList = type === 'before' ? beforeMoods : afterMoods;
  return moodList[Math.floor(Math.random() * moodList.length)];
}

// Run the seeder
seedReflections();