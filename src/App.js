import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import './AppLayout.css';
import Dashboard from './components/Dashboard';
import OAuthCallback from './components/OAuthCallback';
import Sidebar from './components/Sidebar';
import AnalyticsPanel from './components/AnalyticsPanel';
import Settings from './components/Settings';
import ActivityPage from './components/ActivityPage';

const API_BASE = 'http://localhost:4000';

function App() {
  const [isCallback, setIsCallback] = useState(false);
  const [currentView, setCurrentView] = useState('home');
  const [postedTweets, setPostedTweets] = useState([]);
  const [scheduledTweets, setScheduledTweets] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);

  useEffect(() => {
    // Check if we're on the OAuth callback route
    const path = window.location.pathname;
    if (path === '/auth/callback' || window.location.search.includes('code=')) {
      setIsCallback(true);
    }

    // Load posted tweets from localStorage
    const savedTweets = localStorage.getItem('postedTweets');
    if (savedTweets) {
      setPostedTweets(JSON.parse(savedTweets));
    }

    // Load chat history
    const savedChat = localStorage.getItem('chatHistory');
    if (savedChat) {
      setChatMessages(JSON.parse(savedChat));
    } else {
      setChatMessages([
        { id: 1, text: "Hi there! 👋 I'm your AI assistant. How can I help you with your social media today?", sender: 'bot' }
      ]);
    }

    fetchScheduled();
  }, []);

  const fetchScheduled = async () => {
    try {
      const res = await axios.get(`${API_BASE}/tweets/scheduled`);
      const mapped = res.data.map(t => ({
        ...t,
        content: t.text,
        scheduledTime: t.when,
        status: 'scheduled',
        hashtags: []
      }));
      setScheduledTweets(mapped);
    } catch (err) {
      console.error('Failed to fetch scheduled tweets', err);
    }
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  const handleTweetPosted = (newTweet) => {
    const updatedTweets = [newTweet, ...postedTweets];
    setPostedTweets(updatedTweets);
    localStorage.setItem('postedTweets', JSON.stringify(updatedTweets));
  };

  const handleTweetScheduled = (newTweet) => {
    setScheduledTweets([newTweet, ...scheduledTweets]);
  };

  const handleChatUpdate = (newMessages) => {
    setChatMessages(newMessages);
    localStorage.setItem('chatHistory', JSON.stringify(newMessages));
  };

  const handleDeleteTweet = (id, type) => {
    if (type === 'scheduled') {
      setScheduledTweets(scheduledTweets.filter(tweet => tweet.id !== id));
    } else {
      const updated = postedTweets.filter(tweet => tweet.id !== id);
      setPostedTweets(updated);
      localStorage.setItem('postedTweets', JSON.stringify(updated));
    }
  };

  const renderContent = () => {
    if (isCallback) return <OAuthCallback />;

    switch (currentView) {
      case 'activity':
        return (
          <ActivityPage
            postedTweets={postedTweets}
            scheduledTweets={scheduledTweets}
            onDeleteTweet={handleDeleteTweet}
          />
        );
      case 'analytics':
        return <AnalyticsPanel postedTweets={postedTweets} />;
      case 'settings':
        return <Settings />;
      case 'home':
      default:
        return (
          <Dashboard
            onTweetPosted={handleTweetPosted}
            onTweetScheduled={handleTweetScheduled}
            chatMessages={chatMessages}
            onChatUpdate={handleChatUpdate}
          />
        );
    }
  };

  return (
    <div className="App">
      <Sidebar currentView={currentView} onViewChange={handleViewChange} />
      <div className="main-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default App;
