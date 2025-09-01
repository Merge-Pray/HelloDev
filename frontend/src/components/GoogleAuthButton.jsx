import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import useUserStore from '../hooks/userstore';
import { initializeGoogleAuth, handleGoogleSignIn } from '../lib/googleAuth';
import styles from './GoogleAuthButton.module.css';

export default function GoogleAuthButton({ text = "Sign in with Google", onSuccess, onError, width }) {
  const [isLoading, setIsLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [useNativeButton, setUseNativeButton] = useState(false);
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);

  useEffect(() => {
    const loadGoogle = async () => {
      try {
        console.log('Loading Google Auth...');
        await initializeGoogleAuth();
        console.log('Google Auth loaded successfully');
        setGoogleReady(true);
      } catch (error) {
        console.error('Failed to load Google Auth:', error);
        if (onError) onError('Failed to load Google authentication');
      }
    };

    loadGoogle();
  }, [onError]);

  const handleCredentialResponse = useCallback(async (response) => {
    setIsLoading(true);
    try {
      const result = await handleGoogleSignIn(response);
      
      if (result.success) {
        setCurrentUser({
          _id: result.data.user._id,
          username: result.data.user.username,
          nickname: result.data.user.nickname,
          avatar: result.data.user.avatar || null,
        });
        
        if (onSuccess) {
          onSuccess(result.data, result.isNewUser);
        } else {
          // Default behavior: new users go to buildprofile, existing users go to home
          navigate(result.isNewUser ? '/buildprofile' : '/home');
        }
      } else {
        if (onError) onError(result.error);
      }
    } catch (error) {
      console.error('Google authentication error:', error);
      if (onError) onError('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [setCurrentUser, onSuccess, onError, navigate]);

  useEffect(() => {
    if (!googleReady || !window.google?.accounts?.id) return;

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    console.log('Google Client ID:', clientId ? 'Present' : 'Missing');
    
    if (!clientId) {
      console.error('Google Client ID not found in environment variables');
      if (onError) onError('Google authentication not configured');
      return;
    }

    console.log('Initializing Google Auth with client ID...');
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: true,
      context: 'signin', // Kontext für bessere UX
      ux_mode: 'popup', // Popup-Modus für bessere Kontrolle
    });

    // Versuche One Tap anzuzeigen - zeigt personalisierte Buttons für eingeloggte Benutzer
    window.google.accounts.id.prompt((notification) => {
      console.log('One Tap notification:', notification);
      
      if (notification.isDisplayed()) {
        console.log('One Tap is displayed - user likely logged in to Google');
        setUseNativeButton(true);
      } else if (notification.isNotDisplayed()) {
        console.log('One Tap not displayed:', notification.getNotDisplayedReason());
        setUseNativeButton(false);
      } else if (notification.isSkippedMoment()) {
        console.log('One Tap skipped:', notification.getSkippedReason());
        setUseNativeButton(false);
      }
    });

    console.log('Google Auth initialized');
  }, [googleReady, onError, handleCredentialResponse]);

  // Effekt für das Rendern des nativen Google-Buttons
  useEffect(() => {
    if (!useNativeButton || !googleReady || !buttonRef.current) return;

    try {
      // Leere den Container
      buttonRef.current.innerHTML = '';
      
      // Rendere den nativen Google-Button
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: 'standard',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: width || 250,
        locale: 'de', // Deutsche Lokalisierung
      });

      console.log('Native Google button rendered');
    } catch (error) {
      console.error('Failed to render native Google button:', error);
      setUseNativeButton(false); // Fallback zum custom Button
    }
  }, [useNativeButton, googleReady, width]);

  const handleGoogleButtonClick = async () => {
    console.log('Google button clicked');
    setIsLoading(true);
    
    try {
      // Use the GSI renderButton method which is more reliable for localhost
      if (!googleReady || !window.google?.accounts?.id) {
        throw new Error('Google Auth not ready');
      }
      
      console.log('Creating temporary Google Sign-In button...');
      
      // Create a temporary container for the Google button
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'fixed';
      tempContainer.style.top = '-1000px';
      tempContainer.style.left = '-1000px';
      document.body.appendChild(tempContainer);
      
      // Render the Google Sign-In button
      window.google.accounts.id.renderButton(tempContainer, {
        type: 'standard',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: 250,
      });
      
      // Programmatically click the button
      setTimeout(() => {
        const googleBtn = tempContainer.querySelector('div[role="button"]');
        if (googleBtn) {
          console.log('Triggering Google Sign-In button click');
          googleBtn.click();
        } else {
          console.error('Google button not found in container');
          if (onError) onError('Google Sign-In button not available');
        }
        
        // Clean up
        document.body.removeChild(tempContainer);
      }, 100);
      
    } catch (error) {
      console.error('Google Auth error:', error);
      if (onError) onError(error.message || 'Google authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!googleReady) {
    return (
      <button className={`${styles.googleButton} ${styles.loading}`} disabled>
        <div className={styles.googleIcon}>
          <div className={styles.spinner}></div>
        </div>
        Loading Google...
      </button>
    );
  }

  // Zeige nativen Google-Button wenn verfügbar und personalisiert
  if (useNativeButton) {
    return (
      <div 
        ref={buttonRef}
        className={styles.nativeButtonContainer}
        style={width ? { width, maxWidth: width } : {}}
      />
    );
  }

  // Fallback: Custom Button
  return (
    <button
      onClick={handleGoogleButtonClick}
      disabled={isLoading}
      className={`${styles.googleButton} ${isLoading ? styles.loading : ''}`}
      type="button"
      style={width ? { width, maxWidth: width, minWidth: width } : {}}
    >
      <div className={styles.googleIcon}>
        {isLoading ? (
          <div className={styles.spinner}></div>
        ) : (
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        )}
      </div>
      {isLoading ? 'Signing in...' : text}
    </button>
  );
}
