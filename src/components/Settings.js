import React from 'react';
import './Settings.css';
import './Settings.css';

function Settings() {
    const [twitterUser, setTwitterUser] = React.useState(null);
    const [linkedinUser, setLinkedinUser] = React.useState(null);

    React.useEffect(() => {
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

    const handleLogin = (platform) => {
        window.location.href = `http://localhost:4000/auth/${platform === 'linkedin' ? 'linkedin/login' : 'login'}`;
    };

    const handleLogout = (platform) => {
        if (platform === 'twitter') {
            localStorage.removeItem('twitterTokens');
            setTwitterUser(null);
        } else {
            localStorage.removeItem('linkedinTokens');
            setLinkedinUser(null);
        }
        // Force reload to update other components
        window.location.reload();
    };

    return (
        <div className="settings-page">
            <div className="settings-content">
                <h2>⚙️ Settings</h2>

                <section className="settings-section">
                    <h3>Connected Accounts</h3>
                    <p>Manage your linked social media accounts.</p>

                    <div className="accounts-list">
                        {/* Twitter Account */}
                        <div className="account-item">
                            <div className="account-info">
                                <span className="account-icon">🐦</span>
                                <div>
                                    <h4>Twitter</h4>
                                    <p>{twitterUser ? `Connected as @${twitterUser}` : 'Not connected'}</p>
                                </div>
                            </div>
                            {twitterUser ? (
                                <button className="btn-disconnect" onClick={() => handleLogout('twitter')}>
                                    Disconnect
                                </button>
                            ) : (
                                <button className="btn-connect twitter" onClick={() => handleLogin('twitter')}>
                                    Connect Twitter
                                </button>
                            )}
                        </div>

                        {/* LinkedIn Account */}
                        <div className="account-item">
                            <div className="account-info">
                                <span className="account-icon">💼</span>
                                <div>
                                    <h4>LinkedIn</h4>
                                    <p>{linkedinUser ? `Connected as ${linkedinUser}` : 'Not connected'}</p>
                                </div>
                            </div>
                            {linkedinUser ? (
                                <button className="btn-disconnect" onClick={() => handleLogout('linkedin')}>
                                    Disconnect
                                </button>
                            ) : (
                                <button className="btn-connect linkedin" onClick={() => handleLogin('linkedin')}>
                                    Connect LinkedIn
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                <section className="settings-section">
                    <h3>Preferences</h3>
                    <p>Adjust theme, notification preferences, and AI tone settings.</p>
                    <div className="preferences-placeholder">
                        <p>More settings coming soon...</p>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default Settings;
