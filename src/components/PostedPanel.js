import React, { useState } from 'react';
import { FaHeart, FaRetweet, FaReply, FaShare, FaTrash, FaClock } from 'react-icons/fa';
import './PostedPanel.css';

function PostedPanel({ postedTweets, scheduledTweets, activeTab, setActiveTab, onDeleteTweet }) {
  const [expandedTweet, setExpandedTweet] = useState(null);

  const formatDate = (date) => {
    if (typeof date === 'string') date = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const renderTweetCard = (tweet, type) => (
    <div
      key={tweet.id}
      className={`tweet-card card ${expandedTweet === tweet.id ? 'expanded' : ''}`}
      onClick={() => setExpandedTweet(expandedTweet === tweet.id ? null : tweet.id)}
    >
      <div className="tweet-header">
        <div className="user-mini">
          <div className="avatar-small">JD</div>
          <div>
            <p className="user-handle">John Doe</p>
            <p className="tweet-time">@johndoe • {formatDate(tweet.timestamp || tweet.scheduledTime)}</p>
          </div>
        </div>
        <button
          className="btn-delete"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteTweet(tweet.id, type);
          }}
          title="Delete tweet"
        >
          <FaTrash />
        </button>
      </div>

      <div className="tweet-body">
        <p className="tweet-content">{tweet.content}</p>
        {tweet.hashtags && tweet.hashtags.length > 0 && (
          <div className="tweet-hashtags">
            {tweet.hashtags.map((tag) => (
              <span key={tag} className="hashtag-link">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {type === 'posted' && tweet.engagements && (
        <div className="tweet-stats">
          <div className="stat">
            <span className="stat-value">{tweet.engagements.likes}</span>
            <span className="stat-label">Likes</span>
          </div>
          <div className="stat">
            <span className="stat-value">{tweet.engagements.retweets}</span>
            <span className="stat-label">Retweets</span>
          </div>
          <div className="stat">
            <span className="stat-value">{tweet.engagements.replies}</span>
            <span className="stat-label">Replies</span>
          </div>
        </div>
      )}

      {type === 'scheduled' && (
        <div className="scheduled-info">
          <FaClock className="clock-icon" />
          <span>Scheduled for {formatDate(tweet.scheduledTime)}</span>
        </div>
      )}

      {expandedTweet === tweet.id && (
        <div className="tweet-actions fade-in">
          <button className="action-btn">
            <FaReply /> Reply
          </button>
          <button className="action-btn">
            <FaRetweet /> Retweet
          </button>
          <button className="action-btn">
            <FaHeart /> Like
          </button>
          <button className="action-btn">
            <FaShare /> Share
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="posted-panel">
      <div className="panel-header">
        <h2>📊 Activity</h2>
      </div>

      <div className="tabs-bar">
        <button
          className={`tab-button ${activeTab === 'posted' ? 'active' : ''}`}
          onClick={() => setActiveTab('posted')}
        >
          Posted ({postedTweets.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'scheduled' ? 'active' : ''}`}
          onClick={() => setActiveTab('scheduled')}
        >
          Scheduled ({scheduledTweets.length})
        </button>
      </div>

      <div className="panel-body scrollable">
        {activeTab === 'posted' ? (
          postedTweets.length > 0 ? (
            <div className="tweets-container">
              {postedTweets.map((tweet) => renderTweetCard(tweet, 'posted'))}
            </div>
          ) : (
            <div className="empty-state-alt">
              <p className="empty-icon">📝</p>
              <p className="empty-title">No Posts Yet</p>
              <p className="empty-desc">Your posted tweets will appear here</p>
            </div>
          )
        ) : (
          scheduledTweets.length > 0 ? (
            <div className="tweets-container">
              {scheduledTweets.map((tweet) => renderTweetCard(tweet, 'scheduled'))}
            </div>
          ) : (
            <div className="empty-state-alt">
              <p className="empty-icon">⏰</p>
              <p className="empty-title">No Scheduled Tweets</p>
              <p className="empty-desc">Schedule tweets for later to see them here</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default PostedPanel;
