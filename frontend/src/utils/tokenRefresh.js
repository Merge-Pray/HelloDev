import { API_URL } from "../lib/config";
import useUserStore from "../hooks/userstore";

let isRefreshing = false;
let refreshPromise = null;

export const handleAuthErrorAndRetry = async (originalRequestFn) => {
  const { setCurrentUser, clearUser } = useUserStore.getState();

  if (isRefreshing && refreshPromise) {
    try {
      await refreshPromise;

      return await originalRequestFn();
    } catch (error) {
      throw error;
    }
  }

  isRefreshing = true;
  refreshPromise = performTokenRefresh();

  try {
    const refreshResult = await refreshPromise;

    if (refreshResult.success) {
      if (refreshResult.user) {
        setCurrentUser(refreshResult.user);
      }

      const retryResponse = await originalRequestFn();
      return retryResponse;
    } else {
      clearUser();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new Error("Authentication failed - please login again");
    }
  } catch (error) {
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

export const isAuthError = (response) => {
  return response?.status === 401 || response?.status === 419;
};
