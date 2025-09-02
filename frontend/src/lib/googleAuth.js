import { API_URL } from './config';
import { authenticatedFetch } from '../utils/authenticatedFetch';

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

export const handleGoogleSignIn = async (credentialResponse) => {
  try {
    console.log('Handling Google Sign-In...');
    console.log('Credential response:', credentialResponse ? 'Present' : 'Missing');
    
    const data = await authenticatedFetch('/api/user/google-auth', {
      method: 'POST',
      body: JSON.stringify({
        credential: credentialResponse.credential,
      }),
    });

    console.log('API Response data:', data);

    return {
      success: true,
      data: data,
      isNewUser: data.isNewUser || false, // Backend sollte isNewUser direkt in den Daten zurückgeben
    };
  } catch (error) {
    console.error('Google Sign-In error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};
