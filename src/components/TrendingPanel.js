import React, { useState, useMemo } from 'react';
import { FaArrowUp, FaArrowDown, FaMinus, FaSearch } from 'react-icons/fa';
import './TrendingPanel.css';

function TrendingPanel({ trends, onTrendSelect, selectedTrend, region }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Technology', 'Politics', 'Entertainment', 'Sports', 'Business'];

  const filteredTrends = useMemo(() => {
    return trends.filter(trend => {
      const matchesSearch = trend.hashtag.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || trend.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [trends, searchQuery, selectedCategory]);

  const getTrendIcon = (direction) => {
    switch (direction) {
      case 'up':
        return <FaArrowUp className="trend-arrow-up" />;
      case 'down':
        return <FaArrowDown className="trend-arrow-down" />;
      default:
        return <FaMinus className="trend-arrow-stable" />;
    }
  };

  const formatVolume = (volume) => {
    if (volume >= 1000000) {
      return (volume / 1000000).toFixed(1) + 'M';
    } else if (volume >= 1000) {
      return (volume / 1000).toFixed(1) + 'K';
    }
    return volume;
  };

  return (
    <div className="trending-panel">
      <div className="panel-header">
        <h2>🔥 Trending Now</h2>
        <span className="region-badge">{region}</span>
      </div>

      <div className="search-box">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search trends..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Category Filter Tabs */}
      <div className="category-tabs">
        {categories.map((category) => (
          <button
            key={category}
            className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="panel-body scrollable">
        {filteredTrends.length > 0 ? (
          <div className="trends-list">
            {filteredTrends.map((trend) => (
              <div
                key={trend.id}
                className={`trend-item card ${selectedTrend?.id === trend.id ? 'active' : ''}`}
                onClick={() => onTrendSelect(trend)}
              >
                <div className="trend-header">
                  <div className="trend-name-section">
                    <h3 className="trend-name">{trend.hashtag}</h3>
                    <span className="trend-category-badge">{trend.category}</span>
                    <span className="trend-volume">
                      {formatVolume(trend.volume)} posts
                    </span>
                  </div>
                  <div className={`trend-indicator ${trend.trending}`}>
                    {getTrendIcon(trend.trending)}
                  </div>
                </div>

                <div className="trend-meta">
                  <span className={`trend-status ${trend.trending}`}>
                    {trend.trending === 'up'
                      ? 'Trending Up'
                      : trend.trending === 'down'
                        ? 'Trending Down'
                        : 'Stable'}
                  </span>
                </div>

                <button className="btn-suggest">
                  Suggest Content
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No trends found</p>
            <span>Try a different search or category</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default TrendingPanel;
