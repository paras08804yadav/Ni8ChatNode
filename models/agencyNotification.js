const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AgencyNotificationSchema = new Schema({
  agency_id: { 
    type: Schema.Types.ObjectId, 
    ref: 'Agency', 
    required: true 
  }, // Reference to the Agency model
  photo: { 
    type: String, 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
  device_token: { 
    type: String, 
    default: null 
  }
});

AgencyNotificationSchema.virtual('notificationAgo').get(function () {
  const now = new Date();
  const diff = now - this.timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day(s) ago`;
  if (hours > 0) return `${hours} hour(s) ago`;
  if (minutes > 0) return `${minutes} minute(s) ago`;
  return `${seconds} second(s) ago`;
});

AgencyNotificationSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('AgencyNotification', AgencyNotificationSchema);
