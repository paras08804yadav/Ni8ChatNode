const mongoose = require('mongoose');
const Message = require('./models/Message');
const User = require('./models/User'); // Ensure the path is correct to your User model
const checkClients = require('./utils/checkclients');
const checkBalance = require('./utils/checkBalance');


function setupSocketsIo(io) {


    const availableUsers = []; // To track online users
    const availableHosts = []; // To track online hosts
    const offlineMessages = {}; // To store offline messages for users/hosts

    io.on('connection', (socket) => {
        console.log(`New connection: ${socket.id}`);

        // User Registration
        socket.on('register_user', (data) => {
            try {
                const { userId, userName } = data;
                if (!userId || !userName) {
                    console.error('Invalid data received for registering user');
                    return;
                }

                const userIndex = availableUsers.findIndex((user) => user.userId === userId);
                if (userIndex !== -1) {
                    availableUsers[userIndex] = { userId, userName, socketId: socket.id };
                } else {
                    availableUsers.push({ userId, userName, socketId: socket.id });
                }

                const userRoom = userId;
                socket.join(userRoom); // User's unique room
                console.log(`User ${userName} registered and joined room: ${userRoom}`);

                // Send offline messages to the user
                if (offlineMessages[userRoom]) {
                    offlineMessages[userRoom].forEach((msg) => {
                        socket.emit('receive_message', msg);
                        sendNotification(msg.receiverId, msg.message); // Send notification on offline message
                    });
                    delete offlineMessages[userRoom];
                    console.log(`Offline messages sent to user ${userName}`);
                }
            } catch (error) {
                console.error(`Error in register_user: ${error.stack}`);
            }
        });

        // Host Registration
        socket.on('register_host', (data) => {
            try {
                const { hostId, hostName } = data;
                if (!hostId || !hostName) {
                    console.error('Invalid data received for registering host');
                    return;
                }

                const hostIndex = availableHosts.findIndex((host) => host.hostId === hostId);
                if (hostIndex !== -1) {
                    availableHosts[hostIndex] = { hostId, hostName, socketId: socket.id };
                } else {
                    availableHosts.push({ hostId, hostName, socketId: socket.id });
                }

                const hostRoom = hostId;
                socket.join(hostRoom); // Host's unique room
                console.log(`Host ${hostName} registered and joined room: ${hostRoom}`);

                // Send offline messages to the host
                if (offlineMessages[hostRoom]) {
                    offlineMessages[hostRoom].forEach((msg) => {
                        socket.emit('receive_message', msg);
                        sendNotification(msg.receiverId, msg.message); // Send notification on offline message
                    });
                    delete offlineMessages[hostRoom];
                    console.log(`Offline messages sent to host ${hostName}`);
                }
            } catch (error) {
                console.error(`Error in register_host: ${error.stack}`);
            }
        });

        const getDeviceToken = async (userId) => {
            // Query your database to get the device token for the given userId
            const user = await User.findOne({ userId }); // Adjust this based on your model
            if (!user || !user.deviceToken) {
                throw new Error('Device token not found');
            }
            return user.deviceToken;
        };

        // Send Message
        socket.on('send_message', async (data) => {
            try {
                const { message, senderId, receiverId, senderType } = data;

                if (!message || !senderId || !receiverId || !senderType) {
                    console.error('Invalid data received for send_message');
                    return;
                }
                console.log(`${message}, ${senderId}, ${receiverId}, ${senderType}`);
                if(senderType==="user"){
                    isEnough = checkBalance(senderId, receiverId);
                    console.log(`${isEnough}`);
                    if (isEnough === false) {
                        console.log('Insufficient balance for sender');
                        return callback({
                            success: false,
                            msg: 'Insufficient balance to send the message.',
                        }); 
                    }
                await checkClients(senderId, receiverId, senderType);
                };
                const messageData = {
                    senderId,
                    receiverId,
                    message,
                    messageType: 'text',
                    timestamp: new Date().toISOString(),
                };

                // Determine the receiver's room
                const receiverRoom = receiverId;

                // Check if the recipient is online
                const clientsInRoom = io.sockets.adapter.rooms.get(receiverRoom);
                if (clientsInRoom && clientsInRoom.size > 0) {
                    // Recipient is online
                    io.to(receiverRoom).emit('receive_message', messageData);
                    console.log(`Message sent to room ${receiverRoom}: ${message}`);
                } else {
                    // Recipient is offline, store the message
                    if (!offlineMessages[receiverRoom]) offlineMessages[receiverRoom] = [];
                    offlineMessages[receiverRoom].push(messageData);
                    console.log(`Message stored offline for room ${receiverRoom}`);
                }

                // Save the message to the database
                const dbMessage = new Message(messageData);
                await dbMessage.save();

                const userDeviceToken = await getDeviceToken(receiverId);

                const payload = {
                    notification:{
                        title: 'New Message',
                        body: messageData.message,
                    },
                    token: userDeviceTocken
                }
                admin.messaging().send(playload).then((response)=>{
                    console.log('Notification sent successfully:', response);
                })
                .catch((error)=>{
                    console.error('Error sending notification:', error )
                })

                console.log(`Message saved to database: ${JSON.stringify(dbMessage)}`);
            } catch (error) {
                console.error(`Error in send_message: ${error.stack}`);
            }
        });

        

        const sendNotification = async (receiverId, message) => {
            try {
                const userDeviceToken = await getDeviceToken(receiverId);

                const payload = {
                    notification: {
                        title: 'Offline Message Delivered',
                        body: message,
                    },
                    token: userDeviceToken,
                };

                admin.messaging().send(payload).then((response) => {
                    console.log('Notification for offline message sent successfully:', response);
                })
                    .catch((error) => {
                        console.error('Error sending notification for offline message:', error);
                    });
            } catch (error) {
                console.error('Error in sendNotification:', error);
            }
        };




        // Disconnect
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
            // Remove the user/host from available lists
            availableUsers.splice(
                availableUsers.findIndex((user) => user.socketId === socket.id),
                1
            );
            availableHosts.splice(
                availableHosts.findIndex((host) => host.socketId === socket.id),
                1
            );
        });
    });

    return io;
}

module.exports = { setupSocketsIo };