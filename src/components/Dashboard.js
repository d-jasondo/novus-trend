import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';
import Navbar from './Navbar';
import TrendingPanel from './TrendingPanel';
import ComposerPanel from './ComposerPanel';
import ChatbotPanel from './ChatbotPanel';

const API_BASE = 'http://localhost:4000';

function Dashboard({ onTweetPosted, onTweetScheduled, chatMessages, onChatUpdate }) {
  const [trends, setTrends] = useState([]);
  const [selectedTrend, setSelectedTrend] = useState(null);
  const [region, setRegion] = useState('Global');

  useEffect(() => {
    fetchTrends();

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

        onTweetPosted(newTweet);
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

        onTweetScheduled(newTweet);
        alert('Tweet scheduled!');
      } catch (err) {
        console.error('Schedule failed', err);
        alert(`Failed to schedule tweet: ${err.response?.data?.error || err.message}`);
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

            {/* Right Panel - Chatbot */}
            <div className="panel panel-right">
              <ChatbotPanel
                messages={chatMessages}
                onMessagesUpdate={onChatUpdate}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  export default Dashboard;
