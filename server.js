const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const Message = require("./models/Message");
const User = require('./models/users');
const path = require("path");
const jwt = require("jsonwebtoken");
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const dotenv = require("dotenv");
const multer = require('multer');
const bcrypt = require('bcrypt');

// Configure multer for file uploads

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

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

// Serve the uploads folder statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Handle image upload
app.post('/upload-image', upload.single('image'), (req, res) => {
    try {
        const imageUrl = `/uploads/${req.file.filename}`;
        const { room, sender, receiver } = req.body;

        // Emit the image message to the room
        io.to(room).emit('receiveMessage', { sender, imageUrl });

        // Optionally: Save the image message to the database
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
  
  // sign token for user middleware
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
      // Recherche de l'utilisateur dans la base de données
      const user = await User.findOne({ username }).exec();
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid username' });
      }
  
      // Comparaison du mot de passe
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Wrong password' });
      }
  
      // Extraction des informations de l'utilisateur
      const { _id, role } = user;
  
      // Création des tokens d'accès et de rafraîchissement
      const TokenPayload = [_id, username, role];
      const accessToken = await signAccessToken(TokenPayload);
      const refreshToken = await signRefreshToken(TokenPayload);
  
      return res.status(200).json({
        success: true,
        msg: "User exists",
        user,
        accessToken,
        refreshToken,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'An error occurred during login' });
    }
  });


app.get("/contacts", verifyAccessToken, async (request, response) => {
    try {
      const excludedUserId = request.query.id;
  
      // Obtenir tous les utilisateurs de la base de données
      const users = await User.find().exec(); 
  
      // Filtrer les utilisateurs pour exclure celui dont l'ID est fourni
      const userArray = users.filter(user => user._id.toString() !== excludedUserId);
  
      // Retourner la liste des contacts
      return response.json({ msg: "List of contacts", users: userArray });
    } catch (error) {
      console.error(error);
      return response.status(500).json({ msg: "Error fetching contacts" });
    }
});
  


app.get("/contact", async (request, response) => {
  const contactID = request.query.id;

  try {
    // Recherche du contact dans la base de données par ID
    const findContact = await User.findById(contactID).exec();

    if (findContact) {
      return response.status(200).json({ success: true, contactInfo: findContact });
    } else {
      // Contact non trouvé
      return response.status(404).json({ success: false, msg: "Contact non trouvé" });
    }
  } catch (error) {
    console.error(error);
    return response.status(500).json({ success: false, msg: "Erreur lors de la récupération du contact" });
  }
});

  

app.post("/register",upload.single('image'),async (request,response) => {
  const {username,password} = request.body;
  try {
    const saltRounds = Number(process.env.SALTROUNDS);
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const image = request.file ? `/uploads/${request.file.filename}` : null;
    const newser = new User({
      username,password:hashedPassword,image,createdAt:new Date()
    });
    await newser.save();
    return response.status(200).json({msg:"user added"})
  } catch (error) {
    console.log(error.message)
  }
})

// Handle socket connection and messaging and calls

const userSockets = {};

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

// Start server
const PORT = process.env.PORT;
server.listen(PORT,() => {
  console.log(`Server is running on port ${PORT}`);
});

