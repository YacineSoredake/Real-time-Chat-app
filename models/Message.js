const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    room: String,          // Unique room identifier, e.g., `room-1-2`
    sender: String,        // Sender user ID
    receiver: String,      // Receiver user ID
    message: String,       // Message content
    timestamp: { type: Date, default: Date.now }  // Time the message was sent
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
