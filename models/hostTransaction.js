const mongoose = require('mongoose');

const hostTransactionSchema = new mongoose.Schema({
    host_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Host',
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // Assuming you have a User model
        required: true
    },
    transaction_type: {
        type: String,
        enum: ['video_call', 'voice_call', 'message'],  // Transaction types
        required: true
    },
    message_count: {
        type: Number,
        default: 0  // Only applicable for 'message' type
    },
    duration: {
        type: Number,  // Duration in seconds
        default: 0     // Only applicable for 'video_call' and 'voice_call' types
    },
    total_earned_coins: {
        type: Number,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

// Create the model
const hostTransaction = mongoose.model('hostTransaction', hostTransactionSchema);

module.exports = hostTransaction;
