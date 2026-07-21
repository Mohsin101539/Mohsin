const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
    let token = req.cookies && req.cookies.auth_token;

    if (!token && req.headers.authorization) {
        const parts = req.headers.authorization.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
            token = parts[1];
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, error: 'Unauthorized: Missing session token.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        if (decoded.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Forbidden: Insufficient privileges.' });
        }
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Unauthorized: Invalid or expired token.' });
    }
}

module.exports = requireAuth;
