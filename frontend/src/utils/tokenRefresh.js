import { API_URL } from "../lib/config";
import useUserStore from "../hooks/userstore";
import { QueryClient } from "@tanstack/react-query";

let isRefreshing = false;
let refreshPromise = null;
let queryClient = null;

const getQueryClient = () => {
  if (!queryClient) {
    queryClient = new QueryClient();
  }
  return queryClient;
};

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
        getQueryClient().setQueryData(["user-profile"], refreshResult.user);
      }

      const retryResponse = await originalRequestFn();
      return retryResponse;
    } else {
      clearUser();
      localStorage.removeItem("user-storage");
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new Error("Authentication failed - please login again");
    }
  } catch (error) {
    clearUser();
    localStorage.removeItem("user-storage");
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const refreshResponse = await fetch(`${API_URL}/api/user/refresh`, {
      method: "POST",
      credentials: "include",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (refreshResponse.ok) {
      const refreshData = await refreshResponse.json();
      return { success: true, user: refreshData.user };
    } else {
      return { success: false, error: "Refresh token expired" };
    }
  } catch (error) {
    if (error.name === "AbortError") {
      return { success: false, error: "Request timeout" };
    }
    return { success: false, error: error.message };
  }
};

export const isAuthError = (response) => {
  return response?.status === 401 || response?.status === 419;
};
