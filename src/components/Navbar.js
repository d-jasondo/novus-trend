import React, { useState, useEffect } from 'react';
import { FaUser, FaTimes } from 'react-icons/fa';
import { MdPublic } from 'react-icons/md';
import './Navbar.css';

function Navbar({ region, setRegion }) {
  const [showRegionMenu, setShowRegionMenu] = useState(false);
  const [twitterUser, setTwitterUser] = useState(null);
  const [linkedinUser, setLinkedinUser] = useState(null);

  useEffect(() => {
    const twitterTokens = localStorage.getItem('twitterTokens');
    const linkedinTokens = localStorage.getItem('linkedinTokens');

    if (twitterTokens) {
      const data = JSON.parse(twitterTokens);
      setTwitterUser(data.userName || `User ${data.userId?.slice(-4)}`);
    }

    if (linkedinTokens) {
      const data = JSON.parse(linkedinTokens);
      setLinkedinUser(data.userName || 'LinkedIn User');
    }
  }, []);

  const regions = ['Global', 'United States', 'India', 'United Kingdom', 'Canada', 'Australia'];

  const handleRegionSelect = (selectedRegion) => {
    setRegion(selectedRegion);
    setShowRegionMenu(false);
  };

  const handleLogin = () => {
    window.location.href = 'http://localhost:4000/auth/login';
  };

  const handleLinkedInLogin = () => {
    window.location.href = 'http://localhost:4000/auth/linkedin/login';
  };

  const handleLogoutTwitter = () => {
    localStorage.removeItem('twitterTokens');
    setTwitterUser(null);
  };

  const handleLogoutLinkedIn = () => {
    localStorage.removeItem('linkedinTokens');
    setLinkedinUser(null);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Navigation Items */}
        <div className="navbar-center">
          <div className="region-selector">
            <MdPublic className="region-icon" />
            <div className="region-dropdown">
              <button
                className="region-button"
                onClick={() => setShowRegionMenu(!showRegionMenu)}
              >
                {region} <span className="dropdown-arrow">▼</span>
              </button>
              {showRegionMenu && (
                <div className="region-menu fade-in">
                  {regions.map(r => (
                    <button
                      key={r}
                      className={`region-item ${region === r ? 'active' : ''}`}
                      onClick={() => handleRegionSelect(r)}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Info & Auth Actions */}
        <div className="navbar-right">
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>

            {/* Twitter Auth */}
            {twitterUser ? (
              <div className="user-chip twitter" style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.15), rgba(139, 92, 246, 0.15))', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', border: '1px solid rgba(0, 229, 255, 0.3)' }}>
                <span style={{ color: 'var(--primary-cyan)', fontWeight: '700' }}>🐦 {twitterUser}</span>
                <button onClick={handleLogoutTwitter} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', transition: 'all 0.3s ease' }} title="Disconnect Twitter">
                  <FaTimes />
                </button>
              </div>
            ) : (
              <button className="btn-login" onClick={handleLogin} style={{ background: 'linear-gradient(135deg, var(--primary-cyan), var(--primary-purple))', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '24px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 0 15px rgba(0, 229, 255, 0.4)', transition: 'all 0.3s ease' }}>
                <FaUser /> Connect Twitter
              </button>
            )}

            {/* LinkedIn Auth */}
            {linkedinUser ? (
              <div className="user-chip linkedin" style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'linear-gradient(135deg, rgba(255, 20, 147, 0.15), rgba(139, 92, 246, 0.15))', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', border: '1px solid rgba(255, 20, 147, 0.3)' }}>
                <span style={{ color: 'var(--primary-pink)', fontWeight: '700' }}>💼 {linkedinUser}</span>
                <button onClick={handleLogoutLinkedIn} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', transition: 'all 0.3s ease' }} title="Disconnect LinkedIn">
                  <FaTimes />
                </button>
              </div>
            ) : (
              <button className="btn-login" onClick={handleLinkedInLogin} style={{ background: 'linear-gradient(135deg, var(--primary-purple), var(--primary-pink))', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '24px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 0 15px rgba(255, 20, 147, 0.4)', transition: 'all 0.3s ease' }}>
                <FaUser /> Connect LinkedIn
              </button>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
