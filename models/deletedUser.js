const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define DeletedUser Schema
const DeletedUserSchema = new Schema({
  user_id : {
    type: Schema.Types.ObjectId, 
    required: true 
  },
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone_number: {
    type: String,
  },
  gender: {
    type: String,
  },
  location: {
    type: String,
  },
  country: {
    type: String,
  },
  Date_of_Birth: {
    type: Date,
  },
  LookingFor: {
    type: String,
  },
  languages: {
    type: [String],
  },
  interest: {
    type: [String],
  },
  age_range: {
    type: String,
  },
  device_tokens: {
    type: [String],
  },
  bio: {
    type: String, 
  },
  coins: { 
    type: Number, 
    default: 0 
  },
  device_id: {
    type: String,
  },
  social_id: {
    type: String, 
  },
  device_ip: {
    type: String, 
  },
  profile_url: {
    type: String,
  },
  rank: {
    type: Number, 
  },
  followed_hosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Host'
  }],
  deletedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('DeletedUser', DeletedUserSchema);
