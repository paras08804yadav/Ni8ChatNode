const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import the User model to check user existence
require('dotenv').config();
const secretKey = process.env.JWT_SECRET; // Use the secret key from environment variables


// Middleware to authenticate and verify the token
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract the token from the Authorization header

    if (!token) {
        // If no token is provided, return an Unauthorized error
        return res.status(401).json({ message: 'Token not provided' });
    }

    try {
        // Verify the token using the secret key
        const decoded = jwt.verify(token, secretKey);

        // Use the decoded user ID to find the user in the database
        const user = await User.findById(decoded.id);
        if (!user) {
            // If user does not exist, respond with an error
            return res.status(404).json({ message: 'User not found' });
        }

        // Token is valid, and user exists, so proceed to the next middleware or route
        req.user = user; // Attach user info to the request for future use
        next(); // Proceed to the next handler
    } catch (error) {
        // If the token is invalid or expired, send a Forbidden error
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

module.exports = authenticateToken;
