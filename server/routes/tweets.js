const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { TwitterApi } = require('twitter-api-v2');
const axios = require('axios');
const cron = require('node-cron');
const { generateContent, generateCaptionFromImage } = require('../utils/gemini');

const SCHEDULE_FILE = path.join(__dirname, '..', 'data', 'scheduled.json');

function readSchedule() {
  try {
    return JSON.parse(fs.readFileSync(SCHEDULE_FILE, 'utf8')) || [];
  } catch (e) {
    return [];
  }
}

function writeSchedule(list) {
  fs.writeFileSync(SCHEDULE_FILE, JSON.stringify(list, null, 2));
}

// GET /tweets/trends?woeid=<id>
router.get('/trends', async (req, res) => {
  const woeid = req.query.woeid || 1; // Default to worldwide

  try {
    // Use RapidAPI for trending topics
    const rapidApiKey = process.env.RAPIDAPI_KEY;

    if (!rapidApiKey) {
      console.log('No RapidAPI key found, falling back to mock data');
      return res.json(getMockTrends(woeid));
    }

    const response = await axios.get(`https://twitter-trends-api.p.rapidapi.com/trends`, {
      params: { woeid: woeid },
      headers: {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': 'twitter-trends-api.p.rapidapi.com'
      }
    });

    // Check if API returned success
    if (!response.data || !response.data.status) {
      console.warn('Invalid response from Twitter Trends API');
      return res.json(getMockTrends(woeid));
    }

    // Transform RapidAPI response to our format
    const trends = response.data.trends || [];
    const formattedTrends = trends.slice(0, 10).map((t, index) => ({
      id: index + 1,
      hashtag: t.name.startsWith('#') ? t.name : '#' + t.name,
      volume: t.tweet_count || Math.floor(Math.random() * 100000) + 10000,
      trending: t.tweet_count && t.tweet_count > 100000 ? 'up' : 'stable',
      category: 'General',
      region: 'Global'
    }));

    res.json(formattedTrends.length > 0 ? formattedTrends : getMockTrends(woeid));
  } catch (err) {
    const LOG_FILE = path.join(__dirname, '..', 'error.log');
    const msg = `[RapidAPI Trends Error] ${new Date().toISOString()}: ${err.message}\n${JSON.stringify(err.response?.data || err, null, 2)}\n`;
    try {
      fs.appendFileSync(LOG_FILE, msg);
    } catch (e) { console.error("Failed to write to log", e); }

    console.error('RapidAPI trends error:', err.message);
    // Fallback to mock data on error
    res.json(getMockTrends(woeid));
  }
});

