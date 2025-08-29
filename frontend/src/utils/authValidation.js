import { API_URL } from "../lib/config";
import useUserStore from "../hooks/userstore";

/**
 * Validates stored user data against server state on app startup
 * This helps prevent issues with stale localStorage data
 */
export const validateUserSession = async () => {
  const { currentUser, setCurrentUser, clearUser } = useUserStore.getState();
  
  // If no user in localStorage, nothing to validate
  if (!currentUser) {
    return { valid: false, user: null };
  }

  try {
    // Check authentication status with the server
    const response = await fetch(`${API_URL}/api/user/auth-status`, {
      method: 'GET',
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      
      // Server confirms we're authenticated
      if (data.success && data.user) {
        // Update localStorage with fresh user data from server
        setCurrentUser(data.user);
        return { valid: true, user: data.user };
      }
    }
    
    // If we reach here, authentication failed
    clearUser();
    localStorage.removeItem("user-storage");
    return { valid: false, user: null };
    
  } catch (error) {
    console.error('Session validation failed:', error);
    // On error, clear potentially stale data
    clearUser();
    localStorage.removeItem("user-storage");
    return { valid: false, user: null };
  }
};

/**
 * Validates if user data has required fields
 */
export const validateUserData = (user) => {
  if (!user || typeof user !== 'object') {
    return false;
  }
  
  // Check for essential user fields
  const requiredFields = ['_id', 'username', 'email'];
  return requiredFields.every(field => user[field] != null);
};

/**
 * Clean up localStorage on authentication errors
 */
export const cleanupOnAuthError = () => {
  const { clearUser } = useUserStore.getState();
  clearUser();
  localStorage.removeItem("user-storage");
  
  // Clear any other auth-related data if needed
  // You can add more cleanup here if you store other auth data
};
