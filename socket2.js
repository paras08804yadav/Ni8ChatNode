const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Message = require('./models/Message');
const checkClients = require('./utils/checkclients');

const app = express();
const server = http.createServer(app);

function logMessage(message) {
    console.log(message);
    fs.appendFile('server.log', `${new Date().toISOString()} - ${message}\n`, (err) => {
        if (err) console.error('Error writing to log file', err);
    });
}

function setupSocketsIo(server) {
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
        console.log(`New client connected with socket ID: ${socket.id}`);

        socket.on('register_user', (data) => {
            try {
                const { userId, userName } = data;
                console.log(`register_user: Registering user ${userName} with userId: ${userId}`);
        
                if (!userId || !userName) {
                    console.log('Invalid data received for registering user');
                    return;
                }
        
                const userIndex = availableUsers.findIndex((user) => user.userId === userId);
                if (userIndex !== -1) {
                    availableUsers[userIndex] = { userId, userName, socketId: socket.id };
                } else {
                    availableUsers.push({ userId, userName, socketId: socket.id });
                }
        
                console.log(`User ${userName} registered successfully`);
        
            } catch (error) {
                console.error(`Error in register_user: ${error.stack}`);
            }
        });
        

        socket.on('register_host', (data) => {
            try {
                const { hostId, hostName } = data;
                console.log(`register_host: Received data - hostId: ${hostId}, hostName: ${hostName}`);

                if (!hostId || !hostName) {
                    console.log('Invalid data received for registering host');
                    return;
                }

                const hostIndex = availableHosts.findIndex((host) => host.hostId === hostId);
                if (hostIndex !== -1) {
                    availableHosts[hostIndex] = { hostId, hostName, socketId: socket.id };
                    console.log(`Updated host ${hostName}`);
                } else {
                    availableHosts.push({ hostId, hostName, socketId: socket.id });
                    console.log(`Registered new host ${hostName}`);
                }

                // Send offline messages to the host if any
                if (offlineMessages[hostId]) {
                    offlineMessages[hostId].forEach((msg) => socket.emit('receive_message', msg));
                    delete offlineMessages[hostId];
                    console.log(`Offline messages sent to host ${hostName}`);
                }
            } catch (error) {
                console.error(`Error in register_host: ${error.stack}`);
            }
        });

        socket.on('send_message', async (data) => {
            try {
                const { message, senderId, receiverId, roomId, senderType } = data;
                console.log(`send_message: Received data - message: ${message}, senderId: ${senderId}, receiverId: ${receiverId}, roomId: ${roomId}, senderType: ${senderType}`);
        
                if (!message || !senderId || !receiverId || !roomId) {
                    console.log('Invalid data received for send_message');
                    return;
                }
        
                if (!mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(receiverId)) {
                    console.log('Validation failed: Invalid senderId or receiverId');
                    return;
                }
        
                // Ensure clients (sender and receiver) are available
                await checkClients(senderId, receiverId, senderType);
                console.log('checkClients completed');
        
                // Determine the target socketId based on the sender's type (user or host)
                const targetSocketId = senderType === 'user'
                    ? availableHosts.find(host => host.hostId === receiverId)?.socketId
                    : availableUsers.find(user => user.userId === receiverId)?.socketId;
        
                if (!targetSocketId) {
                    console.log(`Target socketId not found for receiverId: ${receiverId}`);
                    if (!offlineMessages[receiverId]) offlineMessages[receiverId] = [];
                    offlineMessages[receiverId].push({
                        senderId,
                        receiverId,
                        roomId,
                        message,
                        messageType: 'text',
                        timestamp: new Date().toISOString(),
                    });
                    console.log(`Message stored for offline delivery to ${receiverId}: ${message}`);
                    return;
                }
        
                const messageData = {
                    senderId,
                    receiverId,
                    roomId,
                    message,
                    messageType: 'text',
                    timestamp: new Date().toISOString(),
                };
        
                // Emit the message to the correct recipient (host or user)
                io.to(targetSocketId).emit('receive_message', messageData);
                console.log(`Message sent to ${receiverId}: ${message}`);
        
                // Save message to database
                const adjustedSenderId = senderType === 'user' ? receiverId : senderId;
                const adjustedReceiverId = senderType === 'user' ? senderId : receiverId;
        
                const dbMessage = {
                    senderId: adjustedSenderId,
                    receiverId: adjustedReceiverId,
                    roomId,
                    message,
                    messageType: 'text',
                    timestamp: new Date().toISOString(),
                };
        
                const savedMessage = new Message(dbMessage);
                await savedMessage.save();
                console.log(`Message saved to database: ${JSON.stringify(dbMessage)}`);
            } catch (error) {
                console.error(`Error in send_message: ${error.stack}`);
            }
        });
        
        
        

        socket.on('disconnect', () => {
            try {
                availableHosts = availableHosts.filter(host => host.socketId !== socket.id);
                availableUsers = availableUsers.filter(user => user.socketId !== socket.id);

                console.log(`Client with socket ID ${socket.id} disconnected`);
            } catch (error) {
                console.error(`Error in disconnect: ${error.stack}`);
            }
        });
    });

    return io;
}

module.exports = { setupSocketsIo };
