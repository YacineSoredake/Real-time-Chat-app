const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

const authroute = require('./routes/authroute');
const contactroute = require('./routes/contactroute');
const profileRoutes = require('./routes/profileroute');
const socketHandler = require('./socketio'); 

const app = express();
const server = http.createServer(app);
const io = new Server(server);

dotenv.config();
// database connection
mongoose.connect(`mongodb://localhost:27017/${process.env.FILENAME}`)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));

// config
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// landing page
app.get("/", (request, response) => {
    response.redirect("/public/views/login.html");
});

// Use routes
app.use('/', authroute);
app.use('/', profileRoutes);
app.use('/', contactroute);


// Handle image upload for chat
const { upload } = require('./middlewares/filemiddleware');

app.post('/upload-image', upload.single('image'), (req, res) => {
    try {
        const imageUrl = `/uploads/${req.file.filename}`;
        const { room, sender, receiver } = req.body;

        // Emit the image message to the room
        io.to(room).emit('receiveMessage', { sender, imageUrl });

        // Save the image message to the database
        const newMessage = new Message({
            room,
            sender,
            receiver,
            imageUrl,
            timestamp: new Date()
        });
        newMessage.save();

        res.json({ success: true, imageUrl });
    } catch (err) {
        console.error('Error uploading image:', err);
        res.status(500).json({ success: false, message: 'Image upload failed' });
    }
});

// Initialize socket.io handling
socketHandler(io); 

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
