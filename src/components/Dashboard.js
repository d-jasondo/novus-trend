import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';
import Navbar from './Navbar';
import TrendingPanel from './TrendingPanel';
import ComposerPanel from './ComposerPanel';
import PostedPanel from './PostedPanel';

const API_BASE = 'http://localhost:4000';

function Dashboard() {
  const [trends, setTrends] = useState([]);
  const [selectedTrend, setSelectedTrend] = useState(null);
  const [postedTweets, setPostedTweets] = useState([]);
  const [scheduledTweets, setScheduledTweets] = useState([]);
  const [activeTab, setActiveTab] = useState('posted');
  const [region, setRegion] = useState('Global');

  useEffect(() => {
    fetchTrends();
    fetchScheduled();

    // Auto-refresh trends every 30 seconds
    const trendsInterval = setInterval(() => {
      fetchTrends();
    }, 30000); // 30 seconds

    // Cleanup interval on unmount
    return () => {
      clearInterval(trendsInterval);
    };
  }, [region]);

  const fetchTrends = async () => {
    try {
      // In a real app, map region to WOEID. For now default to 1 (Global)
      const res = await axios.get(`${API_BASE}/tweets/trends?woeid=1`);
      setTrends(res.data);
    } catch (err) {
      console.error('Failed to fetch trends', err);
    }
  };

  const fetchScheduled = async () => {
    try {
      const res = await axios.get(`${API_BASE}/tweets/scheduled`);
      // Transform to match UI model if needed, or just use as is
      // The UI expects { id, content, hashtags, scheduledTime, status }
      const mapped = res.data.map(t => ({
        ...t,
        content: t.text, // backend uses 'text', frontend uses 'content'
        scheduledTime: t.when,
        status: 'scheduled',
        hashtags: [] // backend doesn't store hashtags separately in this simple demo
      }));
      setScheduledTweets(mapped);
    } catch (err) {
      console.error('Failed to fetch scheduled tweets', err);
    }
  };

  const handleTrendSelect = (trend) => {
    setSelectedTrend(trend);
  };

  const handleTweetPost = async (tweet) => {
    try {
      const platform = tweet.platform || 'twitter';
      let accessToken;

      if (platform === 'linkedin') {
        const tokensData = localStorage.getItem('linkedinTokens');
        if (!tokensData) {
          alert('Please sign in with LinkedIn first!');
          return;
        }
        accessToken = JSON.parse(tokensData).accessToken;
      } else {
        const tokensData = localStorage.getItem('twitterTokens');
        if (!tokensData) {
          alert('Please sign in with Twitter first!');
          return;
        }
        accessToken = JSON.parse(tokensData).accessToken;
      }

      // Convert media files to base64 if present
      let mediaData = [];
      if (tweet.media && tweet.media.length > 0) {
        for (const file of tweet.media) {
          const base64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
          });
          mediaData.push({
            data: base64,
            mimeType: file.type
          });
        }
      }

      // Post to backend based on platform
      const endpoint = platform === 'linkedin' ? `${API_BASE}/linkedin/post` : `${API_BASE}/tweets/post`;

      const res = await axios.post(endpoint, {
        text: tweet.content,
        accessToken,
        media: mediaData
      });

      const newTweet = {
        id: Date.now(),
        content: tweet.content,
        hashtags: tweet.hashtags,
        timestamp: new Date(),
        platform: platform, // Store platform
        engagements: {
          likes: 0,
          retweets: 0,
          replies: 0,
        },
        status: 'posted',
      };
      setPostedTweets([newTweet, ...postedTweets]);
      alert(`${platform === 'linkedin' ? 'LinkedIn post' : 'Tweet'} posted successfully!`);

    } catch (err) {
      console.error('Post failed', err);
      alert(`Failed to post: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleTweetSchedule = async (tweet, scheduleTime) => {
    try {
      // Get real access token from localStorage
      const tokensData = localStorage.getItem('twitterTokens');
      if (!tokensData) {
        alert('Please sign in with Twitter first!');
        return;
      }
      const { accessToken } = JSON.parse(tokensData);

      // Call backend to schedule
      await axios.post(`${API_BASE}/tweets/schedule`, {
        text: tweet.content,
        accessToken,
        when: scheduleTime.toISOString()
      });

      const newTweet = {
        id: Date.now(),
        content: tweet.content,
        hashtags: tweet.hashtags,
        scheduledTime: scheduleTime,
        status: 'scheduled',
      };
      setScheduledTweets([newTweet, ...scheduledTweets]);
      alert('Tweet scheduled!');
    } catch (err) {
      console.error('Schedule failed', err);
      alert(`Failed to schedule tweet: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleDeleteTweet = (id, type) => {
    if (type === 'scheduled') {
      setScheduledTweets(scheduledTweets.filter(tweet => tweet.id !== id));
    } else {
      setPostedTweets(postedTweets.filter(tweet => tweet.id !== id));
    }
  };

  return (
    <div className="dashboard-container">
      <Navbar region={region} setRegion={setRegion} />
      <div className="dashboard-content">
        <div className="dashboard-panels">
          {/* Left Panel - Trending Hashtags */}
          <div className="panel panel-left">
            <TrendingPanel
              trends={trends}
              onTrendSelect={handleTrendSelect}
              selectedTrend={selectedTrend}
              region={region}
            />
          </div>

          {/* Center Panel - Tweet Composer */}
          <div className="panel panel-center">
            <ComposerPanel
              selectedTrend={selectedTrend}
              onTweetPost={handleTweetPost}
              onTweetSchedule={handleTweetSchedule}
            />
          </div>

          {/* Right Panel - Posted & Scheduled */}
          <div className="panel panel-right">
            <PostedPanel
              postedTweets={postedTweets}
              scheduledTweets={scheduledTweets}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onDeleteTweet={handleDeleteTweet}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
