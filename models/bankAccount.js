const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the BankVerification schema
const BankVerificationSchema = new Schema({
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Host', // Assuming you have a Host model
    required: true,
  },
  bankName: {
    type: String,
    required: true,
  },
  accountHolderName: {
    type: String,
    required: true,
  },
  accountNumber: {
    type: String,
    required: true,
  },
  ifscCode: {
    type: String,
    required: true,
  },
  branchName: {
    type: String,
    // required: true,
  },
  verificationStatus: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected'],
    default: 'Pending',
  },
  verificationRemarks: {
    type: String,
  },
  documents: {
    type: [String], // URLs or file paths of uploaded verification documents
  },

  requestDate: {
    type: Date,
    default: Date.now,
  },
  verificationDate: {
    type: Date, // Date when verification is completed
  },
}, { timestamps: true });

module.exports = mongoose.model('BankVerification', BankVerificationSchema);
