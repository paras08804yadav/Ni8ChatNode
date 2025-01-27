const mongoose = require('mongoose');
const hostTransaction = require('../models/hostTransaction');


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

module.exports = { getTodaysEarningsUtil, getTotalEarningsUtil };

