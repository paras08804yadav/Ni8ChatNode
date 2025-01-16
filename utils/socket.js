const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs'); 

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  }
});

// Export `io` and `server` for use in other modules
module.exports = { io, server };

let availableHosts = [];
let availableUsers = [];
let offlineMessages = {};

// Helper function to log messages to console and a file
function logMessage(message) {
  console.log(message);
  fs.appendFile('server.log', `${new Date().toISOString()} - ${message}\n`, (err) => {
    if (err) console.error('Error writing to log file', err);
  });
}

io.on('connection', (socket) => {
  logMessage(`New client connected with socket ID: ${socket.id}`);
  socket.join('global_chat');

  socket.on('register_host', (data) => {
    const { hostId, hostName } = data;
    if (!hostId || !hostName) {
      logMessage('Invalid data received for registering host');
      return;
    }
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
    if (!userId || !userName) {
      logMessage('Invalid data received for registering user');
      return;
    }
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

  socket.on('send_message', (data) => {
    const { message, hostId, userId, senderId } = data;
    if (!message || !hostId || !userId || !senderId) {
      logMessage('Invalid data received for send_message');
      return;
    }
    const messageData = {
      senderId,
      hostId,
      userId,
      message,
      timestamp: new Date().toISOString(),
    };

    const hostSocketId = availableHosts.find(host => host.hostId === hostId)?.socketId;
    const userSocketId = availableUsers.find(user => user.userId === userId)?.socketId;

    if (hostSocketId || userSocketId) {
      io.to('global_chat').emit('receive_message', messageData);
      logMessage(`Message sent to host ${hostId} and user ${userId}: ${message}`);
    } else {
      if (!offlineMessages[hostId]) offlineMessages[hostId] = [];
      if (!offlineMessages[userId]) offlineMessages[userId] = [];
      offlineMessages[hostId].push(messageData);
      offlineMessages[userId].push(messageData);
      logMessage(`Message stored for offline delivery to host ${hostId} and user ${userId}: ${message}`);
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

