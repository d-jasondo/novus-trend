import React from 'react';
import PostedPanel from './PostedPanel';
import './Dashboard.css'; // Reuse dashboard styles for layout consistency

function ActivityPage({ postedTweets, scheduledTweets, onDeleteTweet }) {
    // Local state for the tab in this view, if we want it independent
    // Or we can just let PostedPanel handle its internal state if it wasn't lifted.
    // Looking at PostedPanel, it takes activeTab as a prop.
    // So we need to manage that state here or pass it down.
    // Let's manage it here since it's a page-specific view state.
    const [activeTab, setActiveTab] = React.useState('posted');

    return (
        <div className="dashboard-container">
            <div className="dashboard-content" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
                <PostedPanel
                    postedTweets={postedTweets}
                    scheduledTweets={scheduledTweets}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    onDeleteTweet={onDeleteTweet}
                />
            </div>
        </div>
    );
}

export default ActivityPage;
