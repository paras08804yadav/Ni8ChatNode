const User = require('../models/User');
const Host = require('../models/Host');



const updateCoins = async ({ userId, hostId, actionType })  => {
    try {
        console.log('Starting coin update process...');
        console.log(`Received userId: ${userId}, hostId: ${hostId}, actionType: ${actionType}`);

        // Check if required arguments are provided
        if (!userId || !hostId) {
            console.log('Error: userId or hostId is missing.');
            return {
                success: false,
                msg: 'Missing userId or hostId.',
            };
        }

        // Fetch user and host from the database
        console.log('Fetching user and host details from the database...');
        const user = await User.findById(userId);
        const host = await Host.findById(hostId);

        if (!user) {
            console.log(`Error: User with ID ${userId} not found.`);
            return {
                success: false,
                msg: `User with ID ${userId} not found.`,
            };
        }

        if (!host) {
            console.log(`Error: Host with ID ${hostId} not found.`);
            return {
                success: false,
                msg: `Host with ID ${hostId} not found.`,
            };
        }

        // Determine the deduction amount based on the action type
        console.log('Determining deduction amount...');
        let deductionAmount = 0;
        if (actionType === 'chat') {
            deductionAmount = host.chat_rate;
        } else {
            console.log('Error: Invalid action type.');
            return {
                success: false,
                msg: 'Invalid action type. Only "chat" is supported.',
            };
        }

        console.log(`Deduction amount based on actionType "${actionType}": ${deductionAmount}`);

        // Check if the user has enough coins
        if (user.coins < deductionAmount) {
            console.log('Error: Insufficient balance for the user.');
            return {
                success: false,
                msg: 'Insufficient balance.',
                user_balance: user.coins,
            };
        }

        // Deduct coins from the user and add to the host
        console.log('Updating coins for user and host...');
        user.coins = Number(user.coins) - deductionAmount;
        host.coins = Number(host.coins) + deductionAmount;

        // Save updates to the database
        await user.save();
        await host.save();

        console.log('Coin update process completed successfully.');
        return {
            success: true,
            msg: 'Coins deducted from user and added to host.',
            user_updated_balance: user.coins,
            host_updated_balance: host.coins,
        };
    } catch (error) {
        console.error('Error in updateCoins:', error);
        return {
            success: false,
            msg: 'An error occurred during coin update.',
            error: error.message,
        };
    }
};

module.exports = updateCoins;
