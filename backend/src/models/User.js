import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
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
    assignedAt: {
      type: Date,
      default: Date.now
    },
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

const User = mongoose.model('User', userSchema);

export default User;