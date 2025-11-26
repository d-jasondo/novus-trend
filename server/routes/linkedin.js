const express = require('express');
const router = express.Router();
const linkedinAPI = require('../utils/linkedin');

// POST /linkedin/post - Post content to LinkedIn
router.post('/post', async (req, res) => {
    const { text, accessToken, media } = req.body;

    if (!text || !accessToken) {
        return res.status(400).json({ error: 'text and accessToken required' });
    }

    try {
        // Get LinkedIn user ID
        const authorId = await linkedinAPI.getUserId(accessToken);

        let mediaUrn = null;

        // Handle media upload (currently supports single image)
        if (media && media.length > 0) {
            try {
                const mediaItem = media[0]; // Take first image

                // Remove data URL prefix and convert base64 to buffer
                // Use generic regex to support various image types
                const base64Data = mediaItem.data.replace(/^data:.*?;base64,/, '');
                const buffer = Buffer.from(base64Data, 'base64');

                // 1. Register upload
                const { uploadUrl, asset } = await linkedinAPI.registerUpload(accessToken, authorId);

                // 2. Upload file
                await linkedinAPI.uploadFile(uploadUrl, buffer, accessToken);

                mediaUrn = asset;
                console.log('LinkedIn media uploaded:', mediaUrn);
            } catch (mediaErr) {
                console.error('LinkedIn media upload failed:', mediaErr);
                // Continue without media if upload fails
            }
        }

        // Create post
        const result = await linkedinAPI.createPost(accessToken, text, authorId, mediaUrn);

        res.json({ ok: true, result });
    } catch (err) {
        console.error('LinkedIn post error:', err);
        res.status(500).json({ error: err.message || 'Failed to post to LinkedIn' });
    }
});

module.exports = router;
