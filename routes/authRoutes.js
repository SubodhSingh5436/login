const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/signup', signup);
router.post('/login', login);

// Protected route example
router.get('/me', protect, (req, res) => {
    res.json(req.user);
});

module.exports = router;
