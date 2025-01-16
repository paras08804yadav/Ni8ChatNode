const mongoose = require('mongoose');

// Define the schema for user online status
const hostIsOnlineSchema = new mongoose.Schema({
    hostId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        trim: true
    },
    host_generatedID: {
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
const HostIsOnline = mongoose.model('HostIsOnline', hostIsOnlineSchema);

module.exports = HostIsOnline;
