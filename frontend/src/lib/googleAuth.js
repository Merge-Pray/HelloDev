import { API_URL } from './config';

export const initializeGoogleAuth = () => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.accounts) {
      resolve(window.google);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google && window.google.accounts) {
        resolve(window.google);
      } else {
        reject(new Error('Google Auth script loaded but google object not available'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load Google Auth script'));
    
    document.head.appendChild(script);
  });
};

export const handleGoogleSignIn = async (credentialResponse) => {
  try {
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

    const data = await response.json();

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
