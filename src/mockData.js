// Mock Data & API Reference
// This file documents the data structures and mock data used in the dashboard

// ============================================================================
// SAMPLE TRENDS DATA
// ============================================================================

export const mockTrends = [
  {
    id: 1,
    hashtag: '#AIRevolution',
    volume: 145200,
    trending: 'up',
    region: 'Global',
    description: 'Discussion about AI advancement and its impact'
  },
  {
    id: 2,
    hashtag: '#ReactJS',
    volume: 89500,
    trending: 'up',
    region: 'Global',
    description: 'React library updates and web development'
  },
  {
    id: 3,
    hashtag: '#WebDevelopment',
    volume: 76300,
    trending: 'down',
    region: 'Global',
    description: 'General web development discussions'
  },
  {
    id: 4,
    hashtag: '#TechNews',
    volume: 102400,
    trending: 'up',
    region: 'Global',
    description: 'Latest technology news and updates'
  },
  {
    id: 5,
    hashtag: '#StartupLife',
    volume: 54200,
    trending: 'stable',
    region: 'Global',
    description: 'Startup culture and entrepreneurship'
  },
  {
    id: 6,
    hashtag: '#CloudComputing',
    volume: 98700,
    trending: 'up',
    region: 'Global',
    description: 'Cloud technology and infrastructure'
  }
];

// ============================================================================
// TREND OBJECT STRUCTURE
// ============================================================================

/**
 * @typedef {Object} Trend
 * @property {number} id - Unique identifier
 * @property {string} hashtag - Hashtag text (e.g., '#AIRevolution')
 * @property {number} volume - Number of posts/mentions
 * @property {('up'|'down'|'stable')} trending - Trend direction
 * @property {string} region - Geographic region
 * @property {string} [description] - Optional trend description
 */

// ============================================================================
// TWEET OBJECT STRUCTURE
// ============================================================================

/**
 * @typedef {Object} Tweet
 * @property {number} id - Unique identifier (usually timestamp)
 * @property {string} content - Tweet text content (max 280 chars)
 * @property {Array<string>} hashtags - Array of hashtags used
 * @property {Date} timestamp - When tweet was posted (posted tweets)
 * @property {Date} [scheduledTime] - When tweet will be posted (scheduled tweets)
 * @property {('posted'|'scheduled')} status - Current status
 * @property {Object} engagements - Engagement metrics (posted tweets only)
 * @property {number} engagements.likes - Number of likes
 * @property {number} engagements.retweets - Number of retweets
 * @property {number} engagements.replies - Number of replies
 */

export const examplePostedTweet = {
  id: 1700000000000,
  content: 'Just discovered something amazing about #AIRevolution! The future of technology is here. 🚀 #Innovation #Future',
  hashtags: ['#AIRevolution', '#Innovation', '#Future'],
  timestamp: new Date(),
  status: 'posted',
  engagements: {
    likes: 234,
    retweets: 89,
    replies: 12
  }
};

export const exampleScheduledTweet = {
  id: 1700000000001,
  content: 'Excited to announce new updates coming to our platform! Stay tuned for more details. #TechNews #Updates',
  hashtags: ['#TechNews', '#Updates'],
  scheduledTime: new Date(Date.now() + 86400000), // Tomorrow
  status: 'scheduled'
};

// ============================================================================
// AI SUGGESTION DATA
// ============================================================================

/**
 * Simulated AI-generated suggestions for hashtags and content
 * In production, this would come from an AI API
 */

export const mockHashtagSuggestions = [
  '#Innovation',
  '#Future',
  '#Technology',
  '#Growth',
  '#Success',
  '#Trending',
  '#Digital',
  '#Smart'
];

export const mockCaptionSuggestions = [
  {
    hashtag: '#AIRevolution',
    suggestions: [
      'Breaking: AI is transforming industries faster than ever! 🚀 #Future #Innovation',
      'The AI revolution is here, and it\'s incredible! Join the discussion. #TechNews',
      'Why everyone\'s talking about this AI breakthrough... 🤖 #Innovation',
      'This AI advancement could change everything. Here\'s what you need to know. #Future'
    ]
  },
  {
    hashtag: '#ReactJS',
    suggestions: [
      'Just built something amazing with React! #WebDevelopment #Coding',
      'React is making frontend development easier than ever. #JavaScript #ReactJS',
      'New React features are absolutely game-changing! 🔥 #Development',
      'Building scalable web apps with React has never been better. #DevLife'
    ]
  }
];

// ============================================================================
// REGION DATA
// ============================================================================

