import React, { useState, useEffect } from 'react';
import { FaHome, FaChartLine, FaCalendarAlt, FaCog, FaUser } from 'react-icons/fa';
import './Sidebar.css';

function Sidebar({ currentView, onViewChange }) {
    const [twitterUser, setTwitterUser] = useState(null);
    const [linkedinUser, setLinkedinUser] = useState(null);

    useEffect(() => {
        // Get user info from localStorage
        const twitterTokens = localStorage.getItem('twitterTokens');
        const linkedinTokens = localStorage.getItem('linkedinTokens');

        if (twitterTokens) {
            const parsed = JSON.parse(twitterTokens);
            setTwitterUser(parsed.username || 'Twitter User');
        }

        if (linkedinTokens) {
            const parsed = JSON.parse(linkedinTokens);
            setLinkedinUser(parsed.name || 'LinkedIn User');
        }
    }, []);

    const menuItems = [
        { id: 'home', icon: FaHome, label: 'Home', badge: null },
        { id: 'analytics', icon: FaChartLine, label: 'Analytics', badge: null },
        { id: 'calendar', icon: FaCalendarAlt, label: 'Calendar', badge: 'Soon' },
        { id: 'settings', icon: FaCog, label: 'Settings', badge: null },
    ];

    const userName = twitterUser || linkedinUser || 'Guest';
    const userInitial = userName.charAt(0).toUpperCase();

    return (
        <div className="sidebar">
            {/* Logo Section */}
            <div className="sidebar-header" onClick={() => onViewChange('home')} style={{ cursor: 'pointer' }}>
                <img src="/novus-logo-icon.png" alt="Novus Trend" className="sidebar-logo" />
                <h3 className="sidebar-title">Novus Trend</h3>
            </div>

            {/* Navigation Items */}
            <nav className="sidebar-nav">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;
                    const isDisabled = item.badge === 'Soon';

                    return (
                        <button
                            key={item.id}
                            className={`sidebar-item ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
                            onClick={() => !isDisabled && onViewChange(item.id)}
                            disabled={isDisabled}
                        >
                            <Icon className="sidebar-icon" />
                            <span className="sidebar-label">{item.label}</span>
                            {item.badge && <span className="sidebar-badge">{item.badge}</span>}
                        </button>
                    );
                })}
            </nav>

            {/* User Section */}
            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <div className="sidebar-avatar">{userInitial}</div>
                    <div className="sidebar-user-info">
                        <p className="sidebar-user-name">{userName}</p>
                        <p className="sidebar-user-role">Creator</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;
