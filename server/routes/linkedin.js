const express = require('express');
const router = express.Router();
const linkedinAPI = require('../utils/linkedin');

// POST /linkedin/post - Post content to LinkedIn
router.post('/post', async (req, res) => {
    const { text, accessToken } = req.body;

    if (!text || !accessToken) {
        return res.status(400).json({ error: 'text and accessToken required' });
    }

    try {
        // Get LinkedIn user ID
        const authorId = await linkedinAPI.getUserId(accessToken);

        // Create post
        const result = await linkedinAPI.createPost(accessToken, text, authorId);

        res.json({ ok: true, result });
    } catch (err) {
        console.error('LinkedIn post error:', err);
        res.status(500).json({ error: err.message || 'Failed to post to LinkedIn' });
    }
});

module.exports = router;
