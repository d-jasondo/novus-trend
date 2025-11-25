import React, { useEffect, useState, useRef } from 'react';

function OAuthCallback() {
  const [status, setStatus] = useState('Processing...');
  const [error, setError] = useState(null);
  const hasRun = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      // Prevent duplicate calls (React strict mode runs effects twice in dev)
      if (hasRun.current) return;
      hasRun.current = true;
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        const errorParam = params.get('error');

        console.log('Callback params:', { code, state, errorParam });

        if (errorParam) {
          // User cancelled the login - show a friendly message
          if (errorParam === 'access_denied') {
            setError('cancelled');
          } else {
            setError(`Twitter error: ${errorParam}`);
          }
          return;
        }

        if (!code) {
          setError('No authorization code received from Twitter');
          return;
        }

        setStatus('Exchanging authorization code for tokens...');

        // Determine if this is LinkedIn or Twitter callback
        const isLinkedIn = window.location.pathname.includes('linkedin');
        const backendEndpoint = isLinkedIn
          ? 'http://localhost:4000/auth/linkedin/callback'
          : 'http://localhost:4000/auth/callback';

        console.log(`Processing ${isLinkedIn ? 'LinkedIn' : 'Twitter'} callback...`);

        // Exchange code for tokens on the backend
        const response = await fetch(backendEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, state }),
        });

        console.log('Backend response status:', response.status);

        if (!response.ok) {
          const errData = await response.json();
          console.error('Backend error:', errData);
          throw new Error(errData.error || `HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log('Success! Tokens received:', data);

        // Store tokens in localStorage for later use (dev only; use secure storage in production)
        // Store tokens in localStorage for later use (dev only; use secure storage in production)
        const storageKey = isLinkedIn ? 'linkedinTokens' : 'twitterTokens';
        localStorage.setItem(storageKey, JSON.stringify(data));
        setStatus('✓ Authentication successful! Redirecting...');
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError(err.message || 'Authentication failed');
      }
    };

    handleCallback();
  }, []);

  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <h2>{window.location.pathname.includes('linkedin') ? 'LinkedIn' : 'Twitter'} Authentication</h2>
      {error ? (
        <div>
          {error === 'cancelled' ? (
            <div>
              <p style={{ color: '#666', fontSize: '18px' }}>✋ Authentication cancelled</p>
              <p style={{ color: '#888', fontSize: '14px', marginTop: '10px' }}>You chose not to connect your account. No worries!</p>
              <a href="/" style={{ marginTop: '20px', display: 'inline-block', padding: '10px 24px', background: 'linear-gradient(135deg, #00E5FF, #8B5CF6)', color: 'white', textDecoration: 'none', borderRadius: '24px', fontWeight: '600' }}>Return to Dashboard</a>
            </div>
          ) : (
            <div style={{ color: 'red' }}>
              <p>Error: {error}</p>
              <p style={{ fontSize: '12px', marginTop: '10px' }}>Check browser console (F12) for more details.</p>
              <a href="/" style={{ marginTop: '20px', display: 'inline-block', padding: '8px 16px', backgroundColor: '#1DA1F2', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>Go back</a>
            </div>
          )}
        </div>
      ) : (
        <p>{status}</p>
      )}
    </div>
  );
}

export default OAuthCallback;
