const express = require('express');
const router = express.Router();
const axios = require('axios');

// LinkedIn API Configuration
const LINKEDIN_API_URL = 'https://api.linkedin.com/v2';

// Helper to get URN from user profile if not stored
async function getUserUrn(accessToken) {
    try {
        const response = await axios.get(`${LINKEDIN_API_URL}/userinfo`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        // The 'sub' field contains the ID, e.g., "12345"
        // We need to format it as a URN: "urn:li:person:12345"
        return `urn:li:person:${response.data.sub}`;
    } catch (error) {
        console.error('Error fetching user URN:', error.response?.data || error.message);
        throw new Error('Failed to retrieve user LinkedIn ID');
    }
}

// Create a post
router.post('/', async (req, res) => {
    const { text, media, accessToken } = req.body;

    if (!accessToken) {
        return res.status(401).json({ error: 'Access token required' });
    }

    if (!text && !media) {
        return res.status(400).json({ error: 'Post content (text or media) required' });
    }

    try {
        // 1. Get the User's URN (author)
        // In a real app, you might store this with the account to avoid an extra call
        const authorUrn = await getUserUrn(accessToken);
        console.log('Posting as author:', authorUrn);

        // 2. Construct the Post Body (UGC Post API)
        // Documentation: https://learn.microsoft.com/en-us/linkedin/marketing/integrations/community-management/shares/ugc-post-api

        const postBody = {
            author: authorUrn,
            lifecycleState: 'PUBLISHED',
            specificContent: {
                'com.linkedin.ugc.ShareContent': {
                    shareCommentary: {
                        text: text || ''
                    },
                    shareMediaCategory: 'NONE'
                }
            },
            visibility: {
                'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
            }
        };

        // TODO: Handle Media Uploads (Images/Videos)
        // For now, we'll stick to text-only to get the basic flow working.
        // If media is present, we would need to:
        // 1. Register upload
        // 2. Upload binary
        // 3. Update shareMediaCategory and media array in postBody

        console.log('Sending post to LinkedIn:', JSON.stringify(postBody, null, 2));

        const response = await axios.post(`${LINKEDIN_API_URL}/ugcPosts`, postBody, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0'
            }
        });

        console.log('LinkedIn Post Success:', response.data);

        res.json({
            ok: true,
            postId: response.data.id,
            platform: 'linkedin'
        });

    } catch (error) {
        console.error('LinkedIn Posting Error:', error.response?.data || error.message);
        res.status(500).json({
            error: 'Failed to post to LinkedIn',
            details: error.response?.data || error.message
        });
    }
});

module.exports = router;
