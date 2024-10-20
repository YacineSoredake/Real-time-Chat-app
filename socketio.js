const Message = require('./models/Message'); // Import your Message model

const userSockets = {}; // Store connected users

const socketHandler = (io) => {
    io.on('connection', (socket) => {
        
        socket.on('entered', (userID) => {
            userSockets[userID] = socket.id;
            socket.userID = userID; 
            console.log(userSockets);
        });
        
        // Handle joining a room and loading previous messages
        socket.on('joinRoom', async (room) => {
            try {
                // Fetch messages for the specific room from the database
                const messages = await Message.find({ room }).sort({ timestamp: 1 }).exec();

                // Emit the previously loaded messages to the client
                socket.emit('loadMessages', messages);
                // Join the room
                socket.join(room);
            } catch (err) {
                console.error('Error retrieving messages:', err);
                socket.emit('errorMessage', 'Failed to load messages.');
            }
        });

        // Handle sending a message
        socket.on('chatMessage', async ({ room, message, sender, receiver }) => {
            try {
                // Save the new message to the database with a timestamp
                const newMessage = new Message({
                    room,
                    sender,
                    receiver,
                    message,
                    timestamp: new Date()
                });
                await newMessage.save();

                // Emit the new message to everyone in the room
                io.to(room).emit('receiveMessage', { sender, message, timestamp: newMessage.timestamp });
            } catch (err) {
                console.error('Error saving message:', err);
                socket.emit('errorMessage', 'Failed to send the message.');
            }
        });

        // Handle video call events
        socket.on('call-user', (data) => {
            const socketID = userSockets[data.to];
            io.to(socketID).emit('call-made', {
                offer: data.offer,
                from: socket.id,
                callerId: data.to
            });
        });

        socket.on('call-answered', (data) => {
            io.to(data.to).emit('call-answered', {
                answer: data.answer,
                from: socket.id
            });
        });

        socket.on('call-declined', (data) => {
            io.to(data.from).emit('call-declined');
        });

        socket.on('ice-candidate', (data) => {
            io.to(data.to).emit('ice-candidate', data);
        });

        // Handle user disconnect
        socket.on('disconnect', () => {
            if (socket.userID) {
                delete userSockets[socket.userID];  // Remove user from the userSockets object
                console.log(`User with ID ${socket.userID} disconnected.`);
                console.log('Remaining users:', userSockets);
            }
        });
    });
};

module.exports = socketHandler;
