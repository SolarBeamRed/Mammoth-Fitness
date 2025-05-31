const jwt = require('jsonwebtoken');
const db = require('../db');

const auth = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No authentication token, authorization denied' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from database
        const [user] = await db.query(
            'SELECT id, username, email FROM users WHERE id = ?',
            [decoded.userId]
        );

        if (!user) {
            throw new Error();
        }

        // Add user to request object
        req.user = user;
        req.token = token;
        
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = auth;