const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, '..');

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
    app.use(cors({ origin: true, credentials: true }));
}

// 301 Permanent Redirects for legacy multi-page URLs
app.get('/education.html', (req, res) => res.redirect(301, '/#education'));
app.get('/portfolio.html', (req, res) => res.redirect(301, '/#projects'));
app.get('/experiences.html', (req, res) => res.redirect(301, '/#experience'));
app.get('/contact.html', (req, res) => res.redirect(301, '/#contact'));

// API Routes
app.use('/api', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/upload', uploadRoutes);

// Serve static frontend assets and admin app
app.use(express.static(PUBLIC_DIR));

// Serve Admin Panel explicitly on /admin route
app.get('/admin*', (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'admin', 'index.html'));
});

// Fallback to index.html for root requests
app.get('*', (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 Mohsin Portfolio Server running on port ${PORT}`);
    console.log(`🌐 Public App:  http://localhost:${PORT}/`);
    console.log(`🔐 Admin Panel: http://localhost:${PORT}/admin`);
    console.log(`=================================================`);
});
