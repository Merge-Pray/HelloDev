import { useEffect } from 'react';
import { useLocation } from 'react-router';

const GitHubCallback = () => {
  const location = useLocation();

  useEffect(() => {
    // Parse URL parameters manually
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');

    // Verify state for security
    const storedState = sessionStorage.getItem('github_oauth_state');
    sessionStorage.removeItem('github_oauth_state');

    if (error) {
      console.error('GitHub OAuth Error:', error, errorDescription);
      // Send error to parent window
      if (window.opener) {
        window.opener.postMessage({
          type: 'GITHUB_AUTH_ERROR',
          error: errorDescription || error
        }, window.location.origin);
        window.close();
      }
      return;
    }

    if (!code) {
      console.error('No authorization code received');
      if (window.opener) {
        window.opener.postMessage({
          type: 'GITHUB_AUTH_ERROR',
          error: 'No authorization code received'
        }, window.location.origin);
        window.close();
      }
      return;
    }

    if (state !== storedState) {
      console.error('State mismatch - possible CSRF attack');
      if (window.opener) {
        window.opener.postMessage({
          type: 'GITHUB_AUTH_ERROR',
          error: 'Security verification failed'
        }, window.location.origin);
        window.close();
      }
      return;
    }

    // Send success message to parent window
    if (window.opener) {
      window.opener.postMessage({
        type: 'GITHUB_AUTH_SUCCESS',
        code: code
      }, window.location.origin);
      window.close();
    }
  }, [location.search]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h2>Authenticating with GitHub...</h2>
        <p>Please wait while we complete your authentication.</p>
      </div>
    </div>
  );
};

export default GitHubCallback;
