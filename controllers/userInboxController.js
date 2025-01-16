const Message = require('../models/Message');
const Host = require('../models/Host');  

// const getUserMessages = async (req, res) => {
//     try {
//         const { userId } = req.body;

//         console.log(`Received request for user messages with userId: ${userId}`);

//         // Validate that userId is provided
//         if (!userId) {
//             console.log('userId is required in the request.');
//             return res.status(400).json({ error: "userId is required" });
//         }

//         // Query to find messages where the user ID is either the sender or receiver
//         console.log('Querying messages for the user...');
//         const messages = await Message.find({
//             $or: [
//                 { senderId: userId },
//                 { receiverId: userId }
//             ]
//         });// Sort by createdAt to get the most recent messages first

//         // If no messages found for the user
//         if (!messages.length) {
//             console.log('No messages found for userId:', userId);
//             return res.status(200).json({ messages: [] });
//         }

//         console.log(`Found ${messages.length} messages for userId: ${userId}`);

//         // Initialize the array to store messages with user details
//         const messagesWithHostDetails = [];
//         const seenUsers = new Set(); // To keep track of processed sender/receiver pairs

//         for (const msg of messages) {
//             let oppositeHostId;

//             // Determine the opposite host ID (the other party in the conversation)
//             if (msg.senderId == userId) {
//                 oppositeHostId = msg.receiverId;
//             } else {
//                 oppositeHostId = msg.senderId;
//             }

//             // Avoid duplicating users by checking if the pair has already been processed
//             const userPairKey = [userId, oppositeHostId].sort().join("-"); // Fix variable names and ensure userId is used
//             if (seenUsers.has(userPairKey)) {
//                 continue; // Skip if already processed
//             }
//             seenUsers.add(userPairKey);

//             // Fetch the details of the opposite host (the one who is not the user)
//             console.log(`Fetching details for opposite host with ID: ${oppositeHostId}`);
//             const oppositeHost = await Host.findById(oppositeHostId);

//             if (oppositeHost) {
//                 console.log(`Host found with ID: ${oppositeHostId}, hostname: ${oppositeHost.hostname}`);

//                 // Push the most recent message along with the host details
//                 messagesWithHostDetails.push({
//                     messageId: msg._id,
//                     senderId: msg.senderId,
//                     receiverId: msg.receiverId,
//                     message: msg.text,
//                     oppositeHostDetails: {
                        
//                         hostname: oppositeHost.hostname,
//                         profilePhoto: `${req.protocol}://${req.get('host')}/uploads/profile_photo/${oppositeHost._id}.jpg`,
//                     }
//                 });
//             } else {
//                 console.log(`Host with ID: ${oppositeHostId} not found.`);
//             }
//         }

//         // Return the list of messages with user details (including most recent message)
//         console.log('Returning messages with host details.');
//         res.status(200).json({ messages: messagesWithHostDetails });

//     } catch (error) {
//         console.error("Error fetching user messages:", error);
//         res.status(500).json({ error: "An error occurred while fetching messages." });
//     }
// };

const getUserMessages = async (req, res) => {
    try {
        const { userId } = req.body;

        console.log(`Received request for user messages with userId: ${userId}`);

        if (!userId) {
            return res.status(400).json({ error: "userId is required" });
        }

        console.log('Querying messages for the user...');
        const messages = await Message.find({
            $or: [
                { senderId: userId },
                { receiverId: userId }
            ]
        }).sort({ timestamp: -1 }); // Sort by timestamp descending

        if (!messages.length) {
            return res.status(200).json({ messages: [] });
        }

        console.log(`Found ${messages.length} messages for userId: ${userId}`);

        const messagesMap = new Map();
        const seenUsers = new Set();

        for (const msg of messages) {
            let oppositeHostId = msg.senderId === userId ? msg.receiverId : msg.senderId;
            const userPairKey = [userId, oppositeHostId].sort().join("-");

            if (!seenUsers.has(userPairKey)) {
                const oppositeHost = await Host.findById(oppositeHostId);
                if (oppositeHost) {
                    messagesMap.set(oppositeHostId, {
                        messageId: msg._id,
                        senderId: msg.senderId,
                        receiverId: msg.receiverId,
                        message: msg.text,
                        timestamp: msg.timestamp, // Use this for sorting
                        oppositeHostDetails: {
                            hostname: oppositeHost.hostname,
                            profilePhoto: `${req.protocol}://${req.get('host')}/uploads/profile_photo/${oppositeHost._id}.jpg`,
                        }
                    });
                    seenUsers.add(userPairKey);
                }
            }
        }

        // Convert Map to Array and sort by timestamp
        const messagesWithHostDetails = Array.from(messagesMap.values()).sort((a, b) => b.timestamp - a.timestamp);

        console.log('Returning messages with host details.');
        res.status(200).json({ messages: messagesWithHostDetails });

    } catch (error) {
        console.error("Error fetching user messages:", error);
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
    getUserMessages,
    getAllMessagesBetweenUserAndHost
};
