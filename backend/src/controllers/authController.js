const User = require('../models/User');
const OTP = require('../models/OTP');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
};

exports.sendOTP = async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) return res.status(400).json({ message: 'Phone number is required' });

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Use Twilio if configured, otherwise log to console
        if (process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN) {
            // Placeholder for Twilio integration
            console.log(`[Twilio] Sending OTP ${code} to ${phone}`);
        } else {
            console.log(`\n---------------------------------`);
            console.log(`[CityFix OTP System]`);
            console.log(`To: ${phone}`);
            console.log(`Verification Code: ${code}`);
            console.log(`---------------------------------\n`);
        }

        await OTP.findOneAndUpdate(
            { phone },
            { code, createdAt: Date.now() },
            { upsert: true, new: true }
        );

        res.json({ success: true, message: 'OTP sent successfully (Check server logs)' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending OTP', error: error.message });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { phone, code } = req.body;
        const otpRecord = await OTP.findOne({ phone, code });

        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        await OTP.deleteOne({ _id: otpRecord._id });
        res.json({ success: true, message: 'OTP verified' });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying OTP', error: error.message });
    }
};

exports.registerUser = async (req, res) => {
    try {
        const { name, email, phone, password, role } = req.body;
        
        const userExists = await User.findOne({ $or: [{ email }, { phone }] });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email or phone already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({ 
            name, 
            email, 
            phone, 
            password: hashedPassword, 
            role: role || 'citizen',
            isVerified: true // Assuming OTP verified on frontend before this call
        });

        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (user && (await bcrypt.compare(password, user.password))) {
            if (!user.isVerified) {
                return res.status(401).json({ message: 'Phone number not verified' });
            }
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
