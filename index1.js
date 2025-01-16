// index.js
const express = require('express');
const dotenv = require('dotenv');
const path = require('path'); 
const multer = require('multer');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const hostRoutes = require('./routes/hostRoutes');
const agencyRoutes = require('./routes/agencyRoutes');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs'); // For logging
const cors = require('cors');
const app = express();

dotenv.config();
const server = http.createServer(app); // Create HTTP server
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  }
});

// Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Set static folders
app.use('/Avtar', express.static(path.join(__dirname, 'Avtar')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
connectDB();

// Mount routes
app.use('/api/users', userRoutes);
app.use('/api/hosts', hostRoutes);
app.use('/api/agencies', agencyRoutes);

// Socket.IO setup
let availableHosts = [];
let availableUsers = [];
let offlineMessages = {};

const voiceMessagesDir = path.join(__dirname, 'voice_messages');
if (!fs.existsSync(voiceMessagesDir)) fs.mkdirSync(voiceMessagesDir, { recursive: true });

// Logging helper function
function logMessage(message) {
  console.log(message);
  fs.appendFileSync('server.log', `${new Date().toISOString()} - ${message}\n`, (err) => {
    if (err) console.error('Error writing to log file', err);
  });
}

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

  socket.on('register_user', (data) => {
    const { userId, userName } = data;
    if (!userId || !userName) {
      logMessage('Invalid data received for registering user');
      return;
    }

    const userIndex = availableUsers.findIndex(user => user.userId === userId);
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

// Start the server
const PORT = process.env.PORT || 5000;
const HOST = 'localhost';

server.listen(PORT, HOST, () => {
  logMessage(`Server running at http://${HOST}:${PORT}`);
});

