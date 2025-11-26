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
    /**
     * Post content to LinkedIn
     * @param {string} accessToken - LinkedIn OAuth token
     * @param {string} text - Post content (max 3000 chars)
     * @param {string} authorId - LinkedIn user URN (format: urn:li:person:ABC123)
     * @param {string} [mediaUrn] - Optional URN of uploaded media
     * @param {string} [mediaTitle] - Optional title for the media
     * @returns {Promise<object>} Response from LinkedIn API
     */
    async createPost(accessToken, text, authorId, mediaUrn = null, mediaTitle = 'Shared Image') {
        try {
            const shareContent = {
                shareCommentary: {
                    text: text
                },
                shareMediaCategory: mediaUrn ? 'IMAGE' : 'NONE'
            };

            if (mediaUrn) {
                shareContent.media = [
                    {
                        status: 'READY',
                        description: {
                            text: mediaTitle
                        },
                        media: mediaUrn,
                        title: {
                            text: mediaTitle
                        }
                    }
                ];
            }

            const postData = {
                author: authorId,
                lifecycleState: 'PUBLISHED',
                specificContent: {
                    'com.linkedin.ugc.ShareContent': shareContent
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
     * Register an image upload with LinkedIn
     * @param {string} accessToken 
     * @param {string} authorId 
     * @returns {Promise<object>} { uploadUrl, asset }
     */
    async registerUpload(accessToken, authorId) {
        try {
            const response = await axios.post(
                'https://api.linkedin.com/v2/assets?action=registerUpload',
                {
                    registerUploadRequest: {
                        recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
                        owner: authorId,
                        serviceRelationships: [
                            {
                                relationshipType: 'OWNER',
                                identifier: 'urn:li:userGeneratedContent'
                            }
                        ]
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'X-Restli-Protocol-Version': '2.0.0'
                    }
                }
            );

            const uploadUrl = response.data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
            const asset = response.data.value.asset;

            return { uploadUrl, asset };
        } catch (err) {
            console.error('LinkedIn register upload error:', err.response?.data || err.message);
            throw new Error('Failed to register upload with LinkedIn');
        }
    }

    /**
     * Upload file to LinkedIn
     * @param {string} uploadUrl 
     * @param {Buffer} fileBuffer 
     * @param {string} accessToken 
     */
    async uploadFile(uploadUrl, fileBuffer, accessToken) {
        try {
            await axios.put(uploadUrl, fileBuffer, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/octet-stream'
                }
            });
            return true;
        } catch (err) {
            console.error('LinkedIn upload file error:', err.response?.data || err.message);
            throw new Error('Failed to upload file to LinkedIn');
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
