import { API_URL } from './config';

// Traditional Google OAuth2 popup flow that works reliably on localhost
export const initiateGoogleSignIn = () => {
  return new Promise((resolve, reject) => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      reject(new Error('Google Client ID not configured'));
      return;
    }

    // Create OAuth2 URL
    const redirectUri = `${window.location.origin}/auth/google/callback.html`;
    const scope = 'openid email profile';
    const responseType = 'code';
    const state = Math.random().toString(36).substring(2, 15);
    
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(clientId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `response_type=${encodeURIComponent(responseType)}&` +
      `state=${encodeURIComponent(state)}&` +
      `access_type=offline&` +
      `prompt=select_account`;

    console.log('Opening Google Auth popup...');
    const popup = window.open(
      googleAuthUrl,
      'google-auth',
      'width=500,height=600,scrollbars=yes,resizable=yes,top=100,left=100'
    );

    if (!popup) {
      reject(new Error('Popup blocked. Please allow popups for this site.'));
      return;
    }

    // Store the state for verification
    sessionStorage.setItem('google_auth_state', state);

    // Listen for messages from the popup
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        console.log('Google Auth successful, received code');
        popup.close();
        resolve(event.data.code);
        window.removeEventListener('message', handleMessage);
        clearInterval(checkClosed);
      } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
        console.error('Google Auth error:', event.data.error);
        popup.close();
        reject(new Error(event.data.error || 'Google authentication failed'));
        window.removeEventListener('message', handleMessage);
        clearInterval(checkClosed);
      }
    };

    window.addEventListener('message', handleMessage);

    // Check if popup was closed manually
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        console.log('Google Auth popup closed manually');
        clearInterval(checkClosed);
        window.removeEventListener('message', handleMessage);
        reject(new Error('Authentication was cancelled'));
      }
    }, 1000);
  });
};

export const exchangeCodeForTokens = async (code) => {
  try {
    console.log('Exchanging code for tokens...');
    const response = await fetch(`${API_URL}/api/user/google-auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        code: code,
        authType: 'code' // Tell backend this is a code, not a credential
      }),
    });

    console.log('API Response status:', response.status);
    const data = await response.json();
    console.log('API Response data:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Token exchange failed');
    }

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error('Token exchange error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Keep the old credential-based function for backwards compatibility
export const handleGoogleSignIn = async (credentialResponse) => {
  try {
    console.log('Handling Google Sign-In with credentials...');
    console.log('Credential response:', credentialResponse ? 'Present' : 'Missing');
    
    const response = await fetch(`${API_URL}/api/user/google-auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        credential: credentialResponse.credential,
        authType: 'credential'
      }),
    });

    console.log('API Response status:', response.status);
    const data = await response.json();
    console.log('API Response data:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Google authentication failed');
    }

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error('Google Sign-In error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Original initializeGoogleAuth kept for GSI
export const initializeGoogleAuth = () => {
  return new Promise((resolve, reject) => {
    console.log('Checking if Google Auth is already loaded...');
    if (window.google && window.google.accounts) {
      console.log('Google Auth already loaded');
      resolve(window.google);
      return;
    }

    console.log('Loading Google Auth script...');
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log('Google Auth script loaded');
      if (window.google && window.google.accounts) {
        console.log('Google Auth object available');
        resolve(window.google);
      } else {
        console.error('Google Auth script loaded but google object not available');
        reject(new Error('Google Auth script loaded but google object not available'));
      }
    };
    script.onerror = () => {
      console.error('Failed to load Google Auth script');
      reject(new Error('Failed to load Google Auth script'));
    };
    
    document.head.appendChild(script);
  });
};
