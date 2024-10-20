const User = require('../models/users');
const bcrypt = require('bcrypt');
const { signAccessToken, signRefreshToken } = require('../middlewares/authutils');

// Register a new user
exports.register = async (request,response) => {
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
};

// Login user
exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
      const user = await User.findOne({ username }).exec();
      if (!user) {
        return res.status(401).json({ message: 'Invalid username' });
      }
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Wrong password' });
      }
      const { _id, role } = user;
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
  };