function getMockTrends(woeid) {
  const trendPool = [
    // Technology
    { hashtag: '#AIRevolution', baseVolume: 145000, category: 'Technology' },
    { hashtag: '#ReactJS', baseVolume: 89000, category: 'Technology' },
    { hashtag: '#WebDevelopment', baseVolume: 76000, category: 'Technology' },
    { hashtag: '#TechNews', baseVolume: 102000, category: 'Technology' },
    { hashtag: '#CloudComputing', baseVolume: 98000, category: 'Technology' },
    { hashtag: '#MachineLearning', baseVolume: 125000, category: 'Technology' },
    { hashtag: '#JavaScript', baseVolume: 95000, category: 'Technology' },
    { hashtag: '#Python', baseVolume: 110000, category: 'Technology' },
    { hashtag: '#DevOps', baseVolume: 67000, category: 'Technology' },
    { hashtag: '#CyberSecurity', baseVolume: 88000, category: 'Technology' },
    { hashtag: '#DataScience', baseVolume: 92000, category: 'Technology' },
    { hashtag: '#BlockChain', baseVolume: 71000, category: 'Technology' },
    { hashtag: '#IoT', baseVolume: 58000, category: 'Technology' },
    { hashtag: '#5G', baseVolume: 63000, category: 'Technology' },
    { hashtag: '#QuantumComputing', baseVolume: 45000, category: 'Technology' },
    { hashtag: '#AR_VR', baseVolume: 52000, category: 'Technology' },
    { hashtag: '#EdgeComputing', baseVolume: 41000, category: 'Technology' },
    { hashtag: '#OpenSource', baseVolume: 79000, category: 'Technology' },
    { hashtag: '#APIDesign', baseVolume: 38000, category: 'Technology' },

    // Politics
    { hashtag: '#Election2024', baseVolume: 235000, category: 'Politics' },
    { hashtag: '#Politics', baseVolume: 198000, category: 'Politics' },
    { hashtag: '#Democracy', baseVolume: 87000, category: 'Politics' },
    { hashtag: '#ClimatePolicy', baseVolume: 112000, category: 'Politics' },
    { hashtag: '#GlobalPolitics', baseVolume: 95000, category: 'Politics' },
    { hashtag: '#VotingRights', baseVolume: 76000, category: 'Politics' },

    // Entertainment
    { hashtag: '#MovieNight', baseVolume: 145000, category: 'Entertainment' },
    { hashtag: '#MusicMonday', baseVolume: 167000, category: 'Entertainment' },
    { hashtag: '#Streaming', baseVolume: 98000, category: 'Entertainment' },
    { hashtag: '#GameOfThrones', baseVolume: 203000, category: 'Entertainment' },
    { hashtag: '#Hollywood', baseVolume: 134000, category: 'Entertainment' },
    { hashtag: '#Gaming', baseVolume: 187000, category: 'Entertainment' },

    // Sports
    { hashtag: '#NFL', baseVolume: 298000, category: 'Sports' },
    { hashtag: '#NBA', baseVolume: 256000, category: 'Sports' },
    { hashtag: '#Soccer', baseVolume: 312000, category: 'Sports' },
    { hashtag: '#Cricket', baseVolume: 278000, category: 'Sports' },
    { hashtag: '#Olympics', baseVolume: 189000, category: 'Sports' },
    { hashtag: '#WorldCup', baseVolume: 334000, category: 'Sports' },

    // Business
    { hashtag: '#StartupLife', baseVolume: 54000, category: 'Business' },
    { hashtag: '#Entrepreneurship', baseVolume: 87000, category: 'Business' },
    { hashtag: '#StockMarket', baseVolume: 156000, category: 'Business' },
    { hashtag: '#BusinessNews', baseVolume: 112000, category: 'Business' },
    { hashtag: '#FinTech', baseVolume: 93000, category: 'Business' },
    { hashtag: '#Investing', baseVolume: 134000, category: 'Business' }
  ];

  // Shuffle and select 12-15 random trends (more trends for better category distribution)
  const shuffled = [...trendPool].sort(() => Math.random() - 0.5);
  const numTrends = 12 + Math.floor(Math.random() * 4); // 12-15 trends
  const selectedTrends = shuffled.slice(0, numTrends);

  // Generate dynamic data for each trend
  return selectedTrends.map((trend, index) => {
    const volumeVariation = Math.floor(Math.random() * 20000) - 10000; // +/- 10K variation
    const volume = trend.baseVolume + volumeVariation;
    const trendDirections = ['up', 'down', 'stable'];
    const randomDirection = trendDirections[Math.floor(Math.random() * trendDirections.length)];

    return {
      id: index + 1,
      hashtag: trend.hashtag,
      volume: Math.max(10000, volume), // Ensure minimum 10K
      trending: randomDirection,
      category: trend.category,
      region: 'Global'
    };
  });
}

