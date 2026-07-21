const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const requireAuth = require('../middleware/requireAuth');

const IMAGES_DIR = path.join(__dirname, '../../images');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, IMAGES_DIR);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const baseName = path.basename(file.originalname, ext)
            .replace(/[^a-zA-Z0-9_-]/g, '_')
            .toLowerCase();
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E4);
        cb(null, `${baseName}-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
        }
    }
}).single('image');

// POST /api/upload (Protected)
router.post('/', requireAuth, (req, res) => {
    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ success: false, error: `Multer error: ${err.message}` });
        } else if (err) {
            return res.status(400).json({ success: false, error: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No image file uploaded.' });
        }

        const relativePath = `images/${req.file.filename}`;
        return res.json({
            success: true,
            filePath: relativePath,
            message: 'Image uploaded successfully.'
        });
    });
});

module.exports = router;
