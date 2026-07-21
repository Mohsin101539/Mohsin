const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const requireAuth = require('../middleware/requireAuth');

const CONTENT_PATH = path.join(__dirname, '../../content.json');

// Mongoose Schema & Model for Portfolio Content
const ContentSchema = new mongoose.Schema({
    contentId: { type: String, default: 'main_content', unique: true },
    data: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true });

const ContentModel = mongoose.models.PortfolioContent || mongoose.model('PortfolioContent', ContentSchema);

// GET /api/content
router.get('/', async (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // 1. Try reading from MongoDB if connected
    if (mongoose.connection.readyState === 1) {
        try {
            const doc = await ContentModel.findOne({ contentId: 'main_content' });
            if (doc && doc.data) {
                return res.json(doc.data);
            }
        } catch (e) {
            console.warn('MongoDB read failed, using content.json fallback:', e.message);
        }
    }

    // 2. Fallback to local content.json
    fs.readFile(CONTENT_PATH, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ success: false, error: 'Unable to read content file.' });
        }
        try {
            const json = JSON.parse(data);
            res.json(json);
        } catch (e) {
            res.status(500).json({ success: false, error: 'Malformed JSON content file.' });
        }
    });
});

// PUT /api/content (Protected)
router.put('/', requireAuth, async (req, res) => {
    const updatedContent = req.body;

    if (!updatedContent || typeof updatedContent !== 'object') {
        return res.status(400).json({ success: false, error: 'Invalid content payload format.' });
    }

    const validKeys = [
        'hero', 'about', 'testimonials', 'education', 'projects',
        'designWork', 'experience', 'stats', 'coursePromo',
        'brands', 'whyChooseMe', 'services', 'certificates', 'contact', 'messages'
    ];

    const payloadKeys = Object.keys(updatedContent);
    const hasUnknownKeys = payloadKeys.some(key => !validKeys.includes(key));

    if (hasUnknownKeys) {
        return res.status(400).json({ success: false, error: 'Payload contains unknown root fields.' });
    }

    let current = {};
    try {
        if (fs.existsSync(CONTENT_PATH)) {
            current = JSON.parse(fs.readFileSync(CONTENT_PATH, 'utf8'));
        }
    } catch(e) {}

    const merged = { ...current, ...updatedContent };

    // 1. If MongoDB is connected, save directly to cloud database
    let savedToDb = false;
    if (mongoose.connection.readyState === 1) {
        try {
            await ContentModel.findOneAndUpdate(
                { contentId: 'main_content' },
                { data: merged },
                { upsert: true, returnDocument: 'after' }
            );
            savedToDb = true;
        } catch (dbErr) {
            console.warn('MongoDB save failed, persisting to file:', dbErr.message);
        }
    }

    // 2. Sync local content.json on disk as backup
    fs.writeFile(CONTENT_PATH, JSON.stringify(merged, null, 2), 'utf8', (writeErr) => {
        if (writeErr && !savedToDb) {
            return res.status(500).json({ success: false, error: 'Failed to persist content updates.' });
        }
        return res.json({
            success: true,
            message: savedToDb ? 'Content updated & synced to Cloud Database!' : 'Content updated locally on disk.',
            dbSynced: savedToDb,
            data: merged
        });
    });
});

module.exports = router;
