const Message = require('../models/Message');
const User = require('../models/User');
const Host = require('../models/Host');  // Assuming you have a Host model


const getHostMessages = async (req, res) => {
    try {
        const { hostId } = req.body;

        console.log(`Received request for host messages with hostId: ${hostId}`);

        // Validate that hostId is provided
        if (!hostId) {
            console.log('Host ID is required in the request.');
            return res.status(400).json({ error: "Host ID is required" });
        }

        // Query to find messages where the host ID is either the sender or receiver
        console.log('Querying messages for the host...');
        const messages = await Message.find({
            $or: [
                { senderId: hostId },
                { receiverId: hostId }
            ]
        }).sort({ createdAt: 1 }); // Sort by createdAt to get the most recent messages first

        // If no messages found for the host
        if (!messages.length) {
            console.log('No messages found for hostId:', hostId);
            return res.status(200).json({ messages: [] });
        }

        console.log(`Found ${messages.length} messages for hostId: ${hostId}`);

        // Map each message with corresponding user details (opposite user of the host)
        const messagesWithUserDetails = [];
        const seenUsers = new Set(); // To keep track of processed sender/receiver pairs

        for (const Message of messages) {
            let oppositeUserId;

            // If the sender is the host, the receiver is the opposite user
            if (Message.senderId == hostId) {
                oppositeUserId = Message.receiverId;
            } else {
                oppositeUserId = Message.senderId;
            }

            // Avoid duplicating users by checking if the user has already been processed
            const userPairKey = [hostId, oppositeUserId].sort().join("-");
            if (seenUsers.has(userPairKey)) {
                continue; // Skip if already processed
            }
            seenUsers.add(userPairKey);

            // Fetch the details of the opposite user (the one who is not the host)
            console.log(`Fetching details for opposite user with ID: ${oppositeUserId}`);
            const oppositeUser = await User.findById(oppositeUserId);

            if (oppositeUser) {
                console.log(`User found with ID: ${oppositeUserId}, username: ${oppositeUser.username}, gender: ${oppositeUser.gender}`);

                // Push the most recent message along with the user details
                messagesWithUserDetails.push({
                    messageId: Message._id,
                    senderId: Message.senderId,
                    receiverId: Message.receiverId,
                    message: Message.text,
                    oppositeUserDetails: {
                        
                        username: oppositeUser.username,
                        profile_url: `${req.protocol}://${req.get('host')}/Avtar/${oppositeUser.gender === 'Male' ? 'male.jpg' : 'female.jpg'}`,
                    }
                });
            } else {
                console.log(`User with ID: ${oppositeUserId} not found.`);
            }
        }

        // Return the list of messages with user details (including most recent message)
        console.log('Returning messages with user details.');
        res.status(200).json({ messages: messagesWithUserDetails });

    } catch (error) {
        console.error("Error fetching host messages:", error);
        res.status(500).json({ error: "An error occurred while fetching messages." });
    }
};




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
        }).sort({ timestamp: 1 }); // Sort by timestamp to get the most recent messages first

        // If no messages found between the user and host
        if (!messages.length) {
            return res.status(200).json({ messages: [] });
        }

        // Map each message with required fields
        const messagesWithDetails = messages.map(msg => ({
            messageId: msg._id,
            senderId: msg.senderId,
            receiverId: msg.receiverId,
            messageType: msg.messageType,  // Message type (text, audio)
            message: msg.message,          // Message text if text type
            mediaUrl: msg.mediaUrl,        // Media URL if message is of type audio, photo, video
            timestamp: msg.timestamp       // Timestamp of the message
        }));

        // Return the list of messages between the user and host
        res.status(200).json({ messages: messagesWithDetails });

    } catch (error) {
        console.error("Error fetching messages between user and host:", error);
        res.status(500).json({ error: "An error occurred while fetching messages." });
    }
};

module.exports = {
    getHostMessages,
    getAllMessagesBetweenUserAndHost

};
