const mongoose = require('mongoose');

const VideoCallSchema = new mongoose.Schema({

  host_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Host',  
    required: true,
  },

  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },

  duration: {
    type: Number,  // Duration in seconds
    required: true,
  },

  start_time: {
    type: Date,
    default: Date.now,  // Automatically set to current time if not provided
  },
  
  end_time: {
    type: Date,
  },

  device_type: {
    type: String,
    enum: ['mobile', 'desktop', 'tablet'],
    default: 'desktop',
  },

  device_id: {
    type: String,
  },
//   call_rating: {
//     type: Number,  
//     min: 1,
//     max: 5,
//   },
}, { timestamps: true });  // Automatically adds createdAt and updatedAt fields

const VideoCall = mongoose.model('VideoCall', VideoCallSchema);

module.exports = VideoCall;
