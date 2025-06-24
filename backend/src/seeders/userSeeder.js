import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

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

// Define enhanced User schema
const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true
  },
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
  points: {
    type: Number,
    default: 0
  },
  completedQuests: [{
    questId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quest'
    },
    assignedAt: Date,
    completedAt: Date,
    reflectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reflection'
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Get Quest model to refer to quests
const questSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  moodTargeted: String,
  frequency: String
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Quest = mongoose.models.Quest || mongoose.model('Quest', questSchema);

const seedUsers = async () => {
  try {
    await connectDB();
    
    // Clear existing users
    await User.deleteMany({});
    
    // Get all quests to assign some to users
    const quests = await Quest.find({});
    
    if (quests.length === 0) {
      console.warn('No quests found in database. Run questSeeder.js first!');
    }
    
    // Hash passwords
    const salt = await bcrypt.genSalt(10);
    const password1 = await bcrypt.hash('password123', salt);
    const password2 = await bcrypt.hash('testuser456', salt);
    const password3 = await bcrypt.hash('demopass789', salt);
    
    // Create users with assigned quests
    const users = [
      {
        name: 'Alex Johnson',
        email: 'alex@example.com',
        password: password1,
        personalityProfile: {
          traits: ['Introvert', 'Analytical', 'Creative'],
          interests: ['Reading', 'Meditation', 'Technology'],
          learningStyle: 'Visual'
        },
        mood: {
          current: 'Calm',
          previousMoods: [
            { mood: 'Anxious', timestamp: new Date(Date.now() - 86400000) }, // 1 day ago
            { mood: 'Happy', timestamp: new Date(Date.now() - 172800000) }   // 2 days ago
          ]
        },
        points: 150,
        completedQuests: quests.slice(0, 2).map(quest => ({
          questId: quest._id,
          assignedAt: new Date(Date.now() - 259200000), // 3 days ago
          completedAt: new Date(Date.now() - 172800000) // 2 days ago
        })),
      },
      {
        name: 'Taylor Smith',
        email: 'taylor@example.com',
        password: password2,
        personalityProfile: {
          traits: ['Extrovert', 'Energetic', 'Optimistic'],
          interests: ['Fitness', 'Journaling', 'Travel'],
          learningStyle: 'Kinesthetic'
        },
        mood: {
          current: 'Motivated',
          previousMoods: [
            { mood: 'Tired', timestamp: new Date(Date.now() - 86400000) },
            { mood: 'Excited', timestamp: new Date(Date.now() - 259200000) }
          ]
        },
        points: 75,
        completedQuests: quests.slice(2, 3).map(quest => ({
          questId: quest._id,
          assignedAt: new Date(Date.now() - 172800000), // 2 days ago
          completedAt: new Date(Date.now() - 86400000)  // 1 day ago
        })),
      },
      {
        name: 'Jordan Rivera',
        email: 'jordan@example.com',
        password: password3,
        personalityProfile: {
          traits: ['Ambivert', 'Practical', 'Detail-oriented'],
          interests: ['Cooking', 'Art', 'Psychology'],
          learningStyle: 'Auditory'
        },
        mood: {
          current: 'Reflective',
          previousMoods: [
            { mood: 'Stressed', timestamp: new Date(Date.now() - 86400000) },
            { mood: 'Content', timestamp: new Date(Date.now() - 172800000) }
          ]
        },
        points: 220,
        completedQuests: [
          ...quests.slice(3, 4).map(quest => ({
            questId: quest._id,
            assignedAt: new Date(Date.now() - 86400000),  // 1 day ago
            completedAt: new Date(Date.now() - 43200000)  // 12 hours ago
          })),
          // Also add a quest that's assigned but not completed
          ...quests.slice(5, 6).map(quest => ({
            questId: quest._id,
            assignedAt: new Date(),
            completedAt: null
          }))
        ],
      }
    ];
    
    // Insert users
    await User.insertMany(users);
    console.log('Users seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

// Run the seeder
seedUsers();