import React from 'react';
import { FaTwitter, FaLinkedin, FaHeart, FaRetweet, FaComment, FaChartLine } from 'react-icons/fa';
import './AnalyticsPanel.css';

function AnalyticsPanel({ postedTweets }) {
    // Calculate stats from posted tweets
    const totalPosts = postedTweets.length;
    const totalLikes = postedTweets.reduce((sum, tweet) => sum + (tweet.likes || 0), 0);
    const totalRetweets = postedTweets.reduce((sum, tweet) => sum + (tweet.retweets || 0), 0);
    const totalReplies = postedTweets.reduce((sum, tweet) => sum + (tweet.replies || 0), 0);
    const totalEngagement = totalLikes + totalRetweets + totalReplies;
    const engagementRate = totalPosts > 0 ? ((totalEngagement / totalPosts) / 100 * 100).toFixed(1) : 0;

    // Platform breakdown
    const twitterPosts = postedTweets.filter(t => t.platform === 'twitter').length;
    const linkedinPosts = postedTweets.filter(t => t.platform === 'linkedin').length;

    const stats = [
        { label: 'Total Posts', value: totalPosts, icon: FaChartLine, color: 'cyan', change: '+12%' },
        { label: 'Total Engagement', value: totalEngagement, icon: FaHeart, color: 'pink', change: '+24%' },
        { label: 'Engagement Rate', value: `${engagementRate}%`, icon: FaRetweet, color: 'purple', change: '+8%' },
        { label: 'Avg. Per Post', value: totalPosts > 0 ? Math.round(totalEngagement / totalPosts) : 0, icon: FaComment, color: 'gradient', change: '+15%' },
    ];

    return (
        <div className="analytics-panel">
            <div className="analytics-content">
                <div className="analytics-header">
                    <h1 className="analytics-title">📊 Analytics Dashboard</h1>
                    <p className="analytics-subtitle">Track your social media performance</p>
                </div>

                {/* KPI Cards */}
                <div className="analytics-stats">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div key={index} className={`stat-card stat-${stat.color}`}>
                                <div className="stat-icon-wrapper">
                                    <Icon className="stat-icon" />
                                </div>
                                <div className="stat-content">
                                    <p className="stat-label">{stat.label}</p>
                                    <h2 className="stat-value">{stat.value}</h2>
                                    <span className="stat-change positive">{stat.change} vs last week</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Platform Breakdown */}
                <div className="analytics-section">
                    <h3 className="section-title">Platform Distribution</h3>
                    <div className="platform-cards">
                        <div className="platform-card twitter">
                            <FaTwitter className="platform-icon" />
                            <div className="platform-info">
                                <h4>{twitterPosts} Posts</h4>
                                <p>Twitter</p>
                            </div>
                            <div className="platform-percentage">
                                {totalPosts > 0 ? Math.round((twitterPosts / totalPosts) * 100) : 0}%
                            </div>
                        </div>
                        <div className="platform-card linkedin">
                            <FaLinkedin className="platform-icon" />
                            <div className="platform-info">
                                <h4>{linkedinPosts} Posts</h4>
                                <p>LinkedIn</p>
                            </div>
                            <div className="platform-percentage">
                                {totalPosts > 0 ? Math.round((linkedinPosts / totalPosts) * 100) : 0}%
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Performing Posts */}
                <div className="analytics-section">
                    <h3 className="section-title">Top Performing Posts</h3>
                    <div className="top-posts">
                        {postedTweets
                            .sort((a, b) => (b.likes + b.retweets + b.replies) - (a.likes + a.retweets + a.replies))
                            .slice(0, 5)
                            .map((tweet, index) => (
                                <div key={index} className="top-post-card">
                                    <div className="top-post-rank">#{index + 1}</div>
                                    <div className="top-post-content">
                                        <p>{tweet.content.substring(0, 80)}...</p>
                                        <div className="top-post-stats">
                                            <span><FaHeart /> {tweet.likes || 0}</span>
                                            <span><FaRetweet /> {tweet.retweets || 0}</span>
                                            <span><FaComment /> {tweet.replies || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        {postedTweets.length === 0 && (
                            <div className="empty-state">
                                <p>No posts yet! Start posting to see analytics.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AnalyticsPanel;
