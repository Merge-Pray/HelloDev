// Enhanced session management for mobile browser compatibility
import { API_URL } from "../lib/config";
import useUserStore from "../hooks/userstore";
import { isSamsungInternet, debugLoginIssue } from "./samsungBrowserDebug";

class SessionManager {
  constructor() {
    this.isValidating = false;
    this.validationPromise = null;
    this.retryCount = 0;
    this.maxRetries = 3;
  }

  // Enhanced session validation with mobile browser support
  async validateSession() {
    if (this.isValidating && this.validationPromise) {
      return this.validationPromise;
    }

    this.isValidating = true;
    this.validationPromise = this._performValidation();

    try {
      const result = await this.validationPromise;
      return result;
    } finally {
      this.isValidating = false;
      this.validationPromise = null;
    }
  }

  async _performValidation() {
    const { currentUser, setCurrentUser, clearUser } = useUserStore.getState();
    
    // For Samsung browsers, add a small delay to ensure localStorage is ready
    if (isSamsungInternet()) {
      await this._waitForLocalStorage();
    }

    // If no user in store, check localStorage directly (Samsung browser fallback)
    if (!currentUser) {
      const storedUser = await this._getStoredUserWithRetry();
      if (storedUser) {
        setCurrentUser(storedUser);
        // Continue validation with the stored user
      } else {
        return { valid: false, user: null, reason: 'no_stored_user' };
      }
    }

    // Validate with server
    try {
      const response = await this._makeAuthRequest();
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.user) {
          // Update store with fresh server data
          setCurrentUser(data.user);
          
          // For Samsung browsers, force localStorage update
          if (isSamsungInternet()) {
            await this._forceLocalStorageUpdate(data.user);
          }
          
          return { valid: true, user: data.user, reason: 'server_validated' };
        }
      }
      
      // Server validation failed
      this._clearAllAuthData();
      return { valid: false, user: null, reason: 'server_rejected' };
      
    } catch (error) {
      console.error('Session validation error:', error);
      
      // On network error, allow cached user for limited time
      if (currentUser && this._isRecentLogin(currentUser)) {
        console.log('Using cached user due to network error');
        return { valid: true, user: currentUser, reason: 'cached_fallback' };
      }
      
      this._clearAllAuthData();
      return { valid: false, user: null, reason: 'network_error' };
    }
  }

  async _waitForLocalStorage() {
    // Samsung browsers sometimes need time for localStorage to be ready
    return new Promise(resolve => {
      let attempts = 0;
      const maxAttempts = 10;
      
      const checkStorage = () => {
        try {
          const testKey = 'storage-test-' + Date.now();
          localStorage.setItem(testKey, 'test');
          const retrieved = localStorage.getItem(testKey);
          localStorage.removeItem(testKey);
          
          if (retrieved === 'test') {
            resolve();
          } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(checkStorage, 50);
          } else {
            resolve(); // Give up after max attempts
          }
        } catch (error) {
          if (attempts < maxAttempts) {
            attempts++;
            setTimeout(checkStorage, 50);
          } else {
            resolve();
          }
        }
      };
      
      checkStorage();
    });
  }

  async _getStoredUserWithRetry() {
    for (let i = 0; i < this.maxRetries; i++) {
      try {
        const stored = localStorage.getItem('user-storage');
        if (stored) {
          const parsed = JSON.parse(stored);
          const user = parsed.state?.currentUser;
          
          if (user && user._id) {
            debugLoginIssue(user);
            return user;
          }
        }
        
        // For Samsung browsers, wait a bit and try again
        if (isSamsungInternet() && i < this.maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`localStorage read attempt ${i + 1} failed:`, error);
        if (i < this.maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    }
    
    return null;
  }

  async _makeAuthRequest() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      const response = await fetch(`${API_URL}/api/user/auth-status`, {
        method: 'GET',
        credentials: 'include',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async _forceLocalStorageUpdate(user) {
    // Samsung browsers sometimes need forced localStorage updates
    try {
      const userStorage = {
        state: { currentUser: user },
        version: 0
      };
      
      localStorage.setItem('user-storage', JSON.stringify(userStorage));
      
      // Verify the write
      await new Promise(resolve => setTimeout(resolve, 50));
      const verification = localStorage.getItem('user-storage');
      
      if (!verification) {
        console.warn('Samsung browser localStorage write failed, retrying...');
        localStorage.setItem('user-storage', JSON.stringify(userStorage));
      }
    } catch (error) {
      console.error('Failed to force localStorage update:', error);
    }
  }

  _isRecentLogin(user) {
    // Allow cached user for 5 minutes on network errors
    if (!user.lastValidated) return false;
    
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    return user.lastValidated > fiveMinutesAgo;
  }

  _clearAllAuthData() {
    const { clearUser } = useUserStore.getState();
    clearUser();
    
    // Multiple cleanup attempts for Samsung browsers
    try {
      localStorage.removeItem('user-storage');
      localStorage.removeItem('auth-token');
      localStorage.removeItem('user-data');
      
      // Samsung browser sometimes needs a delay
      if (isSamsungInternet()) {
        setTimeout(() => {
          localStorage.removeItem('user-storage');
        }, 100);
      }
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }

  // Enhanced login handler with mobile browser support
  async handleLoginSuccess(userData) {
    const { setCurrentUser } = useUserStore.getState();
    
    // Add validation timestamp
    const enhancedUser = {
      ...userData,
      lastValidated: Date.now()
    };
    
    // Debug for Samsung browsers
    if (isSamsungInternet()) {
      debugLoginIssue(enhancedUser);
    }
    
    // Set user in store
    setCurrentUser(enhancedUser);
    
    // For Samsung browsers, ensure localStorage is properly written
    if (isSamsungInternet()) {
      await this._forceLocalStorageUpdate(enhancedUser);
      
      // Verify the storage worked
      setTimeout(async () => {
        const stored = await this._getStoredUserWithRetry();
        if (!stored || stored._id !== enhancedUser._id) {
          console.error('Samsung browser localStorage verification failed');
          // Try one more time
          await this._forceLocalStorageUpdate(enhancedUser);
        }
      }, 200);
    }
    
    return enhancedUser;
  }
}

// Export singleton instance
export const sessionManager = new SessionManager();

// Convenience functions
export const validateSession = () => sessionManager.validateSession();
export const handleLoginSuccess = (userData) => sessionManager.handleLoginSuccess(userData);