// controller.js
const mongoose = require('mongoose');
const HostTransaction = require('../models/hostTransaction'); // Adjust the path as needed

async function getHostTransactionHistory(req, res) {
    const { host_id } = req.body;  // Get hostId from the request body

    // Validate the hostId
    if (!mongoose.Types.ObjectId.isValid(host_id)) {
        return res.status(400).json({ error: 'Invalid host ID' });
    }

    try {
        // Fetch transactions for the given hostId
        const transactions = await HostTransaction.find({ host_id: host_id })
            .populate('user_id', 'username email') // Populate user info
            .sort({ created_at: -1 }); // Sort by latest transactions

        if (!transactions.length) {
            return res.status(404).json({ message: 'No transactions found for this host' });
        }

        // Send the transaction history
        res.status(200).json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Server error' });
    }
}

module.exports = { getHostTransactionHistory };
