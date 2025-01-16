const mongoose = require('mongoose');

const spendingHistorySchema = new mongoose.Schema({

    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },

    host_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Host', 
        required: true
    },

    coins: {
        type: Number, 
        default: 0
    },


    time: {
        type: Date,
        default: Date.now // Automatically set to the current timestamp
    },



    status: {
        type: String, // Status of the transaction (e.g., 'completed', 'pending', 'failed')
        default: 'completed'
    },

    description: {
        duration: {
            type: Number, // Duration of call in minutes (for voice/video calls)
            default: 0
        },
        num_of_messages: {
            type: Number, // Number of messages (if it's a chat)
            default: 0
        },
        total_coins: {
            type: Number, // Total coins spent for this transaction
            required: true
        }
    },

    metadata: {
        type: Map, // Additional metadata or information (e.g., offer codes, extra details)
        of: String,
        default: {}
    }
});

// Export the model
const spendingHistory = mongoose.model('spendingHistory', spendingHistorySchema);

module.exports = spendingHistory;
