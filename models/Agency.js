const mongoose = require('mongoose');

const { Schema } = mongoose;


const agencySchema = new Schema({

    agencyname: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
    },
    password: {
        type: String,   
        required: true,
        minlength: 6    
    },

    address: {
        type: String
    },

    status: {
        type: String,
        enum: ['active', 'suspended', 'inactive'],
        default: 'active'
    },
    waitedHost: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Host',
        },
    ],

    host_list:  [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Host', // Optional, to use population later
        },
    ],

    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

// Middleware to automatically update `updated_at` field on save
agencySchema.pre('save', function(next) {
    this.updated_at = Date.now();
    next();
});

const Agency = mongoose.model('Agency', agencySchema);
module.exports = Agency;
