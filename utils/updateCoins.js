const User = require('../models/User'); 
const Host = require('../models/Host'); 



const updateCoins = async (req, res) => {
    const { senderId, receiverId, actionType } = req.body;

    try {
        const user = await User.findById(senderId);
        const host = await Host.findById(receiverId);

        if (!user || !host) {
            return res.status(400).json({ msg: 'User or Host not found.' });
        }

        let deductionAmount = 0;
        if (actionType === 'chat') {
            deductionAmount = host.chat_rate;
        } else {
            throw new Error('Invalid action type.');
        }

        if (user.coins < deductionAmount) {
            return res.status(400).json({ msg: 'Insufficient balance.' });
        }
        
        // Ensure coins are numbers before performing arithmetic
        user.coins = Number(user.coins) - deductionAmount;
        host.coins = Number(host.coins) + deductionAmount;

        await user.save();
        await host.save();

        res.status(200).json({
            success: true,
            msg: 'Coins deducted from user and added to host.',
            updated_balance: user.coins,
        });
    } catch (error) {
        console.error('Error in updateCoins:', error);
        res.status(500).json({ msg: 'Server error', error: error.message });
    }
};


module.exports = {
    updateCoins,
};