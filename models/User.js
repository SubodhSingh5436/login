const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate: {
            validator: function(v) {
                // Basic phone validation (can be customized based on your needs)
                return /^\+?[\d\s-]{10,}$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    password: {
        type: String,
        required: true,
        minlength: [6, 'Password must be at least 6 characters long']
    },
    profilePicture: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to check password
userSchema.methods.matchPassword = async function(enteredPassword) {
    try {
        return await bcrypt.compare(enteredPassword, this.password);
    } catch (error) {
        throw new Error('Password comparison failed');
    }
};

module.exports = mongoose.model('User', userSchema); 