import mongoose from 'mongoose';

const questSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    moodTargeted: {
        type: String,
        required: true,
    },
    frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        required: true,
    },
    reflectionPrompts: [{
        question: String,
        type: {
            type: String,
            enum: ['text', 'photo', 'audio', 'any'],
            default: 'text'
        }
    }],
    pointsReward: {
        type: Number,
        default: function() {
            // Default points based on frequency
            switch(this.frequency) {
                case 'daily': return 10;
                case 'weekly': return 20;
                case 'monthly': return 50;
                default: return 10;
            }
        }
    }
}, {
    timestamps: true,
});

const Quest = mongoose.model('Quest', questSchema);

export default Quest;