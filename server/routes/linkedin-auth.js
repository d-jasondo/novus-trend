const express = require('express');
const router = express.Router();
const axios = require('axios');
const { saveAccount } = require('../models/accounts');

// LinkedIn OAuth 2.0 Configuration
const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const LINKEDIN_CALLBACK_URL = process.env.LINKEDIN_CALLBACK_URL || 'http://localhost:3000/auth/linkedin/callback';

// Initiate LinkedIn OAuth flow
router.get('/login', (req, res) => {
    if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET) {
        return res.status(500).json({ error: 'LinkedIn credentials not configured' });
    }

    const state = Math.random().toString(36).substring(7);
    const scope = 'openid profile w_member_social'; // Required scopes for posting

    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
        `response_type=code&` +
        `client_id=${LINKEDIN_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(LINKEDIN_CALLBACK_URL)}&` +
        `state=${state}&` +
        `scope=${encodeURIComponent(scope)}`;

    console.log('LinkedIn Auth URL:', authUrl);
    console.log('Using Redirect URI:', LINKEDIN_CALLBACK_URL);

    res.redirect(authUrl);
});

// Handle LinkedIn OAuth callback (GET - LinkedIn redirects here)
router.get('/callback', async (req, res) => {
    const { code, state, error, error_description } = req.query;

    if (error) {
        console.error('LinkedIn OAuth error:', error, error_description);
        return res.send(`
            <html>
                <head><title>LinkedIn Auth Error</title></head>
                <body>
                    <h2>LinkedIn Authorization Failed</h2>
                    <p>${error}: ${error_description || 'Unknown error'}</p>
                    <script>
                        setTimeout(() => {
                            window.close();
                            window.location.href = 'http://localhost:3000';
                        }, 3000);
                    </script>
                </body>
            </html>
        `);
    }

    if (!code) {
        return res.status(400).send('Authorization code required');
    }

    try {
        // Exchange code for access token
        const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
            params: {
                grant_type: 'authorization_code',
                code: code,
                client_id: LINKEDIN_CLIENT_ID,
                client_secret: LINKEDIN_CLIENT_SECRET,
                redirect_uri: LINKEDIN_CALLBACK_URL
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const { access_token, expires_in } = tokenResponse.data;

        // Get user profile
        const profileResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });

        const profile = profileResponse.data;
        const userId = profile.sub; // LinkedIn user ID
        const userName = profile.name || 'LinkedIn User';

        // Save to account manager
        saveAccount(userId, 'linkedin', {
            accessToken: access_token,
            expiresIn: expires_in,
            username: userName,
            email: profile.email
        });

        // Send success page that stores tokens and redirects
        res.send(`
            <html>
                <head><title>LinkedIn Connected</title></head>
                <body>
                    <h2>✅ LinkedIn Connected Successfully!</h2>
                    <p>Redirecting...</p>
                    <script>
                        // Store tokens in localStorage
                        const tokens = {
                            accessToken: '${access_token}',
                            expiresIn: ${expires_in},
                            name: '${userName}',
                            email: '${profile.email || ''}'
                        };
                        localStorage.setItem('linkedinTokens', JSON.stringify(tokens));
                        
                        // Redirect to main app
                        setTimeout(() => {
                            window.location.href = 'http://localhost:3000';
                        }, 1000);
                    </script>
                </body>
            </html>
        `);

    } catch (err) {
        console.error('LinkedIn OAuth error:', err.response?.data || err.message);
        res.send(`
            <html>
                <head><title>LinkedIn Auth Error</title></head>
                <body>
                    <h2>LinkedIn Authorization Failed</h2>
                    <p>Error: ${err.message}</p>
                    <script>
                        setTimeout(() => {
                            window.location.href = 'http://localhost:3000';
                        }, 3000);
                    </script>
                </body>
            </html>
        `);
    }
});

// Handle LinkedIn OAuth callback (POST - for API-based callbacks)
router.post('/callback', async (req, res) => {
    const { code, state } = req.body;

    if (!code) {
        return res.status(400).json({ error: 'Authorization code required' });
    }

    try {
        // Exchange code for access token
        const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
            params: {
                grant_type: 'authorization_code',
                code: code,
                client_id: LINKEDIN_CLIENT_ID,
                client_secret: LINKEDIN_CLIENT_SECRET,
                redirect_uri: LINKEDIN_CALLBACK_URL
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const { access_token, expires_in } = tokenResponse.data;

        // Get user profile
        const profileResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });

        const profile = profileResponse.data;
        const userId = profile.sub; // LinkedIn user ID
        const userName = profile.name || 'LinkedIn User';

        // Save to account manager
        saveAccount(userId, 'linkedin', {
            accessToken: access_token,
            expiresIn: expires_in,
            username: userName,
            email: profile.email
        });

        res.json({
            ok: true,
            userId,
            userName,
            accessToken: access_token,
            expiresIn: expires_in,
            platform: 'linkedin'
        });

    } catch (err) {
        console.error('LinkedIn OAuth error:', err.response?.data || err.message);
        res.status(500).json({ error: 'LinkedIn authentication failed' });
    }
});

module.exports = router;
