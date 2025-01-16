const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

const fetchTransactionHistory = async (req, res) => {
  try {
    // Use req.body if it's a POST request
    const { user_id } = req.body;

    // Check if the user exists
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Convert user_id to ObjectId
    const objectId = new mongoose.Types.ObjectId(user_id);

    // Query the Transaction model using userId (as per your schema)
    const transactions = await Transaction.find({ userId: objectId });

    // Check if transactions exist
    if (!transactions || transactions.length === 0) {
      return res.status(404).json({ message: 'No transactions found for this user.' });
    }

    // Send transaction data as response
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

module.exports = { fetchTransactionHistory };
