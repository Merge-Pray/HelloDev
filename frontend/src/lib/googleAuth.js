import { API_URL } from './config';

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

// Neue Funktion zur Erkennung von eingeloggten Google Accounts
export const detectGoogleAccount = async () => {
  try {
    if (!window.google?.accounts?.oauth2) {
      console.log('Google OAuth2 API not available');
      return null;
    }

    // Erstelle einen OAuth2 Client für die Account-Erkennung
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: 'profile email',
      callback: () => {}, // Dummy callback
    });

    // Versuche stille Authentifizierung für eingeloggte Accounts
    return new Promise((resolve) => {
      // Diese Funktion ist experimentell und funktioniert möglicherweise nicht in allen Browsern
      if (window.google.accounts.oauth2.hasGrantedAllScopes) {
        const hasAccess = window.google.accounts.oauth2.hasGrantedAllScopes(
          localStorage.getItem('google_access_token') || '',
          'profile',
          'email'
        );
        
        if (hasAccess) {
          console.log('User has granted access to Google scopes');
          // Hier könnten wir die Benutzerinformationen abrufen
        }
      }
      
      resolve(null); // Erstmal null zurückgeben
    });
  } catch (error) {
    console.error('Error detecting Google account:', error);
    return null;
  }
};

export const handleGoogleSignIn = async (credentialResponse) => {
  try {
    console.log('Handling Google Sign-In...');
    console.log('Credential response:', credentialResponse ? 'Present' : 'Missing');
    
    const response = await fetch(`${API_URL}/api/user/google-auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        credential: credentialResponse.credential,
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
      isNewUser: response.status === 201, // 201 = new user created, 200 = existing user login
    };
  } catch (error) {
    console.error('Google Sign-In error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};