// POST /tweets/post { text, accessToken, media }
router.post('/post', async (req, res) => {
  const { text, accessToken, media } = req.body;
  if (!text || !accessToken) return res.status(400).json({ error: 'text and accessToken required' });

  try {
    const client = new TwitterApi(accessToken);
    const rwClient = client.readWrite;

    // Upload media if provided
    let mediaIds = [];
    if (media && media.length > 0) {
      for (const mediaItem of media) {
        try {
          // Remove data URL prefix and convert base64 to buffer
          const base64Data = mediaItem.data.replace(/^data:image\/\w+;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');

          // Upload media using v1.1 API (required for media upload)
          const mediaId = await rwClient.v1.uploadMedia(buffer, { mimeType: mediaItem.mimeType });
          mediaIds.push(mediaId);
        } catch (mediaErr) {
          console.error('Media upload error:', mediaErr);
          // Log detailed error to file for debugging
          const LOG_FILE = path.join(__dirname, '..', 'media_error.log');
          const msg = `[Media Upload Error] ${new Date().toISOString()}: ${mediaErr.message}\n${JSON.stringify(mediaErr.data || mediaErr, null, 2)}\n`;
          try { fs.appendFileSync(LOG_FILE, msg); } catch (e) { }

          // Continue with other media even if one fails
        }
      }
    }

    console.log('Media IDs to attach:', mediaIds);

    // Post tweet with or without media
    const tweetOptions = { text };
    if (mediaIds.length > 0) {
      tweetOptions.media = { media_ids: mediaIds };
    }

    const resp = await rwClient.v2.tweet(tweetOptions);
    res.json({ ok: true, resp });
  } catch (err) {
    console.error('post error', err);
    res.status(500).json({ error: 'Failed to post' });
  }
});

// POST /tweets/schedule { text, accessToken, when }  (when: ISO datetime)
router.post('/schedule', async (req, res) => {
  const { text, accessToken, when } = req.body;
  if (!text || !accessToken || !when) return res.status(400).json({ error: 'text, accessToken, and when required' });

  const id = `s_${Date.now()}`;
  const list = readSchedule();
  list.push({ id, text, accessToken, when, posted: false });
  writeSchedule(list);

  // create a cron job that checks every minute (simple approach)
  scheduleChecker();

  res.json({ ok: true, id });
});

// Simple scheduler: check scheduled.json every minute and post due tweets
let schedulerRunning = false;
function scheduleChecker() {
  if (schedulerRunning) return;
  schedulerRunning = true;
  cron.schedule('* * * * *', async () => {
    const list = readSchedule();
    const now = new Date();
    let changed = false;
    for (const item of list) {
      if (!item.posted && new Date(item.when) <= now) {
        try {
          const client = new TwitterApi(item.accessToken);
          const rw = client.readWrite;
          await rw.v2.tweet(item.text);
          item.posted = true;
          item.postedAt = new Date().toISOString();
          changed = true;
          console.log('Posted scheduled tweet', item.id);
        } catch (err) {
          console.error('Error posting scheduled tweet', item.id, err.message || err);
        }
      }
    }
    if (changed) writeSchedule(list);
  });
}

// start checker on module load
scheduleChecker();

// simple list endpoint
router.get('/scheduled', (req, res) => res.json(readSchedule()));

// AI generate
router.post('/generate', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'prompt required' });

  try {
    // Enhanced prompt to make AI analyze the topic and generate diverse content
    const enhancedPrompt = `Analyze the trending topic "${prompt}" and determine what category it belongs to (technology, politics, entertainment, sports, business, science, culture, or general).

Based on the category and context of "${prompt}", write a creative and engaging Twitter post that:
1. Relates to the trending topic in a relevant way
2. Uses appropriate tone for that category (professional for tech/business, casual for entertainment, informative for politics/science)
3. Includes relevant hashtags
4. Stays under 280 characters
5. Is attention-grabbing and encourages engagement

Generate ONLY the tweet text, no explanations.`;

    const generatedText = await generateContent(enhancedPrompt);
    res.json({ ok: true, text: generatedText });
  } catch (err) {
    console.error("Gemini generation error:", err);
    res.status(500).json({ error: "Failed to generate content" });
  }
});

// POST /tweets/generate-caption - Generate caption from image
router.post('/generate-caption', async (req, res) => {
  const { imageData, mimeType } = req.body;

  if (!imageData) {
    return res.status(400).json({ error: 'Image data required' });
  }

  try {
    // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const detectedMimeType = mimeType || 'image/jpeg';

    const caption = await generateCaptionFromImage(base64Data, detectedMimeType);
    res.json({ ok: true, text: caption });
  } catch (err) {
    console.error("Caption generation error:", err);
    res.status(500).json({ error: "Failed to generate caption from image" });
  }
});

module.exports = router;
