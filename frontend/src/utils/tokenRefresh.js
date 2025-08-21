import { API_URL } from "../lib/config";
import useUserStore from "../hooks/userstore";

/**
 * Helper function to handle token refresh and retry failed requests
 * This is added to existing try-catch blocks without changing the original fetch calls
 */

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshPromise = null;

/**
 * Attempts to refresh the token and retry the original request
 * @param {Function} originalRequestFn - Function that makes the original fetch request
 * @returns {Promise<Response>} - The response from the retried request
 */
export const handleAuthErrorAndRetry = async (originalRequestFn) => {
  const { setCurrentUser, clearUser } = useUserStore.getState();
  
  // If already refreshing, wait for the existing refresh to complete
  if (isRefreshing && refreshPromise) {
    try {
      await refreshPromise;
      // After refresh completes, retry the original request
      return await originalRequestFn();
    } catch (error) {
      throw error;
    }
  }
  
  // Start the refresh process
  isRefreshing = true;
  refreshPromise = performTokenRefresh();
  
  try {
    const refreshResult = await refreshPromise;
    
    if (refreshResult.success) {
      // Update user state with new data
      if (refreshResult.user) {
        setCurrentUser(refreshResult.user);
      }
      
      // Retry the original request
      const retryResponse = await originalRequestFn();
      return retryResponse;
    } else {
      // Refresh failed - clear user and redirect
      clearUser();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new Error("Authentication failed - please login again");
    }
  } catch (error) {
    // Refresh failed - clear user and redirect
    clearUser();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw error;
  } finally {
    isRefreshing = false;
    refreshPromise = null;
  }
};

/**
 * Performs the actual token refresh
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
const performTokenRefresh = async () => {
  try {
    const refreshResponse = await fetch(`${API_URL}/api/user/refresh`, {
      method: "POST",
      credentials: "include",
    });
    
    if (refreshResponse.ok) {
      const refreshData = await refreshResponse.json();
      return { success: true, user: refreshData.user };
    } else {
      return { success: false, error: "Refresh token expired" };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Check if response indicates an auth error
 * @param {Response} response - The fetch response
 * @returns {boolean} - Whether this is an auth error
 */
export const isAuthError = (response) => {
  return response?.status === 401 || response?.status === 419;
};