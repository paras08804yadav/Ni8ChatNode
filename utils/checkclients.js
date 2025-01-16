const mongoose = require('mongoose');
const User = require('../models/User');
const Host = require('../models/Host');
const updateCoins = require('./updatecoin1'); // Import the updateCoins function





 
const checkClients = async (senderId, receiverId, senderType) => {
    // Function to get client details based on senderType
    const getClientDetails = async (clientId, senderType) => {
        if (!mongoose.isValidObjectId(clientId)) {
            return `Invalid ID format: ${clientId}`;
        }

        if (senderType == 'user') {
            // Fetch user details (username and coins)
            const user = await User.findById(clientId).exec();
            if (user) {
                return `Sender: ${clientId} is a User with Username: ${user.username} and Coins: ${user.coins}`;
            }
        } 

        return `${senderType}: ${clientId} does not exist in the database.`;
    };

    try {
        let senderDetails;

        // Check details based on senderType
        if (senderType == 'user') {
            // Get receiver details (user)
            senderDetails = await getClientDetails(senderId, 'user');
            console.log(senderDetails); // Logs receiver details (User)
        
            // Assign receiverId to userId and senderId to hostId
            const hostId = receiverId;
            const userId = senderId;
        
            // Log the action before calling updateCoins
            console.log(`Calling updateCoins for userId: ${userId}, hostId: ${hostId}`);
        
            // Call updateCoins with the appropriate arguments
            const updateResult = await updateCoins({ userId, hostId, actionType: 'chat' }); // Assuming actionType is 'chat'
            
            // Log the result of the updateCoins function
            console.log('UpdateCoins Result:', updateResult); // Logs result of the coin update
        }


        // Log sender and receiver details (if any)

    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
};

module.exports = checkClients;
