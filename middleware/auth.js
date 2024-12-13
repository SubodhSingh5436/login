const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendResponse = require('../config/responseHandler');

const protect = async (req, res, next) => {
    try {
        let token;
        
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return sendResponse(res, 401, 'Not authorized, no token');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        next();
    } catch (error) {
        return sendResponse(res, 401, 'Not authorized, token failed');
    }
};

module.exports = { protect };
