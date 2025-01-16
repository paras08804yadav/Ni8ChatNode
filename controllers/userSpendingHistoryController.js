const mongoose = require('mongoose');
const spendingHistory = require('../models/spendingHistory');
const User = require('../models/User');

const fetchSpendingHistory = async (req, res) => {
  try {
    const { user_id } = req.body;
    console.log('Received user_id:', user_id);  // Log the received user_id

    // Convert user_id to ObjectId
    const objectId = new mongoose.Types.ObjectId(user_id);
    console.log('Converted ObjectId:', objectId);  // Log the ObjectId conversion

    // Query the spendingHistory model to check if entries exist with the given user_id
    const spendings = await spendingHistory.find({ user_id: objectId });
    console.log('Spending History for user:', spendings);  // Log the spending history fetched

    // Check if transactions exist for the given user_id
    if (!spendings || spendings.length === 0) {
      console.log('No spendings found for this user');  // Log if no spendings found
      return res.status(404).json({ message: 'No spendings found for this user.' });
    }

    // Send the list of spending history entries as a response
    res.status(200).json(spendings);
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

module.exports = { fetchSpendingHistory };
