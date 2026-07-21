const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

// Rate limiter: Max 50 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: { success: false, error: 'Too many login attempts. Please try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false
});

// POST /api/login
router.post('/login', loginLimiter, async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ success: false, error: 'Password is required.' });
        }

        const hash = process.env.ADMIN_PASSWORD_HASH;
        if (!hash) {
            return res.status(500).json({ success: false, error: 'Server authentication unconfigured.' });
        }

        const match = await bcrypt.compare(password, hash);
        if (!match) {
            return res.status(401).json({ success: false, error: 'Invalid credentials.' });
        }

        const token = jwt.sign(
            { role: 'admin', loggedInAt: Date.now() },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '4h' }
        );

        const isProduction = process.env.NODE_ENV === 'production';

        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'strict',
            maxAge: 4 * 60 * 60 * 1000 // 4 hours
        });

        return res.json({ success: true, message: 'Authentication successful.' });
    } catch (err) {
        return res.status(500).json({ success: false, error: 'Server error during authentication.' });
    }
});

// POST /api/logout
router.post('/logout', (req, res) => {
    res.clearCookie('auth_token');
    return res.json({ success: true, message: 'Logged out successfully.' });
});

// GET /api/auth/status
router.get('/status', (req, res) => {
    const token = req.cookies && req.cookies.auth_token;
    if (!token) return res.json({ authenticated: false });

    try {
        jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        return res.json({ authenticated: true });
    } catch (e) {
        return res.json({ authenticated: false });
    }
});

module.exports = router;
