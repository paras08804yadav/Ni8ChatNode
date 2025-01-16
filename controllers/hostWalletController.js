const Host = require('../models/Host'); 

// const updateCoins = async (user_id, host_id, actionType) => {
//     try {
//         // Find user and host
//         const user = await User.findById(user_id);
//         const host = await Host.findById(host_id);

//         if (!user || !host) {
//             throw new Error('User or Host not found.');
//         }

//         let deductionAmount = 0;

//         // Determine the action and calculate the deduction amount
//         if (actionType === 'voice_call') {
//             // Deduct coins based on the host's voice call rate
//             deductionAmount = host.audio_rate; // Per minute rate for voice call
//         } else if (actionType === 'video_call') {
//             // Deduct coins based on the host's video call rate
//             deductionAmount = host.video_rate; // Per minute rate for video call
//         } else if (actionType === 'chat') {
//             // Deduct coins based on the host's chat rate per message
//             deductionAmount = host.chat_rate; // Per message rate for chat
//         } else if (actionType === 'gift') {
//             // Example: Deduct coins for sending a gift (assuming gift cost is passed in this example)
//             deductionAmount = 10; // This is just a placeholder, adjust based on gift cost logic
//         } else {
//             throw new Error('Invalid action type.');
//         }

//         // Check if the user has enough balance
//         if (user.wallet_balance < deductionAmount) {
//             throw new Error('Insufficient balance.');
//         }

//         // Deduct the coins
//         user.wallet_balance -= deductionAmount;

//         // Save the transaction in user's transaction history (optional)
//         user.transactions.push({
//             type: actionType,
//             host_id: host._id,
//             amount: -deductionAmount,
//             date: new Date(),
//         });

//         await user.save();

//         return {
//             success: true,
//             updated_balance: user.wallet_balance,
//             message: `${actionType} cost deducted. Remaining balance: ${user.wallet_balance}`,
//         };
//     } catch (error) {
//         return {
//             success: false,
//             message: error.message,
//         };
//     }
// };

const getWalletBalance = async (req, res) => {
    const { host_id } = req.body;

    if (!host_id) {
        return res.status(400).json({ msg: 'host ID is required.' });
    }

    try {
        const host = await Host.findById(host_id).select('coins');

        if (!host) {
            return res.status(404).json({ msg: 'host not found.' });
        }

        // Return the current balance of the host's wallet
        res.status(200).json({ 
            id: host._id,
            wallet_balance: host.coins });
    } catch (error) {
        res.status(500).json({ msg: 'Server error', error: error.message });
    }
};

module.exports = {
    getWalletBalance,
}