export const regions = [
  { code: 'GLOBAL', name: 'Global' },
  { code: 'US', name: 'United States' },
  { code: 'IN', name: 'India' },
  { code: 'UK', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' }
];

// ============================================================================
// USER OBJECT STRUCTURE
// ============================================================================

/**
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} name - Display name
 * @property {string} handle - Twitter handle
 * @property {string} email - Email address
 * @property {string} avatar - Avatar URL
 * @property {string} bio - User bio
 * @property {number} followers - Follower count
 */

export const currentUser = {
  id: 'user_123',
  name: 'John Doe',
  handle: 'johndoe',
  email: 'john@example.com',
  avatar: 'https://via.placeholder.com/48',
  bio: 'Tech enthusiast and content creator',
  followers: 5420
};

// ============================================================================
// ENGAGEMENT METRICS SIMULATION
// ============================================================================

/**
 * Simulates real-time engagement metrics
 * In production, this would poll Twitter API
 */

export const simulateEngagementMetrics = (tweetId) => {
  return {
    likes: Math.floor(Math.random() * 1000),
    retweets: Math.floor(Math.random() * 500),
    replies: Math.floor(Math.random() * 100),
    views: Math.floor(Math.random() * 5000),
    bookmarks: Math.floor(Math.random() * 200)
  };
};

// ============================================================================
// API RESPONSE FORMATS (for real integration)
// ============================================================================

/**
 * Expected format when fetching trends from API
 * 
 * GET /api/trends?region=GLOBAL
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": 1,
 *       "hashtag": "#AIRevolution",
 *       "volume": 145200,
 *       "trending": "up",
 *       "region": "GLOBAL"
 *     },
 *     ...
 *   ],
 *   "timestamp": "2024-11-23T10:00:00Z"
 * }
 */

/**
 * Expected format when posting a tweet
 * 
 * POST /api/tweets
 * Body: {
 *   "content": "Tweet text",
 *   "hashtags": ["#tag1", "#tag2"],
 *   "scheduledTime": null // null for immediate post
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": 1700000000000,
 *     "content": "Tweet text",
 *     "hashtags": ["#tag1", "#tag2"],
 *     "timestamp": "2024-11-23T10:05:00Z",
 *     "status": "posted"
 *   }
 * }
 */

/**
 * Expected format when fetching AI suggestions
 * 
 * POST /api/ai/suggestions
 * Body: {
 *   "hashtag": "#AIRevolution",
 *   "context": "description"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "hashtags": ["#Innovation", "#Future", "#Technology"],
 *     "captions": [
 *       "Breaking: AI is...",
 *       "The AI revolution..."
 *     ]
 *   }
 * }
 */

// ============================================================================
// MOCK API IMPLEMENTATION
// ============================================================================

export class MockAPI {
  /**
   * Simulate fetching trends
   */
  static fetchTrends(region = 'GLOBAL') {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: mockTrends,
          timestamp: new Date().toISOString()
        });
      }, 500);
    });
  }

  /**
   * Simulate posting a tweet
   */
  static postTweet(content, hashtags, scheduledTime = null) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            id: Date.now(),
            content,
            hashtags,
            timestamp: new Date().toISOString(),
            status: scheduledTime ? 'scheduled' : 'posted',
            ...(scheduledTime && { scheduledTime })
          }
        });
      }, 1000);
    });
  }

  /**
   * Simulate AI suggestion generation
   */
  static generateAISuggestions(hashtag) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            hashtags: mockHashtagSuggestions,
            captions: mockCaptionSuggestions.find(c => c.hashtag === hashtag)?.suggestions || []
          }
        });
      }, 1500);
    });
  }

  /**
   * Simulate deleting a tweet
   */
  static deleteTweet(tweetId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Tweet deleted successfully'
        });
      }, 500);
    });
  }

  /**
   * Simulate fetching engagement metrics
   */
  static fetchEngagementMetrics(tweetId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: simulateEngagementMetrics(tweetId)
        });
      }, 300);
    });
  }
}

// ============================================================================
// INTEGRATION EXAMPLES
// ============================================================================

/**
 * Example: Using MockAPI in React component
 * 
 * useEffect(() => {
 *   MockAPI.fetchTrends('GLOBAL').then(response => {
 *     if (response.success) {
 *       setTrends(response.data);
 *     }
 *   });
 * }, []);
 */

/**
 * Example: Posting a tweet
 * 
 * const handlePostTweet = (content, hashtags) => {
 *   MockAPI.postTweet(content, hashtags).then(response => {
 *     if (response.success) {
 *       setPostedTweets([response.data, ...postedTweets]);
 *     }
 *   });
 * };
 */

/**
 * Example: Generating AI suggestions
 * 
 * const handleAISuggest = () => {
 *   setIsLoadingAI(true);
 *   MockAPI.generateAISuggestions(selectedTrend.hashtag).then(response => {
 *     if (response.success) {
 *       setSuggestedHashtags(response.data.hashtags);
 *     }
 *     setIsLoadingAI(false);
 *   });
 * };
 */

// ============================================================================
// CHARACTER LIMITS
// ============================================================================

export const LIMITS = {
  TWEET_MAX_CHARS: 280,
  HASHTAG_MAX_LENGTH: 139,
  TRENDING_DISPLAY_COUNT: 6,
  SUGGESTION_COUNT: 5,
  RECENT_TWEETS_DISPLAY: 10
};

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const ERRORS = {
  TWEET_EMPTY: 'Tweet cannot be empty',
  TWEET_TOO_LONG: 'Tweet exceeds 280 characters',
  NO_REGION_SELECTED: 'Please select a region',
  INVALID_DATE: 'Please select a valid date',
  API_ERROR: 'Something went wrong. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.'
};

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================

export const SUCCESS = {
  TWEET_POSTED: 'Tweet posted successfully! 🎉',
  TWEET_SCHEDULED: 'Tweet scheduled successfully! ⏰',
  TWEET_DELETED: 'Tweet deleted successfully',
  SUGGESTIONS_GENERATED: 'AI suggestions generated!'
};

// ============================================================================
// CONSTANTS
// ============================================================================

export const ANIMATION_DURATION = {
  QUICK: 200,    // ms - quick feedback animations
  NORMAL: 300,   // ms - standard transitions
  SLOW: 500,     // ms - emphasis animations
  VERY_SLOW: 1000 // ms - loading animations
};

export const POLLING_INTERVAL = {
  ENGAGEMENT: 5000,   // 5 seconds - refresh engagement metrics
  TRENDS: 30000,      // 30 seconds - refresh trends
  TWEETS: 10000       // 10 seconds - refresh tweets
};
