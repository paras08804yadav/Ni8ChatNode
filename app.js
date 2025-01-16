// app.js (Controller Module)
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const fs = require('fs');
const User = require('./models/User'); // Adjust path if needed
const Host = require('./models/Host'); // Adjust path if needed
const Message = require('./models/Message'); // Adjust path if needed

// This function sets up Socket.IO on the provided HTTP server instance
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

  function logMessage(message) {
    console.log(message);
    fs.appendFile('server.log', `${new Date().toISOString()} - ${message}\n`, (err) => {
      if (err) console.error('Error writing to log file', err);
    });
  }

  // Set up Socket.IO event handling
  io.on('connection', (socket) => {
    logMessage(`New client connected with socket ID: ${socket.id}`);
    socket.join('global_chat');

    socket.on('register_host', (data) => {
      const { hostId, hostName } = data;
      if (!hostId || !hostName) return logMessage('Invalid data received for registering host');

      const hostIndex = availableHosts.findIndex((host) => host.hostId === hostId);
      if (hostIndex !== -1) {
        availableHosts[hostIndex] = { hostId, hostName, socketId: socket.id, isOnline: true };
      } else {
        availableHosts.push({ hostId, hostName, socketId: socket.id, isOnline: true });
      }
      logMessage(`Host ${hostName} registered successfully`);
      io.to('global_chat').emit('available_hosts', availableHosts);

      if (offlineMessages[hostId]) {
        socket.emit('offline_messages', offlineMessages[hostId]);
        delete offlineMessages[hostId];
      }
    });

    socket.on('register_user', (data) => {
      const { userId, userName } = data;
      if (!userId || !userName) return logMessage('Invalid data received for registering user');

      const userIndex = availableUsers.findIndex((user) => user.userId === userId);
      if (userIndex !== -1) {
        availableUsers[userIndex] = { userId, userName, socketId: socket.id, isOnline: true };
      } else {
        availableUsers.push({ userId, userName, socketId: socket.id, isOnline: true });
      }
      logMessage(`User ${userName} registered successfully`);
      io.to('global_chat').emit('available_users', availableUsers);

      if (offlineMessages[userId]) {
        socket.emit('offline_messages', offlineMessages[userId]);
        delete offlineMessages[userId];
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

// The sendMessage controller
async function sendMessage(req, res, next) {
  const { senderId, receiverId, message, messageType } = req.body;

  if (!senderId || !receiverId || !message || !messageType) {
    return res.status(400).json({ msg: 'senderId, receiverId, messageType, and message are required.' });
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ msg: 'Invalid senderId or receiverId.' });
    }

    const sender = await User.findById(senderId) || await Host.findById(senderId);
    const senderIsUser = sender instanceof User;
    const receiver = await User.findById(receiverId) || await Host.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(400).json({ msg: 'Invalid sender or receiver ID.' });
    }

    const roomId = `${senderId}-${receiverId}`;
    const newMessage = new Message({
      senderId,
      receiverId,
      roomId,
      message,
      messageType,
      timestamp: new Date(),
    });

    await newMessage.save();
    console.log("Message saved to database.");

    // Emit the message via Socket.IO
    req.io.to('global_chat').emit('receive_message', {
      senderId,
      receiverId,
      message,
      messageType,
      timestamp: new Date().toISOString(),
    });

    if (senderIsUser) {
      req.body.actionType = 'chat';
      next();
    } else {
      res.status(200).json({ msg: 'Message sent successfully.' });
    }
  } catch (error) {
    console.error('Error occurred while sending message:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
}

// Export both setup function and sendMessage controller
module.exports = { setupSocketIo, sendMessage };
