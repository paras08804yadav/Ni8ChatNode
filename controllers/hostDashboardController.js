const mongoose = require('mongoose');
const hostTransaction = require('../models/hostTransaction');
const moment = require('moment'); 


// Utility function for today's earnings
const getTodaysEarningsUtil = async (host_id) => {
    if (!mongoose.Types.ObjectId.isValid(host_id)) {
      throw new Error("Invalid host ID");
    }
  
    const todayStart = moment().startOf("day").toDate();
    const todayEnd = moment().endOf("day").toDate();
  
    const transactions = await hostTransaction.aggregate([
      {
        $match: {
          host_id: new mongoose.Types.ObjectId(host_id),
          created_at: { $gte: todayStart, $lt: todayEnd },
        },
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$total_earned_coins" },
        },
      },
    ]);
  
    return transactions.length > 0 ? transactions[0].totalEarnings : 0;
  };
  
  // Utility function for total earnings
  const getTotalEarningsUtil = async (host_id) => {
    if (!mongoose.Types.ObjectId.isValid(host_id)) {
      throw new Error("Invalid host ID");
    }
  
    const transactions = await hostTransaction.aggregate([
      {
        $match: { host_id: new mongoose.Types.ObjectId(host_id) },
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$total_earned_coins" },
        },
      },
    ]);
  
    return transactions.length > 0 ? transactions[0].totalEarnings : 0;
  };




const getTodaysEarnings = async (req, res) => {
    const { host_id } = req.body;  // Get hostId from the request body

    // Validate the hostId
    if (!mongoose.Types.ObjectId.isValid(host_id)) {
        return res.status(400).json({ error: 'Invalid host ID' });
    }

    try {
        // Get today's date in the format YYYY-MM-DD
        const todayStart = moment().startOf('day').toDate();
        const todayEnd = moment().endOf('day').toDate();

        // Fetch transactions for today
        const transactions = await hostTransaction.aggregate([
            {
                $match: {
                    host_id: new mongoose.Types.ObjectId(host_id),
                    created_at: { $gte: todayStart, $lt: todayEnd }
                }
            },
            {
                $group: {
                    _id: null,
                    totalEarnings: { $sum: "$total_earned_coins" }
                }
            }
        ]);

        if (transactions.length === 0) {
            return res.status(404).json({ message: 'No transactions found for today' });
        }

        // Send today's earnings
        res.status(200).json({ todayEarnings: transactions[0].totalEarnings });
    } catch (error) {
        console.error('Error fetching today\'s earnings:', error);
        res.status(500).json({ error: 'Server error' });
    }
}

// Function to get total earnings
const getTotalEarnings = async (req, res) => {
    const { host_id } = req.body;  // Get hostId from the request body

    // Validate the hostId
    if (!mongoose.Types.ObjectId.isValid(host_id)) {
        return res.status(400).json({ error: 'Invalid host ID' });
    }

    try {
        // Fetch total earnings for the host
        const transactions = await hostTransaction.aggregate([
            {
                $match: { host_id: new mongoose.Types.ObjectId(host_id) }
            },
            {
                $group: {
                    _id: null,
                    totalEarnings: { $sum: "$total_earned_coins" }
                }
            }
        ]);

        if (transactions.length === 0) {
            return res.status(404).json({ message: 'No transactions found for this host' });
        }

        // Send total earnings
        res.status(200).json({ totalEarnings: transactions[0].totalEarnings });
    } catch (error) {
        console.error('Error fetching total earnings:', error);
        res.status(500).json({ error: 'Server error' });
    }
}

module.exports = {
     getTodaysEarnings, getTotalEarnings, getTodaysEarningsUtil, getTotalEarningsUtil
};