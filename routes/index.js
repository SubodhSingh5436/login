const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');

// Health check route
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Server is healthy and running'
    });
});

// API version prefix
router.use('/api/v1/auth', authRoutes);

// Handle 404 for API routes
router.use('/api/*', (req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'API endpoint not found'
    });
});

module.exports = router;
