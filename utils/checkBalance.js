const User = require('../models/User');
const Host = require('../models/Host');



const checkBalance = async ({senderId, receiverId })  => {
    try {
        let userId = null;
        let hostId = null;

        userId = senderId;
        hostId = receiverId;
        console.log('Checking balance...');
        console.log(`Received userId: ${userId}, hostId: ${hostId}`);

        // Check if required arguments are provided
        if (!userId || !hostId) {
            console.log('Error: userId or hostId is missing.');
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

    
        // Check if the user has enough coins
        if (user.coins < host.chat_rate) {
            console.log('Error: Insufficient balance for the user.');
            return false;
            };
            return true;
        }


    catch (error) {
        console.error('Error in updateCoins:', error);
        return {
            success: false,
            msg: 'An error occurred during coin update.',
            error: error.message,
        };
    };
};
module.exports = checkBalance;
