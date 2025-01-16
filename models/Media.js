// models/Media.js
const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema({
  host_id: { 
    type: String,
    required: true,
  },
  media_type: {
    type: String,
    enum: ['image', 'video'],
    required: true,
  },
  media_url: {
    type: String,
    required: true,
  },

  ip_address: { 
    type: String,
    required: true,
  },
  uploaded_at: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

const Media = mongoose.model('Media', MediaSchema);

module.exports = Media;
