import React, { useState, useEffect } from 'react';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';
import { MdPublic } from 'react-icons/md';
import './Navbar.css';

function Navbar({ region, setRegion }) {
  const [showRegionMenu, setShowRegionMenu] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('Guest');

  useEffect(() => {
    const tokens = localStorage.getItem('twitterTokens');
    if (tokens) {
      setIsAuthenticated(true);
      const data = JSON.parse(tokens);
      setUserName(data.userName || `User ${data.userId?.slice(-4)}`);
    }
  }, []);

  const regions = ['Global', 'United States', 'India', 'United Kingdom', 'Canada', 'Australia'];

  const handleRegionSelect = (selectedRegion) => {
    setRegion(selectedRegion);
    setShowRegionMenu(false);
  };

  const handleLogin = () => {
    // Redirect to backend OAuth login
    window.location.href = 'http://localhost:4000/auth/login';
  };

  const handleMockLogin = () => {
    // Mock login for testing (stores fake tokens)
    const mockTokens = {
      ok: true,
      userId: '1967094676152086528',
      accessToken: 'mock_access_token_' + Date.now(),
      refreshToken: 'mock_refresh_token_' + Date.now(),
      expiresIn: 7200,
      userName: 'Test User'
    };
    localStorage.setItem('twitterTokens', JSON.stringify(mockTokens));
    setIsAuthenticated(true);
    setUserName('Test User');
  };

  const handleLogout = () => {
    localStorage.removeItem('twitterTokens');
    setIsAuthenticated(false);
    setUserName('Guest');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo and Branding */}
        <div className="navbar-brand">
          <img src="/novus-logo.jpg" alt="Novus Trend Logo" className="navbar-logo" />
          <span className="navbar-title">Novus Trend</span>
        </div>

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

        {/* User Info */}
        <div className="navbar-right">
          <div className="user-info">
            <div className="user-avatar">
              <FaUser />
            </div>
            <span className="user-name">{userName}</span>
          </div>

          {isAuthenticated ? (
            <button className="btn-logout" onClick={handleLogout}>
              <FaSignOutAlt /> Logout
            </button>
          ) : (
            <button className="btn-login" onClick={handleLogin} style={{ backgroundColor: '#1DA1F2', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
              Login with Twitter
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
