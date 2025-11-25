const express = require('express');
const router = express.Router();
const { TwitterApi } = require('twitter-api-v2');
const fs = require('fs');
const path = require('path');

// Simple in-memory store for code verifiers and user tokens (dev only)
const verifierStore = new Map();
const tokenStore = new Map();

const CALLBACK = process.env.TWITTER_CALLBACK_URL || 'http://localhost:3000/auth/callback';
const DEBUG_LOG = path.join(__dirname, '..', 'debug.log');

function logDebug(msg, data = null) {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] ${msg} ${data ? JSON.stringify(data) : ''}\n`;
  try { fs.appendFileSync(DEBUG_LOG, logLine); } catch (e) { }
  console.log(msg, data || '');
}

router.get('/login', async (req, res) => {
  logDebug('Login request received');
  // quick env validation to give clearer message in dev
  if (!process.env.TWITTER_CLIENT_ID || !process.env.TWITTER_CLIENT_SECRET) {
    logDebug('Missing credentials');
    return res.status(500).json({ error: 'Missing TWITTER_CLIENT_ID or TWITTER_CLIENT_SECRET in server environment' });
  }

  try {
    logDebug('OAuth login initiated, callback URL:', CALLBACK);
    const client = new TwitterApi({
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
    });

    const { url, codeVerifier, state } = client.generateOAuth2AuthLink(CALLBACK, {
      scope: ['tweet.read', 'tweet.write', 'users.read', 'offline.access', 'tweet.moderate.write'],
    });

    // store codeVerifier by state with extended TTL
    verifierStore.set(state, codeVerifier);
    logDebug('Stored verifier for state:', state);

    logDebug('Redirecting to Twitter OAuth URL', url);
    // Append force_login=true to always show account selection
    res.redirect(url + '&force_login=true');
  } catch (err) {
    logDebug('Login error', err.message);
    const msg = process.env.NODE_ENV === 'production' ? 'OAuth login failed' : `OAuth login failed: ${err?.message || err}`;
    res.status(500).json({ error: msg });
  }
});

// Handle POST callback from frontend (after Twitter redirects to frontend with code)
router.post('/callback', async (req, res) => {
  const { code, state } = req.body;
  logDebug('Callback POST received', { code, state });

  const storedVerifier = verifierStore.get(state);
  if (!storedVerifier) {
    logDebug('Verifier not found for state:', state);
    logDebug('Available states:', Array.from(verifierStore.keys()));
    return res.status(400).json({ error: 'Invalid or expired state' });
  }

  try {
    logDebug('Attempting OAuth token exchange...');
    const client = new TwitterApi({
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
    });

    const { client: loggedClient, accessToken, refreshToken, expiresIn } = await client.loginWithOAuth2({
      code,
      codeVerifier: storedVerifier,
      redirectUri: CALLBACK,
    });

    logDebug('Token exchange successful');
    const user = await loggedClient.v2.me();
    const userId = user.data && user.data.id ? user.data.id : `u_${Date.now()}`;
    const userName = user.data && user.data.name ? user.data.name : 'User';

    tokenStore.set(userId, { accessToken, refreshToken, expiresIn });
    logDebug('Stored tokens for user:', userId);

    // Clean up used verifier
    verifierStore.delete(state);

    res.json({ ok: true, userId, userName, accessToken, refreshToken, expiresIn });
  } catch (err) {
    logDebug('Callback POST error', err.message);
    if (err.data) logDebug('Error data', err.data);

    const msgUser = process.env.NODE_ENV === 'production' ? 'OAuth callback failed' : `OAuth callback failed: ${err?.message || err}`;
    res.status(500).json({ error: msgUser });
  }
});

module.exports = router;
