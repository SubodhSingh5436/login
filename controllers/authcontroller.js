const User = require('../models/User');
const jwt = require('jsonwebtoken');
const logger = require('../config/logger');
const sendResponse = require('../config/responseHandler');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// signup User
const signup = async (req, res) => {
    try {
        const { username, email, phone, password } = req.body;

        // Validate password
        if (!password || password.length < 6) {
            return sendResponse(res, 400, 'Password must be at least 6 characters long');
        }

        // Create user
        const user = await User.create({
            username,
            email,
            phone,
            password
        });

        const userData = {
            _id: user._id,
            username: user.username,
            email: user.email,
            phone: user.phone,
            token: generateToken(user._id)
        };

        return sendResponse(res, 201, 'User registered successfully', userData);
    } catch (error) {
        // Handle mongoose validation errors
        if (error.name === 'ValidationError') {
            return sendResponse(
                res, 
                400, 
                Object.values(error.errors).map(err => err.message).join(', ')
            );
        }

        // Handle duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            logger.error('Duplicate key error', {
                error: error.message,
                field,
                value: error.keyValue[field]
            });
            return sendResponse(
                res, 
                400, 
                `${field.charAt(0).toUpperCase() + field.slice(1)} is already registered`
            );
        }

        logger.error('Signup error', {
            error: error.message,
            stack: error.stack,
            body: req.body
        });

        return sendResponse(res, 500, 'An error occurred during signup');
    }
};

// Login User
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return sendResponse(res, 400, 'Please provide username and password');
        }

        // Find user
        const user = await User.findOne({ username });
        
        // Check if user exists and password matches
        if (!user || !(await user.matchPassword(password))) {
            return sendResponse(res, 401, 'Invalid username or password');
        }

        const userData = {
            _id: user._id,
            username: user.username,
            email: user.email,
            phone: user.phone,
            token: generateToken(user._id)
        };

        return sendResponse(res, 200, 'Login successful', userData);
    } catch (error) {
        logger.error('Login error', {
            error: error.message,
            stack: error.stack
        });
        return sendResponse(res, 500, 'An error occurred during login');
    }
};

module.exports = {
    signup,
    login
};
