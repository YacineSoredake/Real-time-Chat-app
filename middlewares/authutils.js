const jwt = require("jsonwebtoken");

// Function to sign access tokens
const signAccessToken = async (user) => {
    const payload = {
        expiresIn: '2d',
        issuer: 'auth-servicz',
        audience: "myapp",
        userID: user[0],
        username: user[1],
        role: user[2]
    };
    const secret = process.env.ACCES_TOKEN_SECRET;
    const accessToken = jwt.sign(payload, secret);
    return accessToken;
};

// Function to sign refresh tokens
const signRefreshToken = async (user) => {
    const payload = {
        expiresIn: '30d',
        issuer: 'auth-servicz',
        audience: "myapp",
        userID: user[0],
        username: user[1],
        role: user[2]
    };
    const secret = process.env.REFRESH_TOKEN_SECRET;
    const refreshToken = jwt.sign(payload, secret);
    return refreshToken;
};

// Middleware to verify access tokens
const verifyAccessToken = (request, response, next) => {
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
        return response.status(401).json({ message: 'Authorization header missing' });
    }
    const accessToken = authHeader.split(' ')[1];
    jwt.verify(accessToken, process.env.ACCES_TOKEN_SECRET, (err, payload) => {
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

// Function to verify refresh tokens
const verifyRefreshToken = async (refToken) => {
    if (!refToken) {
        console.log("ref token empty");
    }
    return new Promise((resolve, reject) => {
        jwt.verify(refToken, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
            if (err) {
                return reject(err);
            }
            const userID = payload.userId;
            resolve(userID);
        });
    });
};

module.exports = {
    signAccessToken,
    signRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
};
// const RefreshAccessToken = async (accessTkn) => {
//     try {
//       const userID = await verifyRefreshToken(refreshToken);
//       const findUser = userArray.find(u.id = userID)
//       const TokenPayload = [userID,findUser.username,findUser.role]
//       const newAccessToken = await signAccessToken(TokenPayload);
//       const newRefreshToken = await signRefreshToken(TokenPayload);
//       return response.status(200).json({ success: true, refreshToken: newRefreshToken, accessToken: newAccessToken });
//     } catch (error) {
//       return response.status(500).json({ message: 'Internal server error' });
//     }
//   };