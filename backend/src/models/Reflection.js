import mongoose from 'mongoose';

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

const Reflection = mongoose.model('Reflection', reflectionSchema);

export default Reflection;