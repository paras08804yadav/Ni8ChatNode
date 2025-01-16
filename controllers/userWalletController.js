const User = require('../models/User'); 



const updateCoins = async (user_id, host_id, actionType) => {
    try {
        // Find user and host
        const user = await User.findById(user_id);
        const host = await Host.findById(host_id);

        if (!user || !host) {
            throw new Error('User or Host not found.');
        }

        let deductionAmount = 0;

       
        if (actionType === 'voice_call') {
            deductionAmount = host.audio_rate;

        } else if (actionType === 'video_call') {
            deductionAmount = host.video_rate;
            
        } else if (actionType === 'chat') {
            deductionAmount = host.chat_rate; 

        } else if (actionType === 'gift') {
            deductionAmount = 10;
            
        } else {
            throw new Error('Invalid action type.');
        }

        if (user.wallet_balance < deductionAmount) {
            throw new Error('Insufficient balance.');
        }

        user.wallet_balance -= deductionAmount;
        host.wallet_balance += deductionAmount;

        user.transactions.push({
            type: actionType,
            host_id: host._id,
            amount: -deductionAmount,
            date: new Date(),
        });

        await user.save();

        host.hostTransaction.push({
            type: actionType,
            user_id: user._id,
            amount: -deductionAmount,
            date: new Date(),
        });
        await host.save();

        return {
            success: true,
            updated_balance_of_user: user.wallet_balance,
            updated_balance_of_host: host.wallet_balance,
            message: `${actionType} cost debited. Remaining balance: ${user.wallet_balance}`,
            message: `${actionType} cost credited. Remaining balance: ${host.wallet_balance}`,
        };
    } catch (error) {
        return {
            success: false,
            message: error.message,
        };
    }
};

const getWalletBalance = async (req, res) => {
    const { user_id } = req.body;

    if (!user_id) {
        return res.status(400).json({ msg: 'User ID is required.' });
    }

    try {
        const user = await User.findById(user_id).select('coins');

        if (!user) {
            return res.status(404).json({ msg: 'User not found.' });
        }

        // Return the current balance of the user's wallet
        res.status(200).json({ 
            id: user._id,
            wallet_balance: user.coins });
    } catch (error) {
        res.status(500).json({ msg: 'Server error', error: error.message });
    }
};

module.exports = {
    getWalletBalance,
}