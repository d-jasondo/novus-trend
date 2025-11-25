const axios = require('axios');

/**
 * LinkedIn API Integration
 * Handles posting content to LinkedIn using the UGC Posts API
 */

class LinkedInAPI {
    /**
     * Post content to LinkedIn
     * @param {string} accessToken - LinkedIn OAuth token
     * @param {string} text - Post content (max 3000 chars)
     * @param {string} authorId - LinkedIn user URN (format: urn:li:person:ABC123)
     * @returns {Promise<object>} Response from LinkedIn API
     */
    async createPost(accessToken, text, authorId) {
        try {
            const postData = {
                author: authorId,
                lifecycleState: 'PUBLISHED',
                specificContent: {
                    'com.linkedin.ugc.ShareContent': {
                        shareCommentary: {
                            text: text
                        },
                        shareMediaCategory: 'NONE'
                    }
                },
                visibility: {
                    'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
                }
            };

            const response = await axios.post(
                'https://api.linkedin.com/v2/ugcPosts',
                postData,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'X-Restli-Protocol-Version': '2.0.0'
                    }
                }
            );

            return { ok: true, data: response.data };
        } catch (err) {
            console.error('LinkedIn post error:', err.response?.data || err.message);
            throw new Error(err.response?.data?.message || 'Failed to post to LinkedIn');
        }
    }

    /**
     * Get LinkedIn user profile ID (URN)
     * @param {string} accessToken - LinkedIn OAuth token
     */
    async getUserId(accessToken) {
        try {
            const response = await axios.get('https://api.linkedin.com/v2/userinfo', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            // Convert userinfo sub to LinkedIn URN format
            const sub = response.data.sub;
            return `urn:li:person:${sub}`;
        } catch (err) {
            console.error('LinkedIn profile error:', err.response?.data || err.message);
            throw new Error('Failed to get LinkedIn user ID');
        }
    }
}

module.exports = new LinkedInAPI();
