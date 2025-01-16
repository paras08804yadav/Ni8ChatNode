const mongoose = require('mongoose');

// Define the schema for user online status
const userIsOnlineSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        trim: true
    },
    user_generatedID: {
        type: Number,
        required: true,
        unique: true,
        trim: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Compile the schema into a model
const UserIsOnline = mongoose.model('UserIsOnline', userIsOnlineSchema);

module.exports = UserIsOnline;
