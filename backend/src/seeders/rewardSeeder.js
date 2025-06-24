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

// Since we don't have the Reward model yet, we'll define a simple schema
const rewardSchema = new mongoose.Schema({
    title: String,
    description: String,
    pointsRequired: Number,
    rewardType: String,
    isActive: Boolean
});

const Reward = mongoose.models.Reward || mongoose.model('Reward', rewardSchema);

const rewards = [
    {
        title: 'Extra Boost',
        description: 'Get an extra boost for your next quest.',
        pointsRequired: 100,
        rewardType: 'boost',
        isActive: true,
    },
    {
        title: 'Exclusive Content',
        description: 'Unlock exclusive content to enhance your journey.',
        pointsRequired: 200,
        rewardType: 'content',
        isActive: true,
    },
    {
        title: 'Personalized Coaching',
        description: 'Receive a personalized coaching session.',
        pointsRequired: 500,
        rewardType: 'boost',
        isActive: true,
    },
];

const seedRewards = async () => {
    try {
        await connectDB();
        await Reward.deleteMany({});
        await Reward.insertMany(rewards);
        console.log('Rewards seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding rewards:', error);
        process.exit(1);
    }
};

// Run the seeder
seedRewards();