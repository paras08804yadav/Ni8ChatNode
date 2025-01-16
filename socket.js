// socket.js
const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const User = require('./models/User'); // Adjust path if needed
const Host = require('./models/Host'); // Adjust path if needed
const Message = require('./models/Message');
const { updateCoins } = require('./utils/updatecoin1'); // Adjust the path if needed


const voiceMessagesDir = path.join(__dirname, 'voice_messages');

// Ensure the voice messages directory exists
if (!fs.existsSync(voiceMessagesDir)) fs.mkdirSync(voiceMessagesDir, { recursive: true });

function logMessage(message) {
  console.log(message);
  fs.appendFileSync('server.log', `${new Date().toISOString()} - ${message}\n`);
}

function setupSocketIo(server) {
  const io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["my-custom-header"],
      credentials: true,
    }
  });

  let availableHosts = [];
  let availableUsers = [];
  let offlineMessages = {};

  io.on('connection', (socket) => {
    logMessage(`New client connected with socket ID: ${socket.id}`);
    socket.join('global_chat');

    socket.on('send_voice_message', (data) => {
      const { voiceFile, hostId, userId, senderId } = data;
      if (!voiceFile || !hostId || !userId || !senderId) {
        logMessage('Invalid data received for send_voice_message');
        return;
      }

      const fileBuffer = Buffer.from(voiceFile, 'base64');
      const fileName = `${Date.now()}_${senderId}.aac`;
      const filePath = path.join(voiceMessagesDir, fileName);
      fs.writeFileSync(filePath, fileBuffer);

      const messageData = {
        senderId,
        hostId,
        userId,
        messageType: 'voice',
        filePath,
        timestamp: new Date().toISOString(),
      };

      const hostSocketId = availableHosts.find(host => host.hostId === hostId)?.socketId;
      const userSocketId = availableUsers.find(user => user.userId === userId)?.socketId;

      if (hostSocketId || userSocketId) {
        io.to('global_chat').emit('receive_message', messageData);
        logMessage(`Voice message sent to host ${hostId} and user ${userId}`);
      } else {
        if (!offlineMessages[hostId]) offlineMessages[hostId] = [];
        if (!offlineMessages[userId]) offlineMessages[userId] = [];
        offlineMessages[hostId].push(messageData);
        offlineMessages[userId].push(messageData);
        logMessage('Voice message stored for offline delivery');
      }
    });

    socket.on('register_user', async (data) => {
        const { userId, userName } = data;
    
        // Validate the user
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.log('Validation failed: Invalid userId');
            return socket.emit('error', { msg: 'Invalid userId.' });
        }
    
        const user = await User.findById(userId);
        if (!user) {
            console.log('User not found');
            return socket.emit('error', { msg: 'User not found.' });
        }
    
        // Add the user to the list of online users
        availableUsers.push({ userId, userName, socketId: socket.id, isOnline: true });
        logMessage(`User ${userName} registered successfully`);
    
        // Retrieve offline messages for this user
        const offlineMessages = await Message.find({ receiverId: userId, isOffline: true });
    
        // Send offline messages to the user
        if (offlineMessages.length > 0) {
            socket.emit('offline_messages', offlineMessages);
    
            // Update `isOffline` to false for delivered messages
            await Message.updateMany(
                { receiverId: userId, isOffline: true },
                { $set: { isOffline: false } }
            );
    
            logMessage(`Delivered offline messages to user ${userName}`);
        }
    
        // Emit updated list of available users to all clients
        io.to('global_chat').emit('available_users', availableUsers);
    });
    


    socket.on('send_message', async (data) => {
        const { senderId, receiverId, message, roomId } = data;
    
        // Validate senderId and receiverId
        if (!mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(receiverId)) {
            console.log('Validation failed: Invalid senderId or receiverId');
            return socket.emit('error', { msg: 'Invalid senderId or receiverId.' });
        }
    
        try {
            // Fetch sender and receiver from the database
            const sender = await User.findById(senderId) || await Host.findById(senderId);
            const receiver = await User.findById(receiverId) || await Host.findById(receiverId);
    
            if (!sender || !receiver) {
                console.log('Validation failed: Invalid sender or receiver ID in send message request');
                return socket.emit('error', { msg: 'Invalid sender or receiver ID.' });
            }
    
            // Only update coins if the sender is a User
            if (sender instanceof User) {
                console.log(`User action detected, forwarding request to updateCoins middleware`);
    
                // Call updateCoins function to deduct coins from the user and add to the host
                const updateCoinsResponse = await updateCoins({
                    body: {
                        senderId,
                        receiverId,
                        actionType: 'chat'
                    }
                });
    
                if (!updateCoinsResponse.success) {
                    console.log('Insufficient balance or error in updating coins.');
                    return socket.emit('error', { msg: 'Insufficient balance or error in updating coins.' });
                }
            } else {
                console.log('Host action detected, skipping coin update');
                // Skip coin update and proceed with sending the message
            }
    
            const messageData = {
                roomId,
                senderId,
                receiverId,
                message,
                messageType: "text",
                timestamp: new Date(),
                isOffline: false,
            };
    
            const hostSocketId = availableHosts.find(host => host.hostId === receiverId)?.socketId;
            const userSocketId = availableUsers.find(user => user.userId === receiverId)?.socketId;
    
            // Send message directly if both are online; otherwise, store for offline delivery
            if (hostSocketId && userSocketId) {
                io.to(hostSocketId).emit('receive_message', messageData);
                io.to(userSocketId).emit('receive_message', messageData);
                logMessage(`Message sent to host ${receiverId} and user ${receiverId}: ${message}`);
            } else {
                // Store message in the database as an offline message
                messageData.isOffline = true;
    
                // Save to MongoDB
                const newMessage = new Message(messageData);
                await newMessage.save();
    
                logMessage(`Message stored for offline delivery to host ${receiverId} and user ${receiverId}: ${message}`);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            socket.emit('error', { msg: 'Failed to send message due to server error.' });
        }
    });
    
    
    
    

    socket.on('disconnect', () => {
      const disconnectedHost = availableHosts.find(host => host.socketId === socket.id);
      const disconnectedUser = availableUsers.find(user => user.socketId === socket.id);

      if (disconnectedHost) {
        availableHosts = availableHosts.filter(host => host.socketId !== socket.id);
        logMessage(`Host ${disconnectedHost.hostName} disconnected`);
      }

      if (disconnectedUser) {
        availableUsers = availableUsers.filter(user => user.socketId !== socket.id);
        logMessage(`User ${disconnectedUser.userName} disconnected`);
      }

      io.to('global_chat').emit('available_hosts', availableHosts);
      io.to('global_chat').emit('available_users', availableUsers);
    });
  });

  return io;
}

module.exports = { setupSocketIo };




