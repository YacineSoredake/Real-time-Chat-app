const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const Message = require("./models/Message");
const userModel = require('./models/users');
const path = require("path");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const dotenv = require("dotenv");
const { SocketAddress } = require("net");

mongoose.connect("mongodb://localhost:27017/chatApp")
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));

// Middleware

dotenv.config();
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));

app.get("/",(request,response) => {
   response.redirect("/public/views/login.html")
})

const signAccessToken = async (user) => {
    const payload = {
        expiresIn:'2d',
        issuer:'auth-servicz',
        audience:"myapp",
        userID:user[0],
        username:user[1],
        role:user[2]
      };
    const secret = process.env.ACCES_TOKEN_SECRET;
    const acccesToken = jwt.sign(payload,secret);
    return acccesToken
  }
  
  // sign token for user middleware
  
  const signRefreshToken = async (user) => {
  const payload = {
    expiresIn:'30d',
    issuer:'auth-servicz',
    audience:"myapp",
    userID:user[0],
    username:user[1],
    role:user[2]
  };
  const secret = process.env.REFRESH_TOKEN_SECRET;
  const refreshtoken = jwt.sign(payload,secret);
  return refreshtoken
  }

  const verifyAccessToken = (request, response, next) => {
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      return response.status(401).json({ message: 'Authorization header missing' });
    }
    const accestoken = authHeader.split(' ')[1];
    jwt.verify(accestoken,process.env.ACCES_TOKEN_SECRET, (err, payload) => {
      if (err) {
        let message = '';
        if (err.name === 'TokenExpiredError') {
          message = 'Token expired';
        } else if (err.name === 'JsonWebTokenError') {
          message = 'Unauthorized';
        } else {
          message = err.message;
        }
        return response.status(401).json({ message });
      }
      request.payload = payload;
      next();
    });
  };

const verifyRefreshToken = async (refToken) => {
    if(!refToken){
      console.log("ref token empty")
    }
    return new Promise((resolve, reject) => {
      jwt.verify(refToken,process.env.REFRESH_TOKEN_SECRET,(err,payload) => {
        if (err) {
          return reject(err)
        }
        const userID = payload.userId;
        resolve(userID)
       })
    })
  }


const RefreshAccessToken = async (request, response) => {
    try {
      const authHeader = request.headers['authorization'];
      if (!authHeader) {
        return response.status(401).json({ message: 'Authorization header missing' });
      }
      const refreshToken = authHeader.split(' ')[1];
      if (!refreshToken) {
        return response.status(404).json({ msg: "No token in client side" });
      }
  
      const userID = await verifyRefreshToken(refreshToken);
      const findUser = userArray.find(u.id = userID)
      const TokenPayload = [userID,findUser.username,findUser.role]
      const newAccessToken = await signAccessToken(TokenPayload);
      const newRefreshToken = await signRefreshToken(TokenPayload);
      return response.status(200).json({ success: true, refreshToken: newRefreshToken, accessToken: newAccessToken });
    } catch (error) {
      return response.status(500).json({ message: 'Internal server error' });
    }
  };
  
  // sign token for user middleware
app.post('/login',async (req, res) => {
    const { username, password } = req.body;
    const userArray = userModel.users;
    
    // Find the user in the array
    const user = userArray.find(u => u.username === username && u.password === password);
    // username = user[username];
    if (user) {
        const {id,role} = userArray.find(u => u.username === username && u.password === password);
        const TokenPayload = [id,username,role]
        const accessToken = await signAccessToken(TokenPayload);
        const refreshToken = await signRefreshToken(TokenPayload);
        return res.status(200).json({
          success: true,
          msg: "user exist",
          user,
          accessToken: accessToken,
          refreshToken: refreshToken,
        });
    } else {
        res.status(401).json({ message: 'Invalid username or password' });
    }
});



app.get("/contacts",verifyAccessToken,async (request,response) => {
    const userArray = userModel.users;
    return response.json({msg:"list of contatcs" , users: userArray});
})

app.get("/contact", (request,response) => {
  const userArray = userModel.users;
  const contactID = request.query.id;
  if (!Number(contactID)) {
    return response.status(400).json({msg:"id must be a number"})
  }
  const findContact = userArray.find(c => c.id == contactID);
  if (findContact) {
    return response.status(200).json({success:true,contactInfo:findContact})
  }
})

// Handle socket connection and messaging
io.on('connection', (socket) => {
  console.log(`hello to the chat mr ${socket.id}`);
  
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
});


// Start server
const PORT = process.env.PORT;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
