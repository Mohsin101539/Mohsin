const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const requireAuth = require('../middleware/requireAuth');

const CONTENT_PATH = path.join(__dirname, '../../content.json');

// GET /api/content
router.get('/', (req, res) => {
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
router.put('/', requireAuth, (req, res) => {
    const updatedContent = req.body;

    if (!updatedContent || typeof updatedContent !== 'object') {
        return res.status(400).json({ success: false, error: 'Invalid content payload format.' });
    }

    // Basic top-level key sanity check
    const validKeys = [
        'hero', 'about', 'testimonials', 'education', 'projects',
        'designWork', 'experience', 'stats', 'coursePromo',
        'brands', 'whyChooseMe', 'services', 'certificates', 'contact'
    ];

    const payloadKeys = Object.keys(updatedContent);
    const hasUnknownKeys = payloadKeys.some(key => !validKeys.includes(key));

    if (hasUnknownKeys) {
        return res.status(400).json({ success: false, error: 'Payload contains unknown root fields.' });
    }

    // Read current content to merge or overwrite safely
    fs.readFile(CONTENT_PATH, 'utf8', (err, existingData) => {
        let current = {};
        if (!err && existingData) {
            try { current = JSON.parse(existingData); } catch (e) {}
        }

        const merged = { ...current, ...updatedContent };

        fs.writeFile(CONTENT_PATH, JSON.stringify(merged, null, 2), 'utf8', (writeErr) => {
            if (writeErr) {
                return res.status(500).json({ success: false, error: 'Failed to persist content updates.' });
            }
            return res.json({ success: true, message: 'Content updated successfully.', data: merged });
        });
    });
});

module.exports = router;
