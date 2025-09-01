import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import useUserStore from '../hooks/userstore';
import { initializeGoogleAuth, handleGoogleSignIn } from '../lib/googleAuth';
import styles from './GoogleAuthButton.module.css';

export default function GoogleAuthButton({ text = "Sign in with Google", onSuccess, onError }) {
  const [isLoading, setIsLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const navigate = useNavigate();
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);

  useEffect(() => {
    const loadGoogle = async () => {
      try {
        await initializeGoogleAuth();
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
          onSuccess(result.data);
        } else {
          navigate('/home');
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
    if (!clientId) {
      console.error('Google Client ID not found in environment variables');
      if (onError) onError('Google authentication not configured');
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: true,
    });
  }, [googleReady, onError, handleCredentialResponse]);

  const handleGoogleButtonClick = () => {
    if (!googleReady || !window.google?.accounts?.id) {
      if (onError) onError('Google authentication not ready');
      return;
    }

    window.google.accounts.id.prompt();
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

  return (
    <button
      onClick={handleGoogleButtonClick}
      disabled={isLoading}
      className={`${styles.googleButton} ${isLoading ? styles.loading : ''}`}
      type="button"
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
