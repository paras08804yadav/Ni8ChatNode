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

                // Join user to a unique room for their session
                socket.join(userId); // Use userId as roomId
                console.log(`User ${userName} registered and joined room: ${userId}`);
                if (offlineMessages[userId]) {
                    offlineMessages[userId].forEach((msg) => socket.emit('receive_message', msg));
                    delete offlineMessages[userId];
                    console.log(`Offline messages sent to user ${userName}`);
                }
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

                // Join host to a unique room for their session
                socket.join(hostId); // Use hostId as roomId
                console.log(`Host ${hostName} registered and joined room: ${hostId}`);

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
                const { message, senderId, receiverId, senderType } = data;
                console.log(`send_message: Data received - message: ${message}, senderId: ${senderId}, receiverId: ${receiverId},  senderType: ${senderType}`);
                
                // Validate incoming data
                if (!message || !senderId || !receiverId || !senderType) {
                    console.error('Invalid data received for send_message');
                    return;
                }
        
                // Prepare message data
                const messageData = {
                    senderId,
                    receiverId,
                    message,
                    messageType: 'text',
                    timestamp: new Date().toISOString(),
                };
                
                let receiverRoom;
                if (senderType === 'user') {
                    receiverRoom = receiverId; // User's unique room
                } else if (senderType === 'host') {
                    receiverRoom = receiverId; // Host's unique room
                }
        

                // Send message to the specific room (receiver's room)
                io.to(receiverRoom).emit('receive_message', messageData);
                console.log(`Message sent to room ${receiverId}: ${message}`);
        
                // Save message to database
                const dbMessage = {
                    senderId,
                    receiverId,
                    message,
                    messageType: 'text',
                    timestamp: new Date().toISOString(),
                };
        
                const savedMessage = new Message(dbMessage);
                await savedMessage.save();
                logMessage(`Message saved to database: ${JSON.stringify(dbMessage)}`);
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



// const express = require('express');
// const http = require('http');
// const socketIo = require('socket.io');
// const fs = require('fs');
// const mongoose = require('mongoose');
// const Message = require('./models/Message');

// const app = express();
// const server = http.createServer(app);

// function logMessage(message) {
//     console.log(message);
//     fs.appendFile('server.log', `${new Date().toISOString()} - ${message}\n`, (err) => {
//         if (err) console.error('Error writing to log file', err);
//     });
// }

// function setupSocketsIo(server) {
//     const io = socketIo(server, {
//         cors: {
//             origin: "*",
//             methods: ["GET", "POST"],
//             allowedHeaders: ["my-custom-header"],
//             credentials: true,
//         }
//     });

//     let availableHosts = [];
//     let availableUsers = [];

//     io.on('connection', (socket) => {
//         console.log(`New client connected with socket ID: ${socket.id}`);

//         socket.on('register_user', (data) => {
//             try {
//                 const { userId, userName } = data;
//                 console.log(`register_user: Registering user ${userName} with userId: ${userId}`);
//                 if (!userId || !userName) return console.log('Invalid data for registering user');
        
//                 // Update available users
//                 const userIndex = availableUsers.findIndex(user => user.userId === userId);
//                 if (userIndex !== -1) {
//                     availableUsers[userIndex] = { userId, userName, socketId: socket.id };
//                 } else {
//                     availableUsers.push({ userId, userName, socketId: socket.id });
//                 }
        
//                 // Join user to their specific room
//                 socket.join(userId);
//                 console.log(`User ${userName} joined room: ${userId}`);
//             } catch (error) {
//                 console.error(`Error in register_user: ${error.stack}`);
//             }
//         });
        
//         socket.on('register_host', (data) => {
//             try {
//                 const { hostId, hostName } = data;
//                 console.log(`register_host: Registering host ${hostName} with hostId: ${hostId}`);
//                 if (!hostId || !hostName) return console.log('Invalid data for registering host');
        
//                 // Update available hosts
//                 const hostIndex = availableHosts.findIndex(host => host.hostId === hostId);
//                 if (hostIndex !== -1) {
//                     availableHosts[hostIndex] = { hostId, hostName, socketId: socket.id };
//                 } else {
//                     availableHosts.push({ hostId, hostName, socketId: socket.id });
//                 }
        
//                 // Join host to their specific room
//                 socket.join(hostId);
//                 console.log(`Host ${hostName} joined room: ${hostId}`);
//             } catch (error) {
//                 console.error(`Error in register_host: ${error.stack}`);
//             }
//         });
        

//         socket.on('send_message', async (data) => {
//             try {
//                 // Destructure incoming data
//                 const { roomId, message, senderId, receiverId, senderType } = data;
//                 console.log(`send_message: Received - message: ${message}, senderId: ${senderId}, receiverId: ${receiverId}, senderType: ${senderType}`);
        
//                 // Validate required data
//                 if (!message || !senderId || !receiverId || !senderType) {
//                     return console.error('Invalid data for send_message');
//                 }
        
//                 // If roomId is not provided, create one based on sender and receiver IDs
//                 let finalRoomId = roomId;
//                 if (!roomId) {
//                     finalRoomId = [senderId, receiverId].sort().join("_");
//                 }
        
//                 // Join the room if not already joined
//                 socket.join(finalRoomId);
//                 io.to(finalRoomId).emit('room_confirmation', `Room ${finalRoomId} joined successfully`);
        
//                 // Emit the message to the room
//                 io.to(finalRoomId).emit('receive_message', { message, senderId, receiverId, timestamp: new Date().toISOString() });
//                 console.log(`Message sent to room ${finalRoomId}: ${message}`);
        
//                 // Save message to the database
//                 const savedMessage = new Message({
//                     senderId,
//                     receiverId,
//                     roomId: finalRoomId,
//                     message,
//                     messageType: 'text',
//                     timestamp: new Date(),
//                 });
//                 await savedMessage.save();
//                 console.log(`Message saved to database: ${JSON.stringify(savedMessage)}`);
        
//             } catch (error) {
//                 console.error(`Error in send_message: ${error.stack}`);
//             }
//         });
        
        

//         socket.on('join_room', ({ roomId, hostId, userId }) => {

//             if (!roomId || !hostId || !userId) {
//                 console.error('Invalid join_room parameters:', { roomId, hostId, userId });
//                 return;
//             }
//             socket.join(roomId);
//             console.log(`User or Host joined room: ${roomId}`);
//         });
        
        

//         socket.on('disconnect', () => {
//             try {
//                 availableHosts = availableHosts.filter(host => host.socketId !== socket.id);
//                 availableUsers = availableUsers.filter(user => user.socketId !== socket.id);
//                 console.log(`Client with socket ID ${socket.id} disconnected`);
//             } catch (error) {
//                 console.error(`Error in disconnect: ${error.stack}`);
//             }
//         });
//     });

//     return io;
// }

// module.exports = { setupSocketsIo };
