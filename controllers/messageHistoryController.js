const mongoose = require('mongoose');
const Message = mongoose.model('Message');

const getAllMessagesBetweenUserAndHost = async (req, res) => {
    try {
        const { userId, hostId } = req.body;

        // Validate that userId and hostId are provided
        if (!userId || !hostId) {
            return res.status(400).json({ error: "userId and hostId are required" });
        }

        // Query to find all messages between the user and the host
        const messages = await Message.find({
            $or: [
                { senderId: userId, receiverId: hostId },  // User sent message to Host
                { senderId: hostId, receiverId: userId }   // Host sent message to User
            ]
        }).sort({ timestamp: -1 }); // Sort by timestamp to get the most recent messages first

        // If no messages found between the user and host
        if (!messages.length) {
            return res.status(200).json({ messages: [] });
        }

        // Map each message with required fields
        const messagesWithDetails = messages.map(msg => ({
            messageId: msg._id,
            senderId: msg.senderId,
            receiverId: msg.receiverId,
            messageType: msg.messageType,  
            message: msg.message,        
            mediaUrl: msg.mediaUrl,        
            timestamp: msg.timestamp       
        }));

        // Return the list of messages between the user and host
        res.status(200).json({ messages: messagesWithDetails });

    } catch (error) {
        console.error("Error fetching messages between user and host:", error);
        res.status(500).json({ error: "An error occurred while fetching messages." });
    }
};




module.exports = {
    getAllMessagesBetweenUserAndHost

};
