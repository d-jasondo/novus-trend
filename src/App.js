import React, { useEffect, useState } from 'react';
import './App.css';
import './AppLayout.css';
import Dashboard from './components/Dashboard';
import OAuthCallback from './components/OAuthCallback';
import Sidebar from './components/Sidebar';
import AnalyticsPanel from './components/AnalyticsPanel';
import Settings from './components/Settings';

function App() {
  const [isCallback, setIsCallback] = useState(false);
  const [currentView, setCurrentView] = useState('home');
  const [postedTweets, setPostedTweets] = useState([]);

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
  }, []);

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  const handleTweetPosted = (newTweet) => {
    const updatedTweets = [...postedTweets, newTweet];
    setPostedTweets(updatedTweets);
    localStorage.setItem('postedTweets', JSON.stringify(updatedTweets));
  };

  const renderContent = () => {
    if (isCallback) return <OAuthCallback />;

    switch (currentView) {
      case 'analytics':
        return <AnalyticsPanel postedTweets={postedTweets} />;
      case 'settings':
        return <Settings />;
      case 'home':
      default:
        return <Dashboard onTweetPosted={handleTweetPosted} />;
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
