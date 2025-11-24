import React, { useEffect, useState } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import OAuthCallback from './components/OAuthCallback';

function App() {
  const [isCallback, setIsCallback] = useState(false);

  useEffect(() => {
    // Check if we're on the callback route
    if (window.location.pathname === '/auth/callback' || window.location.search.includes('code=')) {
      setIsCallback(true);
    }
  }, []);

  return (
    <div className="App">
      {isCallback ? <OAuthCallback /> : <Dashboard />}
    </div>
  );
}

export default App;
