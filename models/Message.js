const mongoose = require('mongoose');
const MessageSchema = new mongoose.Schema({
    senderId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true 
    },  
    
    receiverId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true 
    },  
    
    messageType: { 
        type: String, 
        enum: ['text', 'audio'], 
        required: true 
    }, 
    
    message: { 
        type: String, 
        required: function() {
            return this.messageType === 'text';
        }
    }, 
    
    mediaUrl: { 
        type: String, 
        required: function() {
            return this.messageType === 'audio';
        }
    }, 
    
    ipAddress: { 
        type: String 
    }, 
    
    timestamp: { 
        type: Date, 
        default: Date.now 
    },
    
    isOffline: { 
        type: Boolean, 
        default: false 
    }
});

module.exports = mongoose.model('Message', MessageSchema);